import catalogoRaw from "@/config/catalogo-data.json";
import type {
  CatalogoData,
  CategoriaCatalogo,
  ItemCatalogo,
  SlugCategoria,
  SLUGS_CATEGORIAS,
} from "./esquema";

const catalogo: CatalogoData = catalogoRaw as CatalogoData;

/**
 * Obtiene todas las categorías de productos (excluyendo obras ejecutadas que tiene su propia sección /obras).
 */
export function obtenerCategorias(): CategoriaCatalogo[] {
  return catalogo.categorias
    .filter((c) => c.slug !== "obras-ejecutadas")
    .sort((a, b) => {
      if (a.destacado && !b.destacado) return -1;
      if (!a.destacado && b.destacado) return 1;
      return b.totalItems - a.totalItems;
    });
}

/**
 * Obtiene la información de una categoría por su slug.
 */
export function obtenerCategoriaPorSlug(slug: string): CategoriaCatalogo | undefined {
  return catalogo.categorias.find((c) => c.slug === slug);
}

/**
 * Obtiene todos los ítems de una categoría.
 */
export function obtenerItemsPorCategoria(slugCategoria: string): ItemCatalogo[] {
  return catalogo.items.filter((i) => i.categoria === slugCategoria);
}

/**
 * Obtiene los ítems filtrados por subcategoría dentro de una categoría.
 */
export function obtenerItemsPorSubcategoria(
  slugCategoria: string,
  slugSubcategoria: string
): ItemCatalogo[] {
  return catalogo.items.filter(
    (i) => i.categoria === slugCategoria && (slugSubcategoria === "todos" || i.subcategoria === slugSubcategoria)
  );
}

/**
 * Obtiene un ítem por su ID único.
 */
export function obtenerItemPorId(id: string): ItemCatalogo | undefined {
  return catalogo.items.find((i) => i.id === id);
}

/**
 * Obtiene una selección de ítems destacados para galerías o portadas.
 */
export function obtenerDestacados(limite = 12): ItemCatalogo[] {
  const destacados = catalogo.items.filter((i) => i.destacado);
  if (destacados.length >= limite) return destacados.slice(0, limite);
  return catalogo.items.slice(0, limite);
}

/**
 * Búsqueda de texto en títulos, categorías y subcategorías.
 */
export function buscarEnCatalogo(query: string, limite = 24): ItemCatalogo[] {
  if (!query || query.trim().length < 2) return [];

  const terminos = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  return catalogo.items
    .filter((item) => {
      const texto = `${item.titulo} ${item.categoria} ${item.subcategoria} ${item.subcategoriaNombre}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");

      return terminos.every((t) => texto.includes(t));
    })
    .slice(0, limite);
}

/**
 * Slugs válidos para generateStaticParams.
 */
export function obtenerSlugsCategorias(): { categoria: string }[] {
  return catalogo.categorias.map((c) => ({ categoria: c.slug }));
}
