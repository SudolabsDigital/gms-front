import type { MetadataRoute } from "next";
import { leerPublicados, etiquetasUsadas } from "@/lib/blog/leer";
import { obtenerCategorias } from "@/lib/catalogo/leer";

import { obtenerTodasLasObras } from "@/lib/obras/leer";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://gmsintegra.com";
  const currentDate = new Date().toISOString();

  const articulos = leerPublicados();
  const ultimoArticulo = articulos[0]?.actualizado ?? articulos[0]?.fecha;
  const categoriasCatalogo = obtenerCategorias();
  const obras = obtenerTodasLasObras();

  return [
    // ── Páginas Principales ──
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // ── Catálogo Arquitectónico ──
    {
      url: `${baseUrl}/catalogo`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    ...categoriasCatalogo.map((cat) => ({
      url: `${baseUrl}/catalogo/${cat.slug}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    // ── Obras Ejecutadas ──
    {
      url: `${baseUrl}/obras`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    ...obras.filter((o) => o.destacado).map((obra) => ({
      url: `${baseUrl}/obras/${obra.id}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // ── Blog Técnico ──
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
    })),
    ...etiquetasUsadas().map(({ etiqueta }) => ({
      url: `${baseUrl}/blog/etiqueta/${etiqueta}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    // ── Páginas Legales & Institucionales ──
    {
      url: `${baseUrl}/terminos-y-condiciones`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/politica-de-privacidad`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
