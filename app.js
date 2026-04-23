/**
 * Security Audit Checker - Frontend (GitHub Pages Version)
 * Maneja el formulario y procesa la auditoría localmente
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

    console.log("📤 Procesando auditoría local:", formData);

    // UI: deshabilitar botón
    submitBtn.disabled = true;
    status.textContent = "⏳ Analizando infraestructura...";
    status.className = "status loading";

    try {
        // Simulamos un pequeño delay de procesamiento para darle realismo
        await new Promise(resolve => setTimeout(resolve, 1000));

        // ✅ Éxito (Lógica local para GitHub Pages)
        console.log("✅ Auditoría procesada exitosamente.");

        // Ocultar formulario y mostrar resultado
        form.classList.add("hidden");
        result.classList.remove("hidden");
        
        // Actualizar mensaje de éxito
        document.getElementById("resultMessage").textContent = `
            ¡Gracias ${formData.companyName}! 
            Hemos generado el análisis preliminar para ${formData.email}.
            En un entorno real, este reporte llegaría a tu casilla ahora mismo.
        `;

        // Log de auditoría para consola (Muy útil para tu perfil)
        console.log(`🎯 NUEVA AUDITORÍA GENERADA: ${formData.email} | ${formData.companyName}`);

    } catch (error) {
        console.error("❌ Error:", error.message);
        status.textContent = `❌ Error en el procesamiento local`;
        status.className = "status error";
    } finally {
        submitBtn.disabled = false;
    }
});
