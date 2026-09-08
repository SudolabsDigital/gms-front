import type { Articulo } from "@/lib/blog/esquema";
import { NOMBRE_DE_ETIQUETA } from "@/lib/blog/esquema";
import { siteConfig } from "@/config/site-config";

/**
 * Datos estructurados para artículos técnicos de ingeniería y carpintería de aluminio.
 *
 * Emite `BlogPosting` con referencia mediante `@id` a `#organization` para consolidar
 * la autoría corporativa y permitir rich snippets de artículos en Google Search.
 */
export default function BlogJsonLd({ articulo }: { articulo: Articulo }) {
  const url = `${siteConfig.url}/blog/${articulo.slug}`;
  const imageUrl = articulo.portada.startsWith("http")
    ? articulo.portada
    : `${siteConfig.url}${articulo.portada}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: articulo.titulo,
    description: articulo.descripcion,
    image: imageUrl,
    datePublished: articulo.fecha,
    dateModified: articulo.actualizado ?? articulo.fecha,
    inLanguage: "es-PE",
    wordCount: articulo.palabras,
    author: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/gms-logo.webp`,
      },
    },
    keywords: articulo.etiquetas.map((e) => NOMBRE_DE_ETIQUETA[e] || e).join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
