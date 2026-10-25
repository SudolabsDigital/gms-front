import type { GeometriaV2, PiezaPlanoV2, Posicion } from "@/features/cotizar/types";
import { medida, numero } from "@/lib/formato";

/**
 * Lo que el plano de la red dice de un insumo, para el pie y la lista de «Perfiles» (`disenos/52-brief-plano` § 5).
 *
 * Se cuenta en el PLANO, no en el despiece: el despiece consolida por insumo y medida con un solo rol, y contaba
 * «8 sitios» donde hay 4 con dos piezas cada uno (lo encontró la sonda).
 *
 * ── Lo que aquí NO se hace (`DIS-06`) ─────────────────────────────────────────────
 * Ni una medida sale de las coordenadas: cuántas piezas da un camino y cuánto mide cada una lo dicen `corte` y
 * `largos`, que manda el servidor. Lo único que se mira de las coordenadas es si dos piezas están en el mismo sitio,
 * comparando los valores que el servidor ya redondeó, sin operar con ellos.
 */

export const ORDEN_POSICION: Posicion[] = ["confirmada", "deducida", "hipotesis"];

export const ROTULO_POSICION: Record<Posicion, string> = {
  confirmada: "posición confirmada",
  deducida: "posición deducida",
  hipotesis: "hipótesis · no se corta",
};

export type LecturaDeInsumo = {
  /** Piezas físicas, contadas como se cortan: un camino por tramo da una por tramo; uno «junto», una sola */
  piezas: number;
  /** Sitios distintos del plano que ocupan */
  sitios: number;
  /** Sitios donde van dos o más, una detrás de otra */
  apilados: number;
  /** Cuántas van en el sitio más cargado (en el Puente Escondido, dos) */
  porSitio: number;
  /** Piezas por rol, solo si hay más de uno («4 portafelpa de hoja · 4 portafelpa de junta») */
  porRol: { rol: string; piezas: number }[];
  /** Cuánto mide cada pieza, en el lenguaje del taller: «8 × 140 cm». Si no se corta, es lo que mediría */
  medidas: string[];
  /** Un camino «junto»: una medida que se reparte en varios sitios (el anclaje) */
  repartida: boolean;
  /** Lo que mide la hipótesis, que no se corta: «mide 460 cm» */
  mideSinCortar: number | null;
  seCorta: boolean;
  posiciones: Posicion[];
};

/** Las piezas del plano de un insumo, sin las alojadas (que van dentro de otro) */
export function piezasUbicadas(plano: GeometriaV2, insumo: string): PiezaPlanoV2[] {
  return plano.piezas.filter((p) => p.insumo === insumo && p.forma !== "alojada");
}

export function leerInsumo(piezas: PiezaPlanoV2[]): LecturaDeInsumo {
  const sitios = new Map<string, number>();
  const porRol = new Map<string, number>();
  const cortes = new Map<string, number>();
  let total = 0;
  let mideSinCortar = 0;
  let repartida = false;

  const anotar = (firma: string, veces: number) => sitios.set(firma, (sitios.get(firma) ?? 0) + veces);
  const cortar = (rotulo: string, veces: number) => cortes.set(rotulo, (cortes.get(rotulo) ?? 0) + veces);

  for (const pieza of piezas) {
    const veces = pieza.multiplicidad;
    let deEsta = 0;

    if (pieza.forma === "camino") {
      const tramos = pieza.tramos ?? [];
      tramos.forEach((tramo) => anotar(firmaDeTramo(tramo), veces));

      if (pieza.corte === "junto") {
        deEsta = veces;
        repartida = repartida || tramos.length > 1;
        cortar(medida(pieza.largo), veces);
      } else {
        deEsta = tramos.length * veces;
        (pieza.largos ?? []).forEach((largo) => cortar(medida(largo), veces));
      }

      if (!pieza.se_corta) mideSinCortar += (pieza.largo ?? 0) * veces;
    } else if (pieza.forma === "punto") {
      const anclas = pieza.anclas ?? [];
      anclas.forEach((ancla) => anotar(JSON.stringify(ancla), veces));
      deEsta = anclas.length * veces;
    } else if (pieza.forma === "rectangulo") {
      anotar(JSON.stringify(pieza.esquinas ?? []), veces);
      deEsta = veces;
      cortar(`${numero(pieza.ancho)} × ${medida(pieza.alto)}`, veces);
    }

    total += deEsta;
    if (pieza.rol) porRol.set(pieza.rol, (porRol.get(pieza.rol) ?? 0) + deEsta);
  }

  const seCorta = piezas.some((p) => p.se_corta);

  return {
    piezas: total,
    sitios: sitios.size,
    apilados: [...sitios.values()].filter((n) => n > 1).length,
    porSitio: Math.max(0, ...sitios.values()),
    porRol: porRol.size > 1 ? lasDiferencias([...porRol.keys()]).map((rol, i) => ({ rol, piezas: [...porRol.values()][i] })) : [],
    medidas: [...cortes].map(([rotulo, n]) => `${numero(n, 0)} × ${rotulo}`),
    repartida,
    mideSinCortar: seCorta ? null : mideSinCortar,
    seCorta,
    posiciones: ORDEN_POSICION.filter((posicion) => piezas.some((p) => p.posicion === posicion)),
  };
}

/** ¿Hay algo cuya posición no esté confirmada? Entonces el plano lleva su leyenda (P3) */
export function hayDudas(plano: GeometriaV2): boolean {
  return plano.piezas.some((p) => p.posicion !== "confirmada");
}

/**
 * Lo que distingue a varios roles del mismo insumo, sin repetir lo que comparten: «portafelpa de hoja» y «portafelpa
 * de junta» → «de hoja», «de junta». El texto es el del servidor; solo se quita la parte común del principio, y la
 * preposición que la cierra se conserva para que se siga leyendo.
 */
function lasDiferencias(roles: string[]): string[] {
  const palabras = roles.map((rol) => rol.split(" "));
  const minimo = Math.min(...palabras.map((p) => p.length));
  let comunes = 0;

  while (comunes < minimo - 1 && palabras.every((p) => p[comunes] === palabras[0][comunes])) comunes++;

  if (comunes === 0) return roles;

  const nexo = ["de", "del", "en"].includes(palabras[0][comunes - 1]) ? 1 : 0;

  return palabras.map((p) => p.slice(comunes - nexo).join(" "));
}

/** Un tramo sin sentido de recorrido: «a→b» y «b→a» son el mismo sitio */
function firmaDeTramo(tramo: [number, number][]): string {
  const ida = JSON.stringify(tramo);
  const vuelta = JSON.stringify([...tramo].reverse());

  return ida < vuelta ? ida : vuelta;
}
