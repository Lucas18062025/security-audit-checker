# 🔐 Security Audit Checker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)
![Arcjet](https://img.shields.io/badge/Security-Arcjet-blue)

Herramienta profesional para auditoría rápida de infraestructura de seguridad. Diseñada para PyMEs y organizaciones públicas en la región NOA de Argentina.

**Sitio en vivo (canónico):** https://security-audit-checker.lucaslean1806.workers.dev/

> El frontend intenta `POST /api/submit-audit` (Worker) y, si no hay
> backend (mirror estático), cae a modo local con contacto directo.
> Deploy histórico en Netlify dado de baja (límites de plan).
>
> **Aviso por mail:** el Worker reenvía cada lead a Proton vía FormSubmit
> (gratis, sin keys). La primera vez, FormSubmit manda un mail de
> **activación** a Proton: hay que aceptarlo una sola vez para que
> empiecen a llegar. Si un envío falla, la página igual registra y muestra
> el contacto directo.

---

## ✨ Características

- 🤖 **Protección contra bots** con Arcjet Shield
- ⚡ **Backend serverless** con Netlify Functions
- 🎨 **Interfaz cyberpunk** moderna y responsive
- 📧 **Captura automática de leads** para seguimiento
- 📋 **Formulario profesional** con validación
- 🔒 **Variables de entorno seguras** en Netlify

---

## 🛠️ Stack Técnico

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Cloudflare Worker (`worker.js`, `POST /api/submit-audit`)
- **Seguridad:** Arcjet como dependencia (activación con key pendiente)
- **Hosting:** Cloudflare Workers (deploy desde GitHub)
- **Control de versiones:** Git + GitHub

---

## 📦 Instalación Local

### Requisitos previos
- Node.js v24.15.0+
- npm 11.12.1+
- Git

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/Lucas18062025/security-audit-checker.git
cd security-audit-checker

# Instalar dependencias
npm install

# Crear archivo .env (solo si activás Arcjet con key propia)
echo "ARCJET_KEY=tu_clave_aqui" > .env

# Servir el frontend en local (carpeta public/)
npx serve public
# o: python -m http.server 8000 --directory public

# El Worker (/api) se prueba con `wrangler dev` (requiere wrangler login)
```

> La Netlify Function original quedó como referencia en
> `netlify/functions/submit-audit.js`; el backend canónico hoy es `worker.js`.

---

## 🚀 Deployment

El proyecto deploya en **Cloudflare Workers** desde GitHub
(`wrangler.toml` + `worker.js` + assets estáticos).

```bash
git push origin main
# Workers detecta el push y redeploya automáticamente
```

---

## 📋 Uso

1. Rellena el formulario con los datos de tu empresa
2. Selecciona el tipo de infraestructura
3. Describe tus preocupaciones de seguridad
4. Haz clic en "Generar Reporte Preliminary"
5. Recibirás confirmación de auditoría

**Los datos se registran automáticamente y el equipo se contactará para un análisis personalizado.**

---

## 🔐 Seguridad

- ✅ **Arcjet** como dependencia (`@arcjet/node`): el Shield se activa con
  `ARCJET_KEY` en variables de entorno de Netlify — sin key, la function
  valida y registra igual (ver `netlify/functions/submit-audit.js`)
- ✅ **Variables de entorno** protegidas en Netlify
- ✅ **HTTPS** forzado automáticamente
- ✅ **No hay almacenamiento de datos sensibles** en el navegador

---

## 📊 Logs y Monitoreo

- **Cloudflare Dashboard:** Workers & Pages → `security-audit-checker` → Observability
- **CLI:** `npx wrangler tail security-audit-checker` (requiere login)

---

## 🛣️ Roadmap

- [ ] Integración con Firebase para persistencia de datos
- [ ] Email automático al recibir auditorías
- [ ] Dashboard de leads en tiempo real
- [ ] Reportes PDF generados automáticamente
- [ ] Soporte para múltiples idiomas

---
---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios mayores:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📚 Aprendizaje

Este proyecto demuestra:
- Arquitectura serverless con Netlify Functions
- Protección contra bots con Arcjet
- CI/CD automático desde GitHub
- Captura de leads para B2B
- Diseño responsive y accesible

---

## ⭐ Si te fue útil

Si encuentras este proyecto útil, considera darle una ⭐ en GitHub.

---

**Última actualización:** Abril 2026  
**Estado:** ✅ En producción

## 📧 Contacto

**Desarrollador:** Lucas Villagra  
**Email:** lucaslean1806@proton.me  
**LinkedIn:** [lucas-villagra-cybersecurity](https://linkedin.com/in/lucas-villagra-cybersecurity)  
**GitHub:** [@Lucas18062025](https://github.com/Lucas18062025)  

---

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT** - ver el archivo [LICENSE](./LICENSE) para más detalles.
