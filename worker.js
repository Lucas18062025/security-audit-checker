/**
 * security-audit-checker — Cloudflare Worker + Static Assets.
 * Sirve el frontend estático y responde POST /api/submit-audit
 * (port de la Netlify Function original en netlify/functions/).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Aviso de lead al operador. Sin keys ni costo: FormSubmit reenvía a Proton.
// Requiere activación única: el primer envío dispara un mail de activación
// a NOTIFY_TO que hay que aceptar una sola vez.
const NOTIFY_TO = "lucaslean1806@proton.me";

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/api/submit-audit") {
            if (request.method !== "POST") {
                return Response.json({ error: "Method not allowed" }, { status: 405 });
            }
            let body = null;
            try {
                body = await request.json();
            } catch {
                return Response.json({ error: "JSON inválido" }, { status: 400 });
            }
            const { companyName, email, infraType, findings } = body || {};
            if (!companyName || !email || !infraType) {
                return Response.json({ error: "Faltan campos requeridos" }, { status: 400 });
            }
            if (!EMAIL_RE.test(email)) {
                return Response.json({ error: "Email inválido" }, { status: 400 });
            }
            console.log(
                `NUEVO LEAD: ${companyName} | ${email} | ${infraType} | ${new Date().toISOString()}`
            );
            let emailSent = false;
            try {
                const r = await fetch(`https://formsubmit.co/ajax/${NOTIFY_TO}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    body: JSON.stringify({
                        _subject: `Nueva auditoría: ${companyName}`,
                        _template: "table",
                        empresa: companyName,
                        email,
                        infraestructura: infraType,
                        preocupaciones: findings || "Sin detalles",
                    }),
                });
                emailSent = r.ok;
            } catch {
                emailSent = false;
            }
            return Response.json(
                {
                    success: true,
                    emailSent,
                    message: `Auditoría de ${companyName} registrada exitosamente`,
                    email,
                    timestamp: new Date().toISOString(),
                },
                { status: 200 }
            );
        }

        return env.ASSETS.fetch(request);
    },
};
