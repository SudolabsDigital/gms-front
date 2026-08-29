/**
 * EL ESQUEMA DEL BLOG — la única definición de qué puede llevar un artículo.
 *
 * Vive separado del lector y del validador a propósito: es lo que se toca al
 * añadir una etiqueta, y no debería obligar a leer el resto del motor.
 */

/**
 * Vocabulario cerrado de etiquetas.
 *
 * Cerrado, y no libre, por una razón medida en este mismo proyecto: una lista
 * blanca sin puerta se convierte en dos formas de escribir lo mismo. Aquí
 * `ventanas` y `Ventanas` serían dos archivos de etiqueta distintos, cada
 * uno con la mitad de los artículos, y nadie se entera hasta que un lector no
 * encuentra lo que buscaba.
 *
 * Añadir una etiqueta es editar este array. Ese es todo el trámite — pero es
 * un trámite, y por eso no crece sola.
 */
export const ETIQUETAS = [
  "ventanas",
  "mamparas",
  "vidrio-templado",
  "aluminio",
  "instalacion",
  "series",
  "fachadas",
  "mantenimiento",
  "normativa",
  "novedades",
] as const;

export type Etiqueta = (typeof ETIQUETAS)[number];

/** Cómo se muestra cada etiqueta. El slug manda en la URL; esto solo se lee. */
export const NOMBRE_DE_ETIQUETA: Record<Etiqueta, string> = {
  ventanas: "Ventanas",
  mamparas: "Mamparas",
  "vidrio-templado": "Vidrio Templado",
  aluminio: "Aluminio",
  instalacion: "Instalación",
  series: "Series",
  fachadas: "Fachadas",
  mantenimiento: "Mantenimiento",
  normativa: "Normativa",
  novedades: "Novedades",
};

/** Lo que se escribe a mano en la cabecera YAML de cada `.mdx`. */
export interface Frontmatter {
  titulo: string;
  descripcion: string;
  /** ISO `YYYY-MM-DD`. Ordena el blog y alimenta `lastModified` del sitemap. */
  fecha: string;
  /** ISO `YYYY-MM-DD`. Un tutorial revisado vuelve a contar como contenido fresco. */
  actualizado?: string;
  etiquetas: Etiqueta[];
  /** Ruta bajo `public/`. El validador comprueba que el archivo exista de verdad. */
  portada: string;
  /** Texto alternativo de la portada. Obligatorio: la portada se usa en el índice. */
  portadaAlt: string;
  autor: string;
  /** Agrupa artículos que se leen en orden. El orden no se puede expresar como etiqueta. */
  serie?: string;
  /** Obligatorio si hay `serie`. */
  orden?: number;
  /** Fuera del índice, del sitemap y de las rutas generadas. */
  borrador?: boolean;
  /**
   * Lo empuja a la baldosa grande del mosaico. Es el mando manual mientras el
   * contador de lecturas no exista — y después sigue valiendo para fijar un
   * artículo que interesa aunque no sea el más leído.
   */
  destacado?: boolean;
}

/** Un encabezado del artículo, para el índice lateral. */
export interface Encabezado {
  /** El `id` que pone `rehype-slug`, para que el ancla case. */
  id: string;
  texto: string;
  nivel: 2 | 3;
}

/** Lo que el motor entrega a las páginas: el frontmatter más lo derivado. */
export interface Articulo extends Frontmatter {
  /** Sale del nombre del archivo, que a su vez sale del título. Llave única de todo. */
  slug: string;
  encabezados: Encabezado[];
  minutosDeLectura: number;
  palabras: number;
}

/** Palabras por minuto para el tiempo de lectura. Lectura técnica en español. */
export const PALABRAS_POR_MINUTO = 200;

/** Dónde viven los artículos, relativo a la raíz del proyecto. */
export const DIRECTORIO_CONTENIDO = "content/blog";
