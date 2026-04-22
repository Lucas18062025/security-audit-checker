import arcjet, { shield } from "@arcjet/node";

/**
 * Netlify Function: submit-audit
 * Recibe datos de auditoría, valida con Arcjet, guarda el lead
 */

// Inicializa Arcjet
const aj = arcjet({
    key: process.env.ARCJET_KEY,
    rules: [
        shield({ mode: "LIVE" }),  // Detecta bots
    ],
});

/**
 * Handler principal
 * @param {Object} req - Request del cliente
 * @param {Object} context - Contexto de Netlify
 * @returns {Object} JSON response
 */
export default async (req, context) => {
    // Solo POST
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        // PASO 1: Arcjet verifica si es bot
        const decision = await aj.protect(req);

        if (decision.isDenied()) {
            console.warn(`⚠️ Bot detectado: ${decision.reason}`);
            return new Response(
                JSON.stringify({
                    error: "Acceso denegado. Parece un bot o solicitud sospechosa.",
                    code: "BLOCKED_BY_ARCJET",
                }),
                {
                    status: 403,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // PASO 2: Parse del body
        const body = await req.json();
        const { companyName, email, infraType, findings } = body;

        // Validación básica
        if (!companyName || !email || !infraType) {
            return new Response(
                JSON.stringify({ error: "Faltan campos requeridos" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // PASO 3: Log (en producción, guardarías en DB)
        console.log(`✅ Auditoría recibida:
      Empresa: ${companyName}
      Email: ${email}
      Tipo: ${infraType}
      Timestamp: ${new Date().toISOString()}
    `);

        // PASO 4: Respuesta exitosa
        return new Response(
            JSON.stringify({
                success: true,
                message: `Auditoría recibida de ${companyName}`,
                email: email,
                timestamp: new Date().toISOString(),
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("❌ Error:", error.message);
        return new Response(
            JSON.stringify({ error: "Error interno del servidor" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
};