import type { MetadataRoute } from "next";
import { leerPublicados, etiquetasUsadas } from "@/lib/blog/leer";
import { obtenerCategorias } from "@/lib/catalogo/leer";
import { obtenerTodasLasObras } from "@/lib/obras/leer";
import { siteConfig } from "@/config/site-config";

/**
 * Generador de sitemap para GMS Integra.
 *
 * Directiva DreamDev / Sudolabs SEO:
 * `lastModified` debe originarse SIEMPRE de una fecha real del contenido, nunca
 * de `new Date()`. Emitir la fecha del build le anuncia falsamente a los motores
 * que la página mutó en cada compilación, destruyendo la fiabilidad de la señal.
 * En rutas estáticas cuyo contenido reside puramente en código, se omite el campo.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const articulos = leerPublicados();
  const categoriasCatalogo = obtenerCategorias();
  const obras = obtenerTodasLasObras();

  const masReciente = (fechas: string[]) =>
    fechas.length
      ? new Date(`${fechas.reduce((a, b) => (a > b ? a : b))}T12:00:00`)
      : undefined;

  const fechaBlogMasReciente = masReciente(
    articulos.map((a) => a.actualizado ?? a.fecha)
  );

  return [
    // ── Páginas Principales ──
    {
      url: baseUrl,
      lastModified: fechaBlogMasReciente,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // ── Catálogo Arquitectónico ──
    {
      url: `${baseUrl}/catalogo`,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    ...categoriasCatalogo.map((cat) => ({
      url: `${baseUrl}/catalogo/${cat.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    // ── Obras Ejecutadas ──
    {
      url: `${baseUrl}/obras`,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    ...obras
      .filter((o) => o.destacado)
      .map((obra) => ({
        url: `${baseUrl}/obras/${obra.id}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    // ── Blog Técnico ──
    {
      url: `${baseUrl}/blog`,
      lastModified: fechaBlogMasReciente,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...articulos.map((articulo) => ({
      url: `${baseUrl}/blog/${articulo.slug}`,
      lastModified: new Date(
        `${articulo.actualizado ?? articulo.fecha}T12:00:00`
      ),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...etiquetasUsadas().map(({ etiqueta }) => ({
      url: `${baseUrl}/blog/etiqueta/${etiqueta}`,
      lastModified: masReciente(
        articulos
          .filter((a) => a.etiquetas.includes(etiqueta))
          .map((a) => a.actualizado ?? a.fecha)
      ),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    // ── Páginas Legales & Institucionales ──
    {
      url: `${baseUrl}/terminos-y-condiciones`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-de-privacidad`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
