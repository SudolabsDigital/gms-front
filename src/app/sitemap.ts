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
    /**
     * LAS 472 FICHAS DE OBRA, no las destacadas. (Son fichas de FOTO: no hay 472 obras.)
     *
     * Este bloque filtraba por `destacado`, y en el dato real hay **3 fichas destacadas de 472**: el
     * sitemap publicaba 3 URLs de obra. Las 469 restantes existían, se generaban y estaban
     * enlazadas desde `tarjeta-obra`, pero el sitio nunca se las declaró a Google.
     *
     * Se emiten todas: `/obras/[id]` no fija `dynamicParams = false`, así que las que no entran en
     * el prerender del build se sirven por ISR a demanda. `destacado` sigue decidiendo la
     * prioridad, que es para lo que sirve.
     *
     * Sin `lastModified`: el dato de obra no trae fecha real y emitir la del build le miente al
     * rastreador sobre la frescura del contenido (misma directiva que la cabecera de este archivo).
     */
    ...obras.map((obra) => ({
      url: `${baseUrl}/obras/${obra.id}`,
      changeFrequency: "monthly" as const,
      priority: obra.destacado ? 0.8 : 0.6,
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
