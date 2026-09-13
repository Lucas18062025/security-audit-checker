# 🔐 Security Audit Checker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)

Herramienta profesional para auditoría rápida de infraestructura de seguridad. Diseñada para PyMEs y organizaciones públicas en la región NOA de Argentina.

**Sitio en vivo (canónico):** https://security-audit-checker.lucaslean1806.workers.dev/

> El frontend intenta `POST /api/submit-audit` (Worker) y, si no hay
> backend, cae a modo local con contacto directo. Los avisos llegan por
> Telegram (secrets `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` en el Worker).

---

## ✨ Características

- 🔔 **Aviso instantáneo** por Telegram ante cada lead
- ⚡ **Backend** Cloudflare Worker con validación server-side
- 🎨 **Interfaz editorial** clara y responsive
- 📧 **Captura automática de leads** para seguimiento
- 📋 **Formulario profesional** con validación
- 🔒 **Secrets** solo en el Worker (nada sensible en Git)

---

## 🛠️ Stack Técnico

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Cloudflare Worker (`worker.js`, `POST /api/submit-audit`)
- **Seguridad:** validación server-side + aviso por Telegram
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

# Servir el frontend en local (carpeta public/, sin dependencias)
npx serve public
# o: python -m http.server 8000 --directory public

# El Worker (/api) se prueba con `wrangler dev` (requiere wrangler login)
```

> La Netlify Function original quedó como referencia histórica en
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
4. Haz clic en "Solicitar análisis preliminar"
5. Recibirás confirmación de auditoría

**Los datos se registran automáticamente y el equipo se contactará para un análisis personalizado.**

---

## 🔐 Seguridad

- ✅ **Validación server-side** (campos + email) antes de registrar
- ✅ **Secrets** (`TELEGRAM_BOT_TOKEN`) solo en el Worker, nunca en Git
- ✅ **XSS**: el frontend escapa datos del usuario al renderizar
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
