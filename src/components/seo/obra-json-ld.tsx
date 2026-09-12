import type { ObraItem } from "@/lib/obras/esquema";
import { siteConfig } from "@/config/site-config";

/**
 * Datos estructurados de la obra arquitectónica ejecutada.
 *
 * Modela el caso de estudio como `Article` geolocalizado en Junín / Valle del Mantaro,
 * enlazado mediante `@id` con `#organization` para consolidar autoridad técnica en Google.
 */
export default function ObraJsonLd({ obra }: { obra: ObraItem }) {
  const url = `${siteConfig.url}/obras/${obra.id}`;
  const imageUrl = obra.src.startsWith("http") ? obra.src : `${siteConfig.url}${obra.src}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: obra.titulo,
    description: `Proyecto de carpintería arquitectónica en aluminio y vidrio: ${obra.tipoNombre} ejecutado en ${obra.ubicacionDetalle}, ${obra.zonaNombre}. Materiales: ${obra.materiales.join(", ")}.`,
    image: imageUrl,
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
    contentLocation: {
      "@type": "Place",
      name: `${obra.ubicacionDetalle}, ${obra.zonaNombre}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: obra.zonaNombre,
        addressRegion: "Junín",
        addressCountry: "PE",
      },
    },
    keywords: [
      ...obra.materiales,
      obra.tipoNombre,
      obra.zonaNombre,
      "GMS Integra",
      "Carpintería de aluminio",
      "Vidrio templado",
    ].join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
