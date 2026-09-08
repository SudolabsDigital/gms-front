import { siteConfig } from "@/config/site-config";

export interface BreadcrumbItem {
  name: string;
  item?: string;
}

export interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

/**
 * Emite la lista de migas de pan (BreadcrumbList) para Schema.org.
 * Permite que Google visualice la jerarquía de rutas en las SERPs y en snippets enriquecidos.
 */
export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
        ? item.item.startsWith("http")
          ? item.item
          : `${siteConfig.url}${item.item}`
        : undefined,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
