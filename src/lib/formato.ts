/**
 * Formato de números para el ERP.
 *
 * Existe por una razón concreta: `String(1120.5)` da "1120.5" y en el taller eso se lee
 * mal. En es-PE el separador decimal es la coma y el de miles el punto, así que 1120.5 cm
 * debe verse «1 120,5». Cuando cada componente formatea a su manera, la misma cifra
 * aparece distinta en el despiece y en el costeo, y quien compara las dos hojas duda.
 *
 * [AVISO] Esto es PRESENTACIÓN, no cálculo. Aquí no se redondea para operar después: se
 * redondea para mostrar. El único que calcula es el motor en PHP (PC-GMS-006).
 */

const LOCALE = "es-PE";

/**
 * Un número tal como debe leerse.
 *
 * Los enteros se muestran sin decimales —«4 ruedas», no «4,00 ruedas»— y el resto con
 * los que hagan falta hasta el máximo. Así 300 es "300" y 1120.5 es "1 120,5".
 */
export function numero(valor: number | null | undefined, decimales = 2): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";

  return valor.toLocaleString(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  });
}

/** Una medida con su unidad: «1 120,5 cm». La unidad nunca se separa del número. */
export function medida(
  valor: number | null | undefined,
  unidad: "cm" | "m²" | "pie²" | "h" | "kg" = "cm",
): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";

  return `${numero(valor)} ${unidad}`;
}

/**
 * Dinero, siempre con dos decimales.
 *
 * El importe no se abrevia ni se redondea a entero aunque sea redondo: en una cotización
 * «S/ 102,00» y «S/ 102» no transmiten la misma seguridad a quien la firma.
 */
export function moneda(
  valor: number | null | undefined,
  codigo = "PEN",
): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";

  return valor.toLocaleString(LOCALE, {
    style: "currency",
    currency: codigo,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Un porcentaje: «12,5 %». */
export function porcentaje(valor: number | null | undefined, decimales = 1): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";

  return `${numero(valor, decimales)} %`;
}

/**
 * Las fechas del ERP se leen en la hora de Huancayo, no en la del servidor (UTC) ni en la del
 * navegador: así el servidor y el navegador pintan lo mismo y no hay desajuste de hidratación.
 */
const ZONA = "America/Lima";

/** «23/09/2026 15:04» */
export function fechaHora(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(LOCALE, {
    timeZone: ZONA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * «hoy», «ayer», «hace 9 días»: cuánto lleva algo en su etapa (`proyectos/51-ui`). Por DÍAS de
 * calendario en Huancayo, a propósito: los minutos cambiarían entre el render del servidor y el del
 * navegador, y a quien mira una lista de trabajo le importa el día, no el minuto.
 */
export function haceDias(iso: string | null | undefined, ahora: Date = new Date()): string {
  if (!iso) return "—";

  const dia = (fecha: Date) => fecha.toLocaleDateString("en-CA", { timeZone: ZONA });
  const dias = Math.round((Date.parse(dia(ahora)) - Date.parse(dia(new Date(iso)))) / 86_400_000);

  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  return `hace ${numero(dias, 0)} días`;
}

/** Cantidad con su sustantivo concordado: «1 panel», «5 paneles». */
export function plural(cantidad: number, singular: string, plural: string): string {
  return `${numero(cantidad, 0)} ${cantidad === 1 ? singular : plural}`;
}
