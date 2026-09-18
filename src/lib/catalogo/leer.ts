import catalogoRaw from "@/config/catalogo-data.json";
import taxonomiaRaw from "@/config/taxonomia-publica.json";
import type {
  CatalogoData,
  CategoriaCatalogo,
  ItemCatalogo,
  SeriePublica,
  TaxonomiaPublica,
} from "./esquema";

const catalogo: CatalogoData = catalogoRaw as CatalogoData;
const taxonomia = taxonomiaRaw as TaxonomiaPublica;

/**
 * SUBCATEGORÍAS QUE NO SALEN AL PÚBLICO.
 *
 * El catálogo se generó recorriendo las carpetas de fotos del taller, y con las fotos entraron las
 * carpetas de trabajo interno. Medido el 2026-09-10: `/catalogo/catalogo-materiales` estaba **en el
 * sitemap** y su HTML servía como texto visible los filtros «DEFECTOS SERVICIOS / DEFECTOS PUERTAS»,
 * «VIDRIOS ROTOS», «PRECIO TEMPLADO» y «COSTO TEMPLADO» — 25 fotos de reclamaciones, roturas y
 * hojas de precio, accesibles a cualquiera.
 *
 * **Esas 25 fotos y sus 50 archivos ya no existen**: se borraron el 2026-09-10 por decisión del
 * usuario, junto con sus entradas en el JSON. Siguen recuperables del historial de git.
 *
 * Esta lista se conserva de todas formas, y no es código muerto: el catálogo se REGENERA desde las
 * carpetas del taller, así que la próxima ejecución volvería a traerlas si las carpetas siguen ahí.
 * Se filtra en este módulo y no en cada página porque es el único sitio por el que pasan todos los
 * ítems —galería, búsqueda, destacados, sitemap y `/llms.txt`—: un filtro en la vista deja fuera el
 * sitemap, que es justo por donde se enteró Google. La puerta `INV-P05` de `check-tokens.mjs` avisa
 * si aparece una carpeta interna nueva.
 */
const SUBCATEGORIAS_INTERNAS = [
  /^defectos/i,
  /vidrios-rotos/i,
  /precio-templado/i,
  /costo-templado/i,
];

const esInterna = (slugSubcategoria: string) =>
  SUBCATEGORIAS_INTERNAS.some((p) => p.test(slugSubcategoria));

/**
 * NOMBRES PÚBLICOS: las carpetas del taller no salen a pantalla.
 *
 * Hasta el 2026-09-12 cada subcategoría se pintaba con su nombre de carpeta —«SERIE80», «B ACERO /
 * BARANDAS2», «OBRAS HYO / H  JAUJA»— y un mapa escrito a mano corregía una sola. Ahora cada carpeta
 * pertenece a UNA serie (u obra) de `taxonomia-publica.json`, y el ítem sale con el slug y el nombre
 * de esa serie: el filtro, la galería, la ficha y el mensaje de WhatsApp lo heredan sin tocarse.
 * Varias carpetas pueden ser una misma serie: «B ACERO» y «B ACERO / BARANDAS2» son «Acero».
 *
 * Una carpeta sin serie hace caer el build AQUÍ, además de en la puerta INV-P08: publicar un nombre
 * de carpeta en silencio es justo lo que la tabla existe para impedir.
 */
const seriePorCarpeta = new Map<string, SeriePublica>();
for (const [categoria, series] of Object.entries(taxonomia.series)) {
  for (const serie of series ?? []) {
    for (const carpeta of serie.carpetas) seriePorCarpeta.set(`${categoria}/${carpeta}`, serie);
  }
}

const carpetasSinNombre = new Set<string>();

/**
 * EL TÍTULO DE CADA FOTO ES «Foto N» DENTRO DE SU SERIE.
 *
 * El JSON trae como título el nombre del archivo: «1000073449», «IMG 20220123 WA0004»,
 * «007139f7 18bd 4fa2…», o genéricos como «Modelo / Instalación» y «B.ACERO». Medido el 2026-09-12:
 * 107 títulos distintos para 472 fotos de obra, y 298 que repetían la carpeta. Se pintaban como H1
 * de la ficha, en el `alt` y en el mensaje de WhatsApp.
 *
 * El nombre de la serie ya viaja al lado (`subcategoriaNombre`), así que el título solo tiene que
 * distinguir la foto dentro de ella. Los pocos títulos que sí describían algo («Estrella y flecha»)
 * se pierden aquí y siguen en el JSON: recuperarlos es trabajo de T4, con una taxonomía de ítems.
 */
