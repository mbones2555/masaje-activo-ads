# 💆 Masaje Activo — Ad Manager

> Plataforma de gestión publicitaria con IA para spas y centros de masajes. Conectada con Meta Ads y powered by Claude AI.

![Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Stack](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)
![Stack](https://img.shields.io/badge/TailwindCSS-3-38BDF8?style=flat&logo=tailwindcss)
![Stack](https://img.shields.io/badge/Claude_AI-Powered-orange?style=flat)

---

## ✨ Funcionalidades

### 🤖 IA Campaign Builder
- Escribe un prompt en español y la IA genera la campaña completa
- Incluye: nombre, objetivo, presupuesto, audiencias, ad sets, copys y CTAs
- KPIs esperados (CTR, CPL, ROAS)
- Tips de optimización del "trafficker IA"

### 📊 Analytics como Trafficker Profesional
- Dashboard con métricas en tiempo real: ROAS, CTR, CPL, frecuencia
- Embudo de conversión completo
- Comparativa por campaña y audiencia
- Tendencias semanales con gráficas

### 🔍 Análisis de Campañas con IA
- Score de salud de campaña (0-100)
- Interpretación de métricas con benchmarks colombianos
- Recomendaciones de optimización priorizadas
- Forecast: ¿escalar, optimizar o pausar?

### 🎨 Estudio Creativo
- Sube tus propios fotos y videos
- Genera prompts para Midjourney/DALL-E desde la app
- Genera copys completos (titulares, texto, CTA) con IA
- Biblioteca de creativos organizada

### 👥 Gestión de Leads CRM
- Pipeline visual: Nuevo → Contactado → Agendado → Cerrado
- Integración WhatsApp con mensaje personalizado
- Notas por lead
- Tasa de conversión del pipeline

### 📅 Calendario de Contenido IA
- Genera calendario mensual completo con IA
- Captions en español colombiano con hashtags
- Horarios óptimos de publicación
- Mix de formatos: Reels, Stories, Posts, Carousels

### 🔗 Integración Meta Ads
- Conexión con Meta Graph API
- Crea campañas directamente en Facebook/Instagram Ads
- Sync de métricas reales

---

## 🚀 Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/tuusuario/masaje-activo-ads.git
cd masaje-activo-ads

# 2. Instala dependencias
npm install

# 3. Configura variables de entorno
cp .env.example .env
# Edita .env con tus API keys

# 4. Corre en desarrollo
npm run dev

# 5. Build para producción
npm run build
```

---

## 🔑 Configuración de APIs

### Claude API (Anthropic)
1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. Crea una API key
3. Agrégala en Ajustes dentro de la app (se guarda en localStorage)

### Meta Ads API
1. Ve a [developers.facebook.com](https://developers.facebook.com/apps)
2. Crea o selecciona tu app de negocio
3. En Graph API Explorer genera un token con permisos:
   - `ads_management`
   - `ads_read`
   - `business_management`
4. El ID de tu cuenta publicitaria está en Ads Manager → Configuración

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|-----------|-----|
| React 18 | UI framework |
| Vite 5 | Build tool |
| Tailwind CSS | Estilos |
| Zustand | Estado global (con persistencia) |
| Recharts | Gráficas y analytics |
| React Dropzone | Upload de archivos |
| React Hot Toast | Notificaciones |
| Claude API | IA para campañas, análisis y creativos |
| Meta Graph API | Integración Facebook/Instagram Ads |

---

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── analytics/       # Analytics + Calendario
│   ├── campaigns/       # Gestor de campañas + AI Builder
│   ├── creative/        # Estudio creativo
│   ├── dashboard/       # Sidebar + Overview
│   ├── leads/           # CRM de leads
│   └── settings/        # Configuración
├── lib/
│   └── api.js           # Claude AI + Meta API + utilidades
├── store/
│   └── index.js         # Estado global Zustand
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🚀 Deploy

### Vercel (recomendado)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Sube la carpeta dist/ a Netlify
```

---

## 📝 Notas Importantes

- Las campañas se guardan en `localStorage` hasta conectar con Meta
- Al crear campañas en Meta, siempre se crean en estado PAUSED para revisión
- Los datos de demo son ficticios para mostrar la interfaz
- Las API keys se guardan en localStorage (no en el servidor)

---

## 📄 Licencia

MIT — Uso libre para tu negocio

---

**Hecho con ❤️ para Masaje Activo, Medellín 🇨🇴**
