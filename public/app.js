/**
 * Security Audit Checker - Frontend (Netlify canónico + fallback local)
 * Intenta POST a /.netlify/functions/submit-audit; si no hay backend
 * (mirror estático, offline), procesa local y muestra contacto directo.
 */

const form = document.getElementById("auditForm");
const status = document.getElementById("status");
const result = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");
document.getElementById("resetBtn").addEventListener("click", () => location.reload());

const DIRECT_CONTACT_HTML =
    'O contactanos directo: <a href="https://wa.me/543814764474?text=Hola%20Lucas%2C%20quiero%20una%20auditor%C3%ADa" target="_blank" rel="noopener">WhatsApp</a>' +
    ' · <a href="mailto:lucaslean1806@proton.me?subject=Consulta%20Auditor%C3%ADa">Email</a>';

function showResult(html) {
    form.classList.add("hidden");
    result.classList.remove("hidden");
    document.getElementById("resultMessage").innerHTML = html;
}

function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recolectar datos
    const formData = {
        companyName: document.getElementById("companyName").value.trim(),
        email: document.getElementById("email").value.trim(),
        infraType: document.getElementById("infraType").value,
        findings: document.getElementById("findings").value.trim() || "Sin detalles",
    };

    // UI: deshabilitar botón
    submitBtn.disabled = true;
    status.textContent = "⏳ Analizando infraestructura...";
    status.className = "status loading";

    try {
        // 1. Intentar backend (Cloudflare Worker canónico)
        const res = await fetch("/api/submit-audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            const data = await res.json();
            console.log("✅ Auditoría registrada en backend:", data.timestamp);
            const extra = data.notified
                ? "Te contactaremos a la brevedad."
                : "Quedó registrada — escribinos directo y la vemos igual.";
            showResult(
                `¡Gracias ${esc(formData.companyName)}! ` +
                `Hemos registrado el análisis preliminar para ${esc(formData.email)}. ` +
                `${extra}<br><br>${DIRECT_CONTACT_HTML}`
            );
            return;
        }
        throw new Error(`Backend respondió ${res.status}`);
    } catch (err) {
        // 2. Fallback local (mirror estático / sin backend)
        console.warn("⚠️ Sin backend, modo local:", err.message);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`🎯 AUDITORÍA LOCAL: ${formData.email} | ${formData.companyName}`);
        showResult(
            `¡Gracias ${esc(formData.companyName)}! ` +
            `Generamos el análisis preliminar para ${esc(formData.email)}.<br><br>${DIRECT_CONTACT_HTML}`
        );
    } finally {
        submitBtn.disabled = false;
    }
});
