/**
 * security-audit-checker — Cloudflare Worker + Static Assets.
 * Sirve el frontend estático y responde POST /api/submit-audit
 * (port de la Netlify Function original en netlify/functions/).
 *
 * Endurecido: topes de longitud, allowlist de infraType,
 * rate-limit por IP en KV (fallback en memoria), texto Telegram
 * truncado al límite de la API y headers de seguridad en todo.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INFRA_TYPES = new Set(["on-premise", "cloud-aws", "cloud-azure", "hybrid", "other"]);

// --- Topes anti-abuso ---
const MAX_COMPANY = 100;
const MAX_EMAIL = 254;
const MAX_FINDINGS = 2000;
const MAX_BODY_BYTES = 16 * 1024;
// Telegram acepta 4096 chars por mensaje: margen de seguridad.
const MAX_TG_TEXT = 3800;

// --- Rate limit: KV (persiste entre isolates) con fallback a memoria ---
// 5 req / 10 min por IP. Sin KV (dev local) usa el Map en memoria.
const RATE_MAX = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_WINDOW_S = 10 * 60;
const hits = new Map(); // ip -> number[] (timestamps, solo fallback)

function rateLimitedMemory(ip) {
    const now = Date.now();
    const arr = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
    if (arr.length >= RATE_MAX) {
        hits.set(ip, arr);
        return true;
    }
    arr.push(now);
    hits.set(ip, arr);
    // Poda oportunista para no crecer sin cota.
    if (hits.size > 5000) {
        for (const [k, v] of hits) {
            if (v.length === 0 || now - v[v.length - 1] >= RATE_WINDOW_MS) hits.delete(k);
            if (hits.size <= 4000) break;
        }
    }
    return false;
}

async function rateLimited(env, ip) {
    const kv = env.RATE_KV;
    if (!kv) return rateLimitedMemory(ip);
    try {
        const key = `rl:${ip}`;
        const raw = await kv.get(key);
        const now = Date.now();
        const arr = raw ? JSON.parse(raw).filter((t) => now - t < RATE_WINDOW_MS) : [];
        if (arr.length >= RATE_MAX) return true;
        arr.push(now);
        await kv.put(key, JSON.stringify(arr), { expirationTtl: RATE_WINDOW_S });
        return false;
    } catch {
        // KV caído: no bloquear tráfico legítimo, cae a memoria.
        return rateLimitedMemory(ip);
    }
}

// --- Headers de seguridad (paridad con Portafolio) ---
const SEC_HEADERS = {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Origin-Agent-Cluster": "?1",
    "X-Permitted-Cross-Domain-Policies": "none",
};
// Sin 'unsafe-inline': el frontend no usa JS/CSS inline (ver app.js).
const CSP =
    "default-src 'self'; script-src 'self'; style-src 'self'; " +
    "img-src 'self' data:; connect-src 'self'; font-src 'self'; " +
    "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

function secJson(data, status = 200, extra = {}) {
    return Response.json(data, {
        status,
        headers: { ...SEC_HEADERS, "Content-Security-Policy": CSP, ...extra },
    });
}

async function secAssets(request, env) {
    const res = await env.ASSETS.fetch(request);
    const h = new Headers(res.headers);
    for (const [k, v] of Object.entries(SEC_HEADERS)) h.set(k, v);
    if ((h.get("Content-Type") || "").includes("text/html")) {
        h.set("Content-Security-Policy", CSP);
    }
    return new Response(res.body, { status: res.status, headers: h });
}

function s(v) {
    return typeof v === "string" ? v.trim() : "";
}

// Sanitización server-side (defensa en profundidad: el esc() del
// frontend no protege otros consumidores como Telegram, logs o un
// futuro panel admin). Quita < > " ' ` y controles, colapsa
// espacios y recorta a max. No se usa como validación, sino como
// limpieza antes de guardar/mostrar.
function sanitizeText(v, max) {
    let t = typeof v === "string" ? v : "";
    t = t.replace(/[\u0000-\u001F\u007F]/g, "");
    t = t.replace(/[<>"'`]/g, "");
    t = t.replace(/\s+/g, " ").trim();
    if (t.length > max) t = t.slice(0, max);
    return t;
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/api/submit-audit") {
            if (request.method !== "POST") {
                return secJson({ error: "Method not allowed" }, 405);
            }
            const ip = request.headers.get("cf-connecting-ip") || "unknown";
            if (await rateLimited(env, ip)) {
                return secJson(
                    { error: "Demasiadas solicitudes, intentá en unos minutos" },
                    429,
                    { "Retry-After": "600" }
                );
            }
            const len = Number(request.headers.get("content-length") || 0);
            if (len > MAX_BODY_BYTES) {
                return secJson({ error: "Payload demasiado grande" }, 413);
            }
            let body = null;
            try {
                body = await request.json();
            } catch {
                return secJson({ error: "JSON inválido" }, 400);
            }
            const rawCompany = s(body?.companyName);
            const email = s(body?.email);
            const rawInfra = s(body?.infraType);
            const rawFindings = s(body?.findings);
            if (!rawCompany || !email || !rawInfra) {
                return secJson({ error: "Faltan campos requeridos" }, 400);
            }
            if (rawCompany.length > MAX_COMPANY) {
                return secJson({ error: "Nombre de empresa demasiado largo (máx 100)" }, 400);
            }
            if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
                return secJson({ error: "Email inválido" }, 400);
            }
            if (!INFRA_TYPES.has(rawInfra)) {
                return secJson({ error: "Tipo de infraestructura inválido" }, 400);
            }
            if (rawFindings.length > MAX_FINDINGS) {
                return secJson({ error: "Detalle demasiado largo (máx 2000 caracteres)" }, 400);
            }
            // Limpieza antes de guardar/mostrar: sin < > " ' ` ni controles.
            const companyName = sanitizeText(rawCompany, MAX_COMPANY);
            const infraType = rawInfra;
            const details = sanitizeText(rawFindings, MAX_FINDINGS) || "Sin detalles";
            console.log(
                `NUEVO LEAD: ${companyName} | ${email} | ${infraType} | findings=${details.length}ch | ${new Date().toISOString()}`
            );
            let notified = false;
            const token = env.TELEGRAM_BOT_TOKEN;
            const chatId = env.TELEGRAM_CHAT_ID;
            if (token && chatId) {
                try {
                    let text =
                        `🎯 Nueva auditoría: ${companyName}\n` +
                        `📧 ${email}\n` +
                        `🏗️ ${infraType}\n` +
                        `📝 ${details}`;
                    if (text.length > MAX_TG_TEXT) {
                        text = text.slice(0, MAX_TG_TEXT) + "… [truncado]";
                    }
                    // Sin parse_mode: el texto viaja plano, sin parseo de HTML.
                    const r = await fetch(
                        `https://api.telegram.org/bot${token}/sendMessage`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ chat_id: chatId, text }),
                        }
                    );
                    notified = r.ok;
                } catch {
                    notified = false;
                }
            }
            return secJson(
                {
                    success: true,
                    notified,
                    message: `Auditoría de ${companyName} registrada exitosamente`,
                    email,
                    timestamp: new Date().toISOString(),
                },
                200
            );
        }

        // Colector mínimo de reportes CSP (paridad con Portafolio).
        if (url.pathname === "/api/csp-report") {
            if (request.method !== "POST") {
                return secJson({ error: "Method not allowed" }, 405);
            }
            try {
                const report = await request.json();
                console.log("[csp-report]", JSON.stringify(report).slice(0, 2000));
            } catch {
                // cuerpo vacío o inválido: igual se responde 204
            }
            return new Response(null, { status: 204, headers: { ...SEC_HEADERS } });
        }

        // Google Search Console: servir verificación con URL exacta (200, sin redirect).
        // Workers Static Assets redirige /xxx.html → /xxx (clean URLs) con 307,
        // y Google exige 200 en la URL exacta con extensión.
        if (url.pathname === "/google0cbe515c88088343.html") {
            return new Response(
                "google-site-verification: google0cbe515c88088343.html",
                { headers: { "Content-Type": "text/html; charset=utf-8", ...SEC_HEADERS } }
            );
        }

        return secAssets(request, env);
    },
};
