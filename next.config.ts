import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/**
 * Ya NO se usan `rewrites` para /api/*.
 *
 * El rewrite reenviaba la petición al backend, pero no puede añadir cabeceras dinámicas
 * y por tanto no puede inyectar el `Authorization: Bearer` que Sanctum necesita. Ese
 * token vive en una cookie httpOnly a la que el navegador no tiene acceso desde JS.
 *
 * En su lugar hay un Route Handler catch-all en `src/app/api/[...slug]/route.ts` que
 * hace de Backend-for-Frontend: lee la cookie, inyecta la cabecera y reenvía a Laravel.
 * Sigue sin haber CORS y `BACKEND_URL` sigue sin exponerse al navegador.
 */
const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  outputFileTracingIncludes: {
    "/blog": ["content/blog/**/*.mdx"],
    "/blog/[slug]": ["content/blog/**/*.mdx"],
    "/blog/etiqueta/[tag]": ["content/blog/**/*.mdx"],
    "/sitemap.xml": ["content/blog/**/*.mdx"],
  },
  outputFileTracingExcludes: {
    "/blog/**": [".next/cache/**/*"],
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
