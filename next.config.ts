import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar output standalone para Docker
  output: "standalone",
  // External packages for server components (for @react-pdf/renderer)
  serverExternalPackages: ["@react-pdf/renderer"],
  // Configuración de Turbopack (Next.js 16 usa Turbopack por defecto)
  turbopack: {
    // Configuración para resolver problemas con espacios en rutas
    resolveAlias: {},
    // Silenciar el warning sobre múltiples lockfiles
    root: process.cwd(),
  },
};

export default nextConfig;
