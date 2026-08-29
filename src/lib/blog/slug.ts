/**
 * La normalización de slugs, en un solo sitio.
 *
 * Está aparte porque la usan tres consumidores —el generador de rutas, los
 * enlaces del índice y el validador— y basta con que uno normalice distinto
 * para producir un 404 que nadie ve hasta que un lector pincha. En español el
 * riesgo es concreto: «Inventario Farmacéutico» tiene que dar siempre
 * `inventario-farmaceutico`, con la misma regla en los tres.
 */

/** Marcas diacríticas combinantes (tildes, diéresis) tras descomponer con NFD. */
const DIACRITICOS = /[̀-ͯ]/g;

/**
 * Convierte un título en slug: sin diacríticos, en minúsculas y con guiones.
 *
 * La eñe se sustituye ANTES de normalizar, y es deliberado: `NFD` la descompone
 * en `n` + virgulilla, y el barrido de diacríticos dejaría «año» como `ano`.
 * Se resuelve primero y el resto del proceso ya no la ve.
 */
export function aSlug(texto: string): string {
  return texto
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N")
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** El slug que le corresponde a un archivo `mi-articulo.mdx`. */
export function slugDeArchivo(nombreDeArchivo: string): string {
  return nombreDeArchivo.replace(/\.mdx?$/, "");
}
