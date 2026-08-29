import type { MetadataRoute } from "next";
import { leerPublicados, etiquetasUsadas } from "@/lib/blog/leer";
import { obtenerCategorias } from "@/lib/catalogo/leer";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://gmsintegra.com";
  const currentDate = new Date().toISOString();

  const articulos = leerPublicados();
  const ultimoArticulo = articulos[0]?.actualizado ?? articulos[0]?.fecha;
  const categoriasCatalogo = obtenerCategorias();

  return [
    // ── Páginas Principales ──
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
      images: [`${baseUrl}/opengraph-image`],
    },
    // ── Catálogo ──
    {
      url: `${baseUrl}/catalogo`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.95,
      images: [`${baseUrl}/og-image.png`],
    },
    ...categoriasCatalogo.map((cat) => ({
      url: `${baseUrl}/catalogo/${cat.slug}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      images: [`${baseUrl}${cat.portada}`],
    })),
    // ── Obras Ejecutadas ──
    {
      url: `${baseUrl}/obras`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.95,
      images: [`${baseUrl}/og-image.png`],
    },
    // ── Blog ──
    {
      url: `${baseUrl}/blog`,
      lastModified: ultimoArticulo ? new Date(`${ultimoArticulo}T12:00:00`) : new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...articulos.map((articulo) => ({
      url: `${baseUrl}/blog/${articulo.slug}`,
      lastModified: new Date(`${articulo.actualizado ?? articulo.fecha}T12:00:00`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [`${baseUrl}${articulo.portada}`],
    })),
    ...etiquetasUsadas().map(({ etiqueta }) => ({
      url: `${baseUrl}/blog/etiqueta/${etiqueta}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    // ── Secciones de Inicio ──
    {
      url: `${baseUrl}/#productos`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#series`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#faq`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#contacto`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
