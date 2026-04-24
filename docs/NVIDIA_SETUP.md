# Configuración de Nvidia API

Este documento proporciona un guía paso a paso para integrar y usar la API de Nvidia con DeepSeek v4 Pro en tu portfolio.

## 🔑 Obtener tu API Key de Nvidia

1. Visita [Nvidia Build](https://build.nvidia.com/)
2. Regístrate o inicia sesión con tu cuenta
3. Navega a la sección de API Keys
4. Crea una nueva API key y cópiala

## ⚙️ Configurar las Variables de Entorno

### En desarrollo local

1. Abre o crea el archivo `.env.local` en la raíz del proyecto
2. Agrega las siguientes variables:

```env
# Usar Nvidia como proveedor
LLM_PROVIDER=nvidia

# Tu API key de Nvidia
NVIDIA_API_KEY=tu_clave_api_aqui

# (Opcional) Especificar el modelo
# Predeterminado: deepseek-ai/deepseek-v4-pro
NVIDIA_MODEL=deepseek-ai/deepseek-v4-pro
```

3. Guarda el archivo

### En Vercel (Producción)

1. Ve al dashboard de tu proyecto en [Vercel](https://vercel.com)
2. Haz clic en **Settings** → **Environment Variables**
3. Agrega las variables:
   - `LLM_PROVIDER`: `nvidia`
   - `NVIDIA_API_KEY`: Tu clave API
   - `NVIDIA_MODEL` (opcional): `deepseek-ai/deepseek-v4-pro`

## 🚀 Usar Nvidia en tu Chat

Una vez configuradas las variables de entorno:

1. Reinicia tu servidor de desarrollo:
   ```bash
   bun run dev
   ```

2. Abre tu aplicación en [http://localhost:3000](http://localhost:3000)

3. El chat ahora usará automáticamente Nvidia/DeepSeek v4 Pro

## 🔄 Cambiar entre proveedores

Puedes fácilmente cambiar entre diferentes proveedores modificando solo la variable `LLM_PROVIDER`:

```env
# Para usar OpenRouter (default)
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=...

# Para usar OpenAI
LLM_PROVIDER=openai
OPENAI_API_KEY=...

# Para usar Nvidia
LLM_PROVIDER=nvidia
NVIDIA_API_KEY=...
```

## 📊 Modelos disponibles en Nvidia

DeepSeek v4 Pro es el modelo recomendado y predeterminado. Visita [Nvidia Build](https://build.nvidia.com/) para ver otros modelos disponibles.

## 🔧 Personalizaciones avanzadas

Si necesitas ajustar parámetros como temperatura, max_tokens, etc., edita la función `getLLMModel()` en `app/api/chat/route.ts`:

```typescript
// Ejemplo: cambiar max_tokens
max_tokens: process.env.NVIDIA_MAX_TOKENS ? 
  parseInt(process.env.NVIDIA_MAX_TOKENS) : 16384
```

## 🐛 Solución de problemas

### Error: "Nvidia API key not set"

**Solución:**
- Verifica que `NVIDIA_API_KEY` está configurada en `.env.local`
- Reinicia el servidor de desarrollo
- Verifica que la clave API es correcta en [Nvidia Build](https://build.nvidia.com/)

### Error: "Unsupported LLM provider"

**Solución:**
- Asegúrate que `LLM_PROVIDER=nvidia` está configurado
- Verifica la ortografía exacta (minúsculas)
- Reinicia el servidor

### El chat no responde

**Soluciones:**
1. Verifica los logs en la consola del navegador (F12 → Console)
2. Verifica los logs del servidor de desarrollo
3. Asegúrate que tu API key de Nvidia es válida
4. Verifica que has llegado al límite de uso (si aplica)

## 📞 Soporte

Para problemas con la API de Nvidia, visita:
- [Nvidia Build Documentation](https://build.nvidia.com/docs)
- [API Reference](https://build.nvidia.com/api-reference)

Para problemas con la integración en este proyecto:
- Abre un issue en [GitHub](https://github.com/sbarkerzamora/New-Portfolio)