const fotosPorSerie = new Map<string, number>();

const items: ItemCatalogo[] = catalogo.items
  .filter((i) => !esInterna(i.subcategoria))
  .map((i) => {
    const serie = seriePorCarpeta.get(`${i.categoria}/${i.subcategoria}`);
    if (!serie) {
      carpetasSinNombre.add(`${i.categoria}/${i.subcategoria}`);
      return i;
    }
    const clave = `${i.categoria}/${serie.slug}`;
    const numero = (fotosPorSerie.get(clave) ?? 0) + 1;
    fotosPorSerie.set(clave, numero);
    return { ...i, subcategoria: serie.slug, subcategoriaNombre: serie.nombre, titulo: `Foto ${numero}` };
  });

if (carpetasSinNombre.size > 0) {
  throw new Error(
    `Carpetas del catálogo sin nombre público en src/config/taxonomia-publica.json: ${[...carpetasSinNombre].join(", ")}`,
  );
}

/**
 * Los recuentos se derivan de los ÍTEMS, no del campo `total` que trae el JSON.
 *
 * Ese campo venía sobredeclarando 29 fotos repartidas en 7 categorías —`barandas` y `mamparas`
 * decían 8 de más cada una—, así que las píldoras «+N fotos» prometían material que no existía.
 * Es el mismo dato contado dos veces y en algún momento discreparon; ahora hay una sola cuenta y
 * sale de la lista real. El JSON quedó corregido, pero derivar aquí evita que vuelva a divergir
 * en la próxima regeneración.
 */
const categorias: CategoriaCatalogo[] = catalogo.categorias.map((c) => {
  const deLaCategoria = items.filter((i) => i.categoria === c.slug);
  // Las subcategorías que ve el visitante son las SERIES de la tabla, en su orden, no las carpetas.
  const subcategorias = (taxonomia.series[c.slug] ?? [])
    .map((s) => ({
      slug: s.slug,
      nombre: s.nombre,
      total: deLaCategoria.filter((i) => i.subcategoria === s.slug).length,
    }))
    .filter((s) => s.total > 0);

  return { ...c, subcategorias, totalItems: deLaCategoria.length };
});

/**
 * Obtiene todas las categorías de productos (excluyendo obras ejecutadas que tiene su propia sección /obras).
 */
export function obtenerCategorias(): CategoriaCatalogo[] {
  return categorias
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
  return categorias.find((c) => c.slug === slug);
}

/**
 * Obtiene todos los ítems de una categoría.
 */
export function obtenerItemsPorCategoria(slugCategoria: string): ItemCatalogo[] {
  return items.filter((i) => i.categoria === slugCategoria);
}

/**
 * Obtiene los ítems filtrados por subcategoría dentro de una categoría.
 */
export function obtenerItemsPorSubcategoria(
  slugCategoria: string,
  slugSubcategoria: string
): ItemCatalogo[] {
  return items.filter(
    (i) => i.categoria === slugCategoria && (slugSubcategoria === "todos" || i.subcategoria === slugSubcategoria)
  );
}

/**
 * Obtiene un ítem por su ID único.
 */
export function obtenerItemPorId(id: string): ItemCatalogo | undefined {
  return items.find((i) => i.id === id);
}

/**
 * Obtiene una selección de ítems destacados para galerías o portadas.
 */
export function obtenerDestacados(limite = 12): ItemCatalogo[] {
  const destacados = items.filter((i) => i.destacado);
  if (destacados.length >= limite) return destacados.slice(0, limite);
  return items.slice(0, limite);
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

  return items
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
  return categorias.map((c) => ({ categoria: c.slug }));
}

/**
 * IDs de items destacados para generación de rutas estáticas.
 */
export function obtenerSlugsDeItems(): { id: string }[] {
  return items.filter((i) => i.destacado).map((i) => ({ id: i.id }));
}
