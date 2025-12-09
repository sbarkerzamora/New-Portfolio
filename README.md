# Stephan Barker — AI Chat Landing

Interfaz de chat en modo oscuro para consultar el perfil profesional de Stephan Barker. Construido con Next.js (App Router), TailwindCSS, shadcn/ui y Vercel AI SDK usando OpenRouter.

## Requisitos
- Node 20+
- Variables en `.env.local`:
  - `OPENROUTER_API_KEY=`
  - Opcional: `OPENROUTER_SITE=https://tusitio.com`

## Instalación
```bash
npm install
```

## Desarrollo
```bash
npm run dev
# abre http://localhost:3000
```

## Build y producción
```bash
npm run build
npm run start
```

## Despliegue en Dokploy
- Usa `npm run build` y `npm run start` en el contenedor.
- Asegura `OPENROUTER_API_KEY` como secreto.
- Expón el puerto 3000.

## Estructura clave
- `app/page.tsx`: UI principal (hero, acciones rápidas, chat, footer).
- `app/api/chat/route.ts`: endpoint de chat con OpenRouter (`openai/gpt-oss-20b:free`) vía AI SDK.
- `docs/profile.json`: fuente de datos del perfil.
- `lib/profile.ts`: loader del JSON para el prompt.
