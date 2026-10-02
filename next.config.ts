import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las imágenes del diseño están alojadas temporalmente en Google.
    // TODO: descargarlas a `public/` y borrar este patrón — estas URLs caducan.
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
  },
};

export default nextConfig;
