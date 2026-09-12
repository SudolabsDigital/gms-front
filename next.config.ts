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

  // Limpieza de console en producción
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Optimización de importaciones pesadas (árboles de iconos y animaciones)
  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
  },

  // Cabeceras HTTP de Seguridad y Caché Inmutable CDN para Assets
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
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
        /**
         * Solo los ARCHIVOS de `public/catalogo/`, nunca las páginas.
         *
         * La regla anterior era `/catalogo/:path*`, y Next casa por ruta: alcanzaba también al
         * HTML de `/catalogo`, `/catalogo/[categoria]` y `/catalogo/item/[id]`, que quedaban
         * `immutable` un año en navegador y CDN. Con `export const revalidate = 86400` en esas
         * mismas páginas, la revalidación diaria no llegaba nunca al visitante: cualquier
         * corrección de foto o texto era invisible para quien ya había entrado.
         */
        source: "/catalogo/:ruta*.:ext(webp|avif|png|jpe?g|gif|svg)",
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
