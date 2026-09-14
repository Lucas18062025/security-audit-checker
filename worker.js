/**
 * security-audit-checker — Cloudflare Worker + Static Assets.
 * Sirve el frontend estático y responde POST /api/submit-audit
 * (port de la Netlify Function original en netlify/functions/).
 *
 * Endurecido: topes de longitud, allowlist de infraType,
 * rate-limit por IP (best-effort en memoria), texto Telegram
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

// --- Rate limit best-effort en memoria (por isolate): 5 req / 10 min por IP ---
const RATE_MAX = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map(); // ip -> number[] (timestamps)

function rateLimited(ip) {
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

// --- Headers de seguridad ---
const SEC_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
// Sin 'unsafe-inline': el frontend no usa JS/CSS inline (ver app.js).
const CSP =
    "default-src 'self'; script-src 'self'; style-src 'self'; " +
    "img-src 'self' data:; connect-src 'self'; font-src 'self'; " +
    "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

function secJson(data, status = 200, extra = {}) {
    return Response.json(data, {
        status,
        headers: { ...SEC_HEADERS, ...extra },
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

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/api/submit-audit") {
            if (request.method !== "POST") {
                return secJson({ error: "Method not allowed" }, 405);
            }
            const ip = request.headers.get("cf-connecting-ip") || "unknown";
            if (rateLimited(ip)) {
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
            const companyName = s(body?.companyName);
            const email = s(body?.email);
            const infraType = s(body?.infraType);
            const findings = s(body?.findings);
            if (!companyName || !email || !infraType) {
                return secJson({ error: "Faltan campos requeridos" }, 400);
            }
            if (companyName.length > MAX_COMPANY) {
                return secJson({ error: "Nombre de empresa demasiado largo (máx 100)" }, 400);
            }
            if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
                return secJson({ error: "Email inválido" }, 400);
            }
            if (!INFRA_TYPES.has(infraType)) {
                return secJson({ error: "Tipo de infraestructura inválido" }, 400);
            }
            if (findings.length > MAX_FINDINGS) {
                return secJson({ error: "Detalle demasiado largo (máx 2000 caracteres)" }, 400);
            }
            const details = findings || "Sin detalles";
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
