import { CAMBIO_GRANDE } from "@/features/materiales/textos";
import { moneda, numero } from "@/lib/formato";

/**
 * Cómo se lee un cambio de precio antes de guardarlo (decisión 47): la diferencia en soles y en %, y si es tan grande
 * que parece un error de tecla —un 450 donde iba 45—. Desde S/ 0 no es un aumento: es un primer precio, y hoy lo son
 * los 21. Es presentación: el precio que vale lo guarda el servidor.
 */
export function diferencia(actual: number, nuevo: number): { texto: string; grande: boolean } | null {
  if (Number.isNaN(nuevo) || nuevo === actual) return null;
  if (actual === 0) return { texto: "primer precio", grande: false };

  const delta = nuevo - actual;
  const pct = delta / actual;
  const signo = delta > 0 ? "+" : "−";
  return {
    texto: `${signo}${moneda(Math.abs(delta))} (${signo}${numero(Math.abs(pct) * 100, 0)} %)`,
    grande: Math.abs(pct) > CAMBIO_GRANDE,
  };
}
