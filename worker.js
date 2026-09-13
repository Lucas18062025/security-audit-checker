/**
 * security-audit-checker — Cloudflare Worker + Static Assets.
 * Sirve el frontend estático y responde POST /api/submit-audit
 * (port de la Netlify Function original en netlify/functions/).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
            return Response.json(
                {
                    success: true,
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
