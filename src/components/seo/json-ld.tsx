export function JsonLd() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": "https://gmsintegra.com/#organization",
    "name": "GMS Integra",
    "alternateName": "GMS Integra E.I.R.L. — Ventanas y Mamparas en Huancayo",
    "url": "https://gmsintegra.com",
    "logo": "https://gmsintegra.com/gms-logo.webp",
    "image": "https://gmsintegra.com/og-image.png",
    "description": "Especialistas en diseño, fabricación e instalación de ventanas y mamparas de aluminio y vidrio templado. Fachadas integrales, puertas, barandas, techos de policarbonato y drywall en Huancayo y el Valle del Mantaro.",
    "telephone": "+51958413806",
    "email": "contacto@gmsintegra.com",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jr. Huánuco Nro. 1389",
      "addressLocality": "Huancayo",
      "addressRegion": "Junín",
      "postalCode": "12001",
      "addressCountry": "PE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -12.06513,
      "longitude": -75.20486
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "08:00",
        "closes": "19:00"
      }
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
      { "@type": "City", "name": "Lima" }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catálogo de Soluciones en Carpintería de Aluminio y Vidrio Templado",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Ventanas de Aluminio Herméticas",
            "description": "Fabricación e instalación de ventanas corredizas, proyectantes y termoacústicas en perfiles Serie 20, 25, 38 y Serie 80."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Mamparas de Cristal Templado",
            "description": "Mamparas panorámicas Serie 80 y Sistema Nova en cristal templado de seguridad de 8mm y 10mm."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Fachadas Integrales y Muros Cortina",
            "description": "Diseño e instalación de muros cortina estructurales y paneles de aluminio compuesto (ACP)."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Barandas de Acero Inoxidable y Cristal",
            "description": "Barandas de seguridad en acero AISI 304 y cristal templado para balcones, terrazas y escaleras."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Techos de Policarbonato",
            "description": "Coberturas solares de policarbonato alveolar y estructuras metálicas para intemperie andina."
          }
        }
      ]
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://gmsintegra.com/#corp",
    "name": "GMS Integra E.I.R.L.",
    "url": "https://gmsintegra.com",
    "logo": "https://gmsintegra.com/gms-logo.webp",
    "sameAs": [
      "https://www.facebook.com/profile.php?id=100089261427668",
      "https://www.instagram.com/gms_integra",
      "https://www.tiktok.com/@GMS_INTEGRA"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+51958413806",
      "contactType": "customer service",
      "availableLanguage": "Spanish",
      "areaServed": "PE"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
