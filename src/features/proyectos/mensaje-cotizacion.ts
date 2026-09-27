import type { Cotizacion } from "@/features/proyectos/types";
import { diaDe, diaLegible, moneda, numero } from "@/lib/formato";
import { siteConfig } from "@/config/site-config";

/**
 * El mensaje con el que la cotización emitida sale por WhatsApp (decisión 36, recorrido UX.0 R04).
 *
 * Todo sale de lo congelado al emitir —número, líneas, total, vencimiento—: lo que el cliente lee es lo que se le
 * cobrará. Un solo importe, el total con IGV; el desglose por línea es cosa del PDF (E4 del ERP), cuando llegue.
 * `null` si el documento no trae el total: sin `costeo:ver` no viaja, y un mensaje sin precio no se manda.
 */
export function mensajeDeCotizacion(cliente: string, cotizacion: Cotizacion): string | null {
  if (cotizacion.total === undefined || !cotizacion.numero) return null;

  const lineas = cotizacion.items.map((item) => {
    const donde = item.ubicacion?.trim() ? ` · ${item.ubicacion.trim()}` : "";
    return `• ${numero(item.cantidad, 0)} × ${item.tipo.nombre}${donde} · ${numero(item.ancho_cm, 1)} × ${numero(item.alto_cm, 1)} cm`;
  });
  const vence = cotizacion.vence_at ? `\nVálida hasta el ${diaLegible(diaDe(cotizacion.vence_at))}.` : "";

  return [
    `Hola ${cliente.trim()}, le comparto su cotización ${cotizacion.numero} de ${siteConfig.name}:`,
    "",
    ...lineas,
    "",
    `Total: ${moneda(cotizacion.total)} (IGV incluido)${vence}`,
    "",
    "Quedo atento a cualquier consulta.",
  ].join("\n");
}
