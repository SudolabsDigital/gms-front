import catalogoRaw from "@/config/catalogo-data.json";
import taxonomiaRaw from "@/config/taxonomia-publica.json";
import type { SeriePublica, TaxonomiaPublica } from "@/lib/catalogo/esquema";
import type { LugarResumen, ObraItem, ObraResumen } from "./esquema";

interface RawItem {
  id: string;
  categoria: string;
  subcategoria: string;
  src: string;
  thumb: string;
  ancho: number;
  alto: number;
  destacado: boolean;
}

/** Las obras, en el orden de la tabla. Cada una agrupa una o varias carpetas del taller. */
const OBRAS_TABLA: SeriePublica[] =
  (taxonomiaRaw as TaxonomiaPublica).series["obras-ejecutadas"] ?? [];

const obraPorCarpeta = new Map(
  OBRAS_TABLA.flatMap((obra) => obra.carpetas.map((carpeta) => [carpeta, obra] as const)),
);

/** Una obra sin lugar declarado no se inventa uno: se agrupa aquí. */
const SIN_LUGAR = { slug: "otros", nombre: "Otras obras" };

const slugDeLugar = (lugar: string) =>
  lugar
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

let obrasCache: ObraItem[] | null = null;

export function obtenerTodasLasObras(): ObraItem[] {
  if (obrasCache) return obrasCache;

  const fotosPorObra = new Map<string, number>();
  const carpetasSinObra = new Set<string>();

  const fotos = (catalogoRaw.items as RawItem[])
    .filter((i) => i.categoria === "obras-ejecutadas")
    .flatMap((item, index): ObraItem[] => {
      const obra = obraPorCarpeta.get(item.subcategoria);
      if (!obra) {
        carpetasSinObra.add(item.subcategoria);
        return [];
      }
      const numero = (fotosPorObra.get(obra.slug) ?? 0) + 1;
      fotosPorObra.set(obra.slug, numero);

      // Jerarquía visual del bento: se conserva la regla por posición que ya tenía la galería.
      let nivel: 1 | 2 | 3 = 2;
      if (index === 0 || index === 4 || index === 9 || index === 15 || index === 22 || index % 12 === 0) {
        nivel = 1;
      } else if (index % 5 === 0) {
        nivel = 3;
      }

      return [
        {
          id: item.id,
          titulo: `Foto ${numero}`,
          obraSlug: obra.slug,
          obraNombre: obra.nombre,
          lugar: obra.lugar,
          lugarSlug: obra.lugar ? slugDeLugar(obra.lugar) : SIN_LUGAR.slug,
          anio: obra.anio,
          src: item.src,
          thumb: item.thumb,
          ancho: item.ancho,
          alto: item.alto,
          destacado: item.destacado,
          nivel,
        },
      ];
    });

  // Una carpeta sin obra no se publica con su nombre de carpeta ni se asigna a otra por defecto,
  // que es exactamente lo que hacía el `else` de la clasificación anterior: el build cae aquí.
  if (carpetasSinObra.size > 0) {
    throw new Error(
      `Carpetas de obra sin entrada en src/config/taxonomia-publica.json: ${[...carpetasSinObra].join(", ")}`,
    );
  }

  obrasCache = fotos;
  return obrasCache;
}

/** Las obras con fotos, en el orden de la tabla. */
export function obtenerObras(): ObraResumen[] {
  const fotos = obtenerTodasLasObras();
  return OBRAS_TABLA.map((obra) => {
    const suyas = fotos.filter((f) => f.obraSlug === obra.slug);
    return {
      slug: obra.slug,
      nombre: obra.nombre,
      lugar: obra.lugar,
      lugarSlug: obra.lugar ? slugDeLugar(obra.lugar) : SIN_LUGAR.slug,
      anio: obra.anio,
      fotos: suyas.length,
      portada: suyas[0]?.src ?? "",
    };
  }).filter((o) => o.fotos > 0);
}

/** Los lugares que declaran las carpetas, de más a menos fotos; «Otras obras» siempre al final. */
export function obtenerLugares(): LugarResumen[] {
  const obras = obtenerObras();
  const mapa = new Map<string, LugarResumen>();
  for (const obra of obras) {
    const nombre = obra.lugar ?? SIN_LUGAR.nombre;
    const actual = mapa.get(obra.lugarSlug) ?? { slug: obra.lugarSlug, nombre, obras: 0, fotos: 0 };
    actual.obras += 1;
    actual.fotos += obra.fotos;
    mapa.set(obra.lugarSlug, actual);
  }
  return [...mapa.values()].sort((a, b) => {
    if (a.slug === SIN_LUGAR.slug) return 1;
    if (b.slug === SIN_LUGAR.slug) return -1;
    return b.fotos - a.fotos;
  });
}

/**
 * Obtiene una foto de obra por su ID único.
 */
export function obtenerObraPorId(id: string): ObraItem | undefined {
  return obtenerTodasLasObras().find((o) => o.id === id);
}

/**
 * Obtiene la lista de IDs para generación de rutas estáticas.
 */
export function obtenerSlugsDeObras(): { id: string }[] {
  return obtenerTodasLasObras().map((o) => ({ id: o.id }));
}
