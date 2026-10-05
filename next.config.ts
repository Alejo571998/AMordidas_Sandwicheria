import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Primera visita desde Instagram en celular: el CSS (Tailwind, ~12 KB) viaja con el HTML.
  experimental: { inlineCss: true },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
  // Las URLs del sitio anterior (HTML estático) siguen funcionando:
  // links viejos compartidos en Instagram o indexados en Google.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/pages/nuestro%20menu.html", destination: "/#menu", permanent: true },
      { source: "/pages/nuestro menu.html", destination: "/#menu", permanent: true },
      { source: "/pages/contacto.html", destination: "/#contacto", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
