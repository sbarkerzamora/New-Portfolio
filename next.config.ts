import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar output standalone para Docker
  output: "standalone",
  // External packages for server components (for @react-pdf/renderer)
  serverExternalPackages: ["@react-pdf/renderer"],
  // Configuración de Turbopack (Next.js 16 usa Turbopack por defecto)
  turbopack: {
    // Configuración vacía para silenciar el warning
    // El dynamic import con ssr: false es suficiente para Three.js
  },
};

export default nextConfig;
