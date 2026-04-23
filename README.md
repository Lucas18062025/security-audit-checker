# 🔐 Security Audit Checker

![Netlify Status](https://api.netlify.com/api/v1/badges/2c7cdeac-2a53-4ad4-aca4-2f0df61d0523/deploy-status)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![Netlify Functions](https://img.shields.io/badge/Netlify-Functions-00C7B7?logo=netlify)
![Arcjet](https://img.shields.io/badge/Security-Arcjet-blue)

Herramienta profesional para auditoría rápida de infraestructura de seguridad. Diseñada para PyMEs y organizaciones públicas en la región NOA de Argentina.

**Sitio en vivo:** https://lucas18062025.github.io/security-audit-checker/

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
- **Backend:** Node.js + Netlify Functions
- **Seguridad:** Arcjet (bot detection + shield)
- **Hosting:** Netlify (CI/CD automático desde GitHub)
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

# Crear archivo .env
echo "ARCJET_KEY=tu_clave_aqui" > .env

# Iniciar servidor de desarrollo
npx netlify dev

# Abre http://localhost:8888
```

---

## 🚀 Deployment

El proyecto está configurado con **CI/CD automático** en Netlify.

### Deploy automático (desde GitHub)
```bash
git push origin main
# Netlify detecta el push y redeploya automáticamente
```

### Deploy manual
```bash
npx netlify deploy --prod
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

- ✅ **Arcjet Shield** bloquea bots y solicitudes sospechosas
- ✅ **Variables de entorno** protegidas en Netlify
- ✅ **HTTPS** forzado automáticamente
- ✅ **No hay almacenamiento de datos sensibles** en el navegador

---

## 📊 Logs y Monitoreo

Accede a los logs de funciones:
- **Netlify Dashboard:** https://app.netlify.com/sites/security-audit-checker/logs-and-metrics/functions
- **CLI:** `npx netlify logs --tail`

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
