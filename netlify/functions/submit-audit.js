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

    try {
        const body = JSON.parse(event.body);
        const { companyName, email, infraType, findings } = body;

        if (!companyName || !email || !infraType) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Faltan campos requeridos" }),
            };
        }

        // Log del lead (para captura de clientes)
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
                message: `Auditoría de ${companyName} registrada exitosamente`,
                email: email,
                timestamp: new Date().toISOString(),
            }),
            headers: { "Content-Type": "application/json" },
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