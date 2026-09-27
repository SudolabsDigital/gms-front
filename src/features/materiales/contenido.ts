import type { TipoMedida } from "@/features/materiales/types";
import { numero, plural } from "@/lib/formato";

/**
 * El contenido de una presentación dicho como lo dice el taller (decisión 48): la base es cm, cm² o unidad, pero nadie
 * piensa una plancha en cm². Es presentación: el contenido que vale lo guarda el servidor.
 */
export function contenidoLegible(
  medida: TipoMedida,
  p: { contenido: number; ancho_cm?: number | null; alto_cm?: number | null },
): string {
  if (medida === "lineal") return `${numero(p.contenido, 1)} cm`;
  if (medida === "unidad") return plural(p.contenido, "unidad", "unidades");

  const m2 = `${numero(p.contenido / 10000, 2)} m²`;
  // Sin paréntesis: el texto ya suele ir entre paréntesis detrás del nombre («plancha (244 × 183 cm · 4.47 m²)»)
  return p.ancho_cm && p.alto_cm ? `${numero(p.ancho_cm, 1)} × ${numero(p.alto_cm, 1)} cm · ${m2}` : m2;
}

/** A qué unidad del cálculo se traduce el precio de la compra: lo que el motor cobra (`Motor::costear`) */
export const UNIDAD_DEL_MOTOR: Record<TipoMedida, string> = {
  lineal: "por barra",
  area: "por m²",
  unidad: "por unidad",
};
