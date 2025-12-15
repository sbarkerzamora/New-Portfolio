import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar output standalone para Docker
  output: "standalone",
  // External packages for server components (for @react-pdf/renderer)
  serverExternalPackages: ["@react-pdf/renderer"],
  // Optimizaciones para el build
  swcMinify: true,
  // Deshabilitar source maps en producción para acelerar el build
  productionBrowserSourceMaps: false,
  // Optimizar imágenes
  images: {
    unoptimized: false,
  },
  // Configuración de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
};

export default nextConfig;
