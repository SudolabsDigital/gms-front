import type { Articulo } from "./esquema";

/**
 * EL MOTOR DE JERARQUÍA DEL MOSAICO.
 *
 * Decide qué artículo ocupa una baldosa grande y cuál una pequeña. La pieza
 * importante del diseño es que **la puntuación está desacoplada de su fuente**:
 * el mosaico no sabe si el orden viene de las lecturas, de la fecha o de una
 * marca manual, así que añadir el contador más adelante no toca el layout.
 *
 * Hoy no hay lecturas. Un sitio estático no puede contar nada, y el almacén
 * —Upstash Redis en la propuesta— está sin decidir. Mientras tanto puntúa la
 * recencia y el `destacado` del frontmatter, que es una jerarquía honesta: no
 * finge medir lo que no se mide.
 */

/** 1 es la baldosa grande; 3, la compacta. */
export type Nivel = 1 | 2 | 3;

export interface ArticuloEnMosaico {
  articulo: Articulo;
  puntos: number;
  nivel: Nivel;
}

/** Lecturas por slug. Lo llenará el contador cuando exista; hoy llega vacío. */
export type Lecturas = Record<string, number>;

const PESO_LECTURAS = 60;
const PESO_RECENCIA = 40;
const PESO_DESTACADO = 100;

/** Días tras los cuales la recencia deja de aportar. Un trimestre. */
const VENTANA_DE_RECENCIA = 90;

function puntosDeRecencia(fecha: string, hoy: number): number {
  const dias = (hoy - new Date(`${fecha}T12:00:00`).getTime()) / 86_400_000;
  if (dias <= 0) return PESO_RECENCIA;
  return Math.max(0, PESO_RECENCIA * (1 - dias / VENTANA_DE_RECENCIA));
}

/**
 * Las lecturas se normalizan contra el máximo, no en absoluto.
 *
 * Si no, el primer artículo que se hace viral congela el mosaico para siempre:
 * con 4 000 lecturas contra 30, ningún artículo nuevo alcanzaría nunca la
 * baldosa grande, y el blog dejaba de mostrar lo último. Normalizado, la
 * escala es relativa al blog de hoy y la recencia sigue pesando.
 */
function puntosDeLecturas(lecturas: number, maximo: number): number {
  if (maximo <= 0) return 0;
  return PESO_LECTURAS * (lecturas / maximo);
}

/**
 * El bloque que se repite en el mosaico: **seis artículos, tres filas de una
 * rejilla de seis columnas**.
 *
 *   nivel 1 → 4 columnas × 2 filas   ( 8 celdas )
 *   nivel 2 → 2 columnas × 1 fila    ( 2 celdas ) ×2, completan esas dos filas
 *   nivel 3 → 2 columnas × 1 fila    ( 2 celdas ) ×3, completan la tercera
 *
 * 8 + 2 + 2 = 12 celdas en dos filas, y 6 en la tercera. Encaja exacto, y por
 * eso el patrón se repite sin dejar huecos: el problema clásico de un mosaico
 * es que con un número arbitrario de piezas queda dentado. Lo que sobra al
 * final lo recoloca `grid-auto-flow: dense`.
 */
const TAMANO_DEL_BLOQUE = 6;

/**
 * Compone el mosaico separando **dos decisiones que antes iban juntas**:
 *
 *   · el ORDEN lo fija la cronología — lo último arriba, siempre;
 *   · el TAMAÑO lo fija la puntuación — lo más leído, más grande.
 *
 * Es un cambio de criterio, y con razón. Cuando la puntuación mandaba también
 * sobre la posición, un artículo de hace ocho meses con muchas lecturas se
 * quedaba clavado en la primera fila y lo recién publicado caía al fondo: el
 * blog dejaba de contar lo nuevo. Separándolos, la portada sigue siendo un
 * diario y la jerarquía visual sigue premiando lo que la gente lee.
 *
 * Los cupos mantienen la proporción del bloque de seis (1 grande · 2 medianas ·
 * 3 compactas), así que el mosaico tila igual aunque los tamaños caigan ahora
 * en posiciones arbitrarias. Lo que quede descolocado lo recoloca
 * `grid-auto-flow: dense`.
 */
export function componerMosaico(
  articulos: Articulo[],
  lecturas: Lecturas = {},
): ArticuloEnMosaico[] {
  const hoy = Date.now();
  const maximo = Math.max(0, ...Object.values(lecturas));

  const puntuados = articulos.map((articulo) => ({
    articulo,
    puntos:
      puntosDeLecturas(lecturas[articulo.slug] ?? 0, maximo) +
      puntosDeRecencia(articulo.fecha, hoy) +
      (articulo.destacado ? PESO_DESTACADO : 0),
  }));

  // Cupos por nivel, en la misma proporción 1 : 2 : 3 del bloque.
  const total = puntuados.length;
  const cupoNivel1 = Math.max(1, Math.ceil(total / TAMANO_DEL_BLOQUE));
  const cupoNivel2 = Math.ceil((total * 2) / TAMANO_DEL_BLOQUE);

  // El tamaño sale del puesto en la tabla de puntuación…
  const porPuntos = [...puntuados].sort(
    (a, b) => b.puntos - a.puntos || b.articulo.fecha.localeCompare(a.articulo.fecha),
  );
  const nivelPorSlug = new Map<string, Nivel>();
  porPuntos.forEach((x, puesto) => {
    const nivel: Nivel = puesto < cupoNivel1 ? 1 : puesto < cupoNivel1 + cupoNivel2 ? 2 : 3;
    nivelPorSlug.set(x.articulo.slug, nivel);
  });

  // …y el orden, de la fecha. `articulos` ya llega ordenado por `leerPublicados`.
  return puntuados.map((x) => ({
    ...x,
    nivel: nivelPorSlug.get(x.articulo.slug) ?? 3,
  }));
}

/**
 * Las clases de rejilla de cada nivel.
 *
 * Por debajo de `md` no hay mosaico: una columna. Una baldosa grande en un
 * móvil de 390 px no es jerarquía, es una imagen que ocupa toda la pantalla.
 */
export const CLASES_DE_NIVEL: Record<Nivel, string> = {
  1: "md:col-span-4 md:row-span-2",
  2: "md:col-span-2 md:row-span-1",
  3: "md:col-span-2 md:row-span-1",
};
