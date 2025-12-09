import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar output standalone para Docker
  output: "standalone",
  // External packages for server components (for @react-pdf/renderer)
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
