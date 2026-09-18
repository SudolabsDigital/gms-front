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
    headline: `${obra.obraNombre} · ${obra.titulo}`,
    // El lugar no se repite si el nombre de la obra ya lo lleva.
    description: `Fotografía de la obra ${obra.obraNombre}${obra.lugar && !obra.obraNombre.includes(obra.lugar) ? `, en ${obra.lugar}` : ""}${obra.anio ? ` (${obra.anio})` : ""}, ejecutada por GMS Integra en carpintería de aluminio y vidrio.`,
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
    /**
     * Ubicación SOLO si la carpeta la declara. Antes toda obra llevaba `addressRegion: "Junín"`,
     * también las de Lima, y un lugar deducido del nombre de carpeta; ahora sin lugar no hay bloque.
     */
    ...(obra.lugar
      ? {
          contentLocation: {
            "@type": "Place",
            name: obra.lugar,
            address: {
              "@type": "PostalAddress",
              addressLocality: obra.lugar,
              addressCountry: "PE",
            },
          },
        }
      : {}),
    keywords: [obra.obraNombre, obra.lugar, "GMS Integra", "Carpintería de aluminio", "Vidrio templado"]
      .filter(Boolean)
      .join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
