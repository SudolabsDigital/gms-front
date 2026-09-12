import { siteConfig } from "@/config/site-config";

export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HomeAndConstructionBusiness",
        "@id": `${siteConfig.url}/#organization`,
        "name": siteConfig.name,
        "alternateName": "GMS Integra E.I.R.L. — Ventanas y Mamparas en Huancayo",
        "url": siteConfig.url,
        "logo": `${siteConfig.url}/gms-logo.webp`,
        "image": `${siteConfig.url}/og-image.png`,
        "description":
          "Especialistas en diseño, fabricación e instalación de ventanas y mamparas de aluminio y vidrio templado. Fachadas integrales, puertas, barandas, techos de policarbonato y carpintería arquitectónica en Huancayo y el Valle del Mantaro.",
        "telephone": `+${siteConfig.whatsapp.numero}`,
        "email": "contacto@gmsintegra.com",
        "priceRange": "$$",
        "knowsAbout": [
          "Ventanas de aluminio herméticas",
          "Mamparas de cristal templado",
          "Fachadas integrales y muros cortina",
          "Carpintería de aluminio Serie 20, 25, 38, 80",
          "Cálculo paramétrico de carpintería de aluminio",
          "Vidrio templado y laminado de seguridad",
          "Barandas de acero inoxidable y cristal",
          "Aislamiento térmico y acústico en zonas andinas",
          "Norma Técnica Peruana NTP 399.012"
        ],
        "address": {
          "@type": "PostalAddress",
          "streetAddress": siteConfig.direccion.calle,
          "addressLocality": siteConfig.direccion.ciudad,
          "addressRegion": siteConfig.direccion.region,
          "postalCode": siteConfig.direccion.codigoPostal,
          "addressCountry": siteConfig.direccion.pais,
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": -12.06513,
          "longitude": -75.20486,
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": siteConfig.horario.diasSchema,
            "opens": siteConfig.horario.abre,
            "closes": siteConfig.horario.cierra,
          },
        ],
        "areaServed": [
          { "@type": "City", "name": "Huancayo" },
          { "@type": "City", "name": "El Tambo" },
          { "@type": "City", "name": "Chilca" },
          { "@type": "City", "name": "Concepción" },
          { "@type": "City", "name": "Jauja" },
          { "@type": "City", "name": "Chupaca" },
          { "@type": "City", "name": "San Jerónimo de Tunán" },
          { "@type": "City", "name": "Sicaya" },
          { "@type": "City", "name": "Pilcomayo" },
          { "@type": "AdministrativeArea", "name": "Valle del Mantaro" },
          { "@type": "AdministrativeArea", "name": "Junín" },
          { "@type": "City", "name": "Lima" },
        ],
        "sameAs": Object.values(siteConfig.redes).map((red) => red.url),
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": `+${siteConfig.whatsapp.numero}`,
          "contactType": "customer service",
          "availableLanguage": "Spanish",
          "areaServed": "PE",
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Catálogo de Soluciones en Carpintería de Aluminio y Vidrio Templado",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Ventanas de Aluminio Herméticas",
                "description":
                  "Fabricación e instalación de ventanas corredizas, proyectantes y termoacústicas en perfiles Serie 20, 25, 38 y Serie 80.",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Mamparas de Cristal Templado",
                "description":
                  "Mamparas panorámicas Serie 80 y Sistema Nova en cristal templado de seguridad de 8mm y 10mm.",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Fachadas Integrales y Muros Cortina",
                "description":
                  "Diseño e instalación de muros cortina estructurales y paneles de aluminio compuesto (ACP).",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Barandas de Acero Inoxidable y Cristal",
                "description":
                  "Barandas de seguridad en acero AISI 304 y cristal templado para balcones, terrazas y escaleras.",
              },
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Techos de Policarbonato",
                "description":
                  "Coberturas solares de policarbonato alveolar y estructuras metálicas para intemperie andina.",
              },
            },
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        "url": siteConfig.url,
        "name": siteConfig.name,
        "description":
          "Especialistas en ingeniería, fabricación e instalación de ventanas herméticas y mamparas de vidrio templado en Huancayo.",
        "publisher": {
          "@id": `${siteConfig.url}/#organization`,
        },
        /**
         * NO hay `potentialAction`/`SearchAction` aquí a propósito.
         *
         * Declaraba `urlTemplate: /catalogo?q={search_term_string}`, y `/catalogo` no lee ningún
         * parámetro `q`: el buscador interno no existe. Un `SearchAction` que apunta a una búsqueda
         * inexistente es una afirmación falsa en los datos estructurados, y es de las que Google
         * puede comprobar.
         *
         * Se vuelve a poner el día que exista el buscador, no antes.
         */
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
