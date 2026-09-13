/**
 * security-audit-checker — Cloudflare Worker + Static Assets.
 * Sirve el frontend estático y responde POST /api/submit-audit
 * (port de la Netlify Function original en netlify/functions/).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Aviso de lead al operador vía Telegram (mismo bot del SIEM).
// Secrets en el Worker (dashboard → Settings → Variables + Secrets):
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
// Sin secrets, el lead solo se loguea y la página muestra contacto directo.

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
            let notified = false;
            const token = env.TELEGRAM_BOT_TOKEN;
            const chatId = env.TELEGRAM_CHAT_ID;
            if (token && chatId) {
                try {
                    const text =
                        `🎯 Nueva auditoría: ${companyName}\n` +
                        `📧 ${email}\n` +
                        `🏗️ ${infraType}\n` +
                        `📝 ${findings || "Sin detalles"}`;
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
            return Response.json(
                {
                    success: true,
                    notified,
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
