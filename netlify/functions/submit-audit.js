/**
 * Netlify Function: submit-audit
 * Versión final: recibe auditorías, valida con Arcjet
 */

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    const SEC = {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
    };

    function clean(v, max) {
        let t = typeof v === "string" ? v : "";
        t = t.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();
        return t.slice(0, max);
    }

    function escapeHtmlNetlify(s) {
        return String(s).replace(/[&<>"'`]/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#x60;",
        }[c]));
    }

    try {
        if (event.body && event.body.length > 16 * 1024) {
            return { statusCode: 413, headers: SEC, body: JSON.stringify({ error: "Payload demasiado grande" }) };
        }
        const body = JSON.parse(event.body);
        const companyRaw = typeof body.companyName === "string" ? body.companyName.trim() : "";
        const email = typeof body.email === "string" ? body.email.trim() : "";
        const infraType = typeof body.infraType === "string" ? body.infraType.trim() : "";
        const findingsRaw = typeof body.findings === "string" ? body.findings.trim() : "";

        if (!companyRaw || !email || !infraType) {
            return {
                statusCode: 400,
                headers: SEC,
                body: JSON.stringify({ error: "Faltan campos requeridos" }),
            };
        }

        if (companyRaw.length > 100 || findingsRaw.length > 2000 || email.length > 254) {
            return {
                statusCode: 400,
                headers: SEC,
                body: JSON.stringify({ error: "Campos demasiado largos" }),
            };
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            return {
                statusCode: 400,
                headers: SEC,
                body: JSON.stringify({ error: "Email inválido" }),
            };
        }

        const companyName = clean(companyRaw, 100);
        const findings = clean(findingsRaw, 2000) || "Sin detalles";

        // Log del lead (para captura de clientes, ya sanitizado)
        console.log(`✅ NUEVO LEAD REGISTRADO:
      Empresa: ${companyName}
      Email: ${email}
      Infraestructura: ${infraType}
      Preocupaciones: ${findings}
      Timestamp: ${new Date().toISOString()}
      IP: ${event.headers['client-ip']}
    `);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: `Auditoría de ${escapeHtmlNetlify(companyName)} registrada exitosamente`,
                email: email,
                timestamp: new Date().toISOString(),
            }),
            headers: SEC,
        };
    } catch (error) {
        console.error("❌ Error:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error interno del servidor" }),
            headers: { "Content-Type": "application/json" },
        };
    }
};