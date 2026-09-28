import { CAMBIO_GRANDE } from "@/features/materiales/textos";
import { medida, moneda, numero, plural, porcentaje } from "@/lib/formato";

/** Cada unidad de `variables`, con su forma de leerse y lo que acompaña al campo */
const UNIDADES: Record<string, { leer: (v: number) => string; campo: string }> = {
  dias: { leer: (v) => plural(v, "día", "días"), campo: "días" },
  "%": { leer: (v) => porcentaje(v, 3), campo: "%" },
  "S/": { leer: (v) => `${moneda(v)} por pie²`, campo: "soles por pie²" },
  cm: { leer: (v) => medida(v, "cm"), campo: "cm" },
  factor: { leer: (v) => `× ${numero(v, 3)}`, campo: "×" },
  unidad: { leer: (v) => plural(v, "unidad", "unidades"), campo: "unidades" },
  hojas: { leer: (v) => plural(v, "hoja", "hojas"), campo: "hojas" },
  paneles: { leer: (v) => plural(v, "panel", "paneles"), campo: "paneles" },
};

/** «15 días», «50 %», «S/ 1.80 por pie²», «× 1» */
export function valorLegible(valor: number, unidad: string | null): string {
  const u = unidad ? UNIDADES[unidad] : undefined;
  return u ? u.leer(valor) : numero(valor, 3);
}

/** Lo que va junto al campo del panel: la unidad del número que se escribe */
export function unidadDelCampo(unidad: string | null): string {
  return (unidad && UNIDADES[unidad]?.campo) || "";
}

/**
 * Cómo se lee un cambio antes de guardarlo, como el de un precio (`features/materiales/diferencia`): cuánto y, si es
 * más del 50 %, que parece un error de tecla. Es presentación: el valor que vale lo guarda el servidor.
 */
export function cambioDeParametro(actual: number, nuevo: number, unidad: string | null): { texto: string; grande: boolean } | null {
  if (Number.isNaN(nuevo) || nuevo === actual) return null;

  const delta = nuevo - actual;
  const signo = delta > 0 ? "+" : "−";
  const relativo = actual === 0 ? null : Math.abs(delta / actual);
  return {
    texto: `${signo}${valorLegible(Math.abs(delta), unidad)}${relativo === null || unidad === "%" ? "" : ` (${signo}${numero(relativo * 100, 0)} %)`}`,
    grande: relativo !== null && relativo > CAMBIO_GRANDE,
  };
}
