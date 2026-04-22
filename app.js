/**
 * Security Audit Checker - Frontend
 * Maneja el formulario y la llamada a Netlify Functions
 */

const form = document.getElementById("auditForm");
const status = document.getElementById("status");
const result = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recolectar datos
    const formData = {
        companyName: document.getElementById("companyName").value,
        email: document.getElementById("email").value,
        infraType: document.getElementById("infraType").value,
        findings: document.getElementById("findings").value || "Sin detalles",
    };

    console.log("📤 Enviando datos:", formData);

    // UI: desabilitar botón
    submitBtn.disabled = true;
    status.textContent = "⏳ Procesando...";
    status.className = "status loading";

    try {
        // Llamar a la función serverless
        const response = await fetch("/.netlify/functions/submit-audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Error desconocido");
        }

        // ✅ Éxito
        console.log("✅ Respuesta:", data);

        // Mostrar resultado
        document.getElementById("auditForm").classList.add("hidden");
        result.classList.remove("hidden");
        document.getElementById("resultMessage").textContent = `
      ¡Gracias ${formData.companyName}! 
      Hemos recibido tu solicitud en ${formData.email}.
      En breve te contactaremos con un análisis personalizado.
    `;

        // Log para captura de leads
        console.log(`🎯 NUEVO LEAD: ${formData.email} | ${formData.companyName}`);
    } catch (error) {
        console.error("❌ Error:", error.message);
        status.textContent = `❌ ${error.message}`;
        status.className = "status error";
    } finally {
        submitBtn.disabled = false;
    }
});