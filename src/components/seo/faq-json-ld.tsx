import { siteConfig } from "@/config/site-config";
import { FAQS_VENDIBLES } from "@/config/faq-data";

/**
 * `FAQPage` Schema.org para la portada institucional.
 *
 * Lee directamente de la misma fuente de verdad que renderiza el acordeón UI.
 * Esto garantiza que los motores de búsqueda (y LLMs) citen exactamente las
 * mismas respuestas que el usuario visualiza en pantalla.
 */
export default function FaqJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteConfig.url}/#faq`,
    inLanguage: "es-PE",
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    mainEntity: FAQS_VENDIBLES.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
