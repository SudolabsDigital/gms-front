import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/**
 * Configuración de Producción & Optimización para GMS Integra.
 * Compatible tanto con Vercel Edge como con Firebase App Hosting.
 */
const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Optimización de imágenes (AVIF + WebP con TTL de 1 año)
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Inclusión explícita de archivos MDX para SSR / SSG
  outputFileTracingIncludes: {
    "/blog": ["content/blog/**/*.mdx"],
    "/blog/[slug]": ["content/blog/**/*.mdx"],
    "/blog/etiqueta/[tag]": ["content/blog/**/*.mdx"],
    "/sitemap.xml": ["content/blog/**/*.mdx"],
  },
  outputFileTracingExcludes: {
    "/blog/**": [".next/cache/**/*"],
  },

  // Cabeceras HTTP de Seguridad y Caché Inmutable CDN para Assets
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/catalogo/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    // Turbopack compatibility: plugins are declared by name strings
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
