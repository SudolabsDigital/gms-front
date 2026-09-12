import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site-config";

/**
 * `host` y `sitemap` derivan de `siteConfig.url` y no se escriben a mano.
 *
 * Estaban fijados al apex mientras Vercel sirve `www`: el sitemap se anunciaba en una URL que
 * responde 308, y `host` declaraba como preferido justo el dominio que redirige.
 *
 * Las zonas del ERP se listan aquí Y llevan `noindex` en su propia página: `robots.txt` impide el
 * rastreo pero no la indexación —una URL bloqueada que alguien enlace puede indexarse sin que
 * Google llegue nunca a leer el `noindex`—. Las dos barreras cubren huecos distintos.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/login", "/inicio", "/plantillas"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
