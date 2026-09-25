import type { Desglose } from "@/features/proyectos/types";
import { moneda, porcentaje } from "@/lib/formato";
import { cn } from "@/lib/utils";

/**
 * - `guardado`: lo que tiene el documento.
 * - `sin-guardar`: lo que saldría con lo escrito, calculado en seco por el servidor.
 * - `desfasado`: lo escrito todavía no tiene cálculo —se está pidiendo, o un campo está mal—, así que se enseña lo
 *   guardado **atenuado y rotulado**: un total que parece vigente sin serlo es peor que ninguno (recorrido de B.2).
 */
export type EstadoDelDesglose = "guardado" | "sin-guardar" | "desfasado";

/**
 * Cómo se llega al total, fila por fila (B.2, decisión del usuario: «feedback de cómo se está calculando»).
 *
 * **Solo pinta**: cada cifra, también `margen_monto` y `base`, llega compuesta del servidor
 * (`Dominio/TotalesDelDocumento`), y las filas suman porque así las compuso él (`G-32`, `INV-E02`).
 */
export function DesgloseCotizacion({
  desglose,
  estado = "guardado",
  nota,
}: {
  desglose: Desglose;
  estado?: EstadoDelDesglose;
  nota?: string;
}) {
  const filas: { signo: string; etiqueta: string; valor: number; fuerte?: boolean; oculta?: boolean }[] = [
    { signo: "", etiqueta: "Costo de las líneas", valor: desglose.costo_lineas },
    { signo: "+", etiqueta: "Transporte", valor: desglose.transporte, oculta: desglose.transporte === 0 },
    { signo: "+", etiqueta: `Margen ${porcentaje(desglose.margen_pct, 2)}`, valor: desglose.margen_monto },
    { signo: "=", etiqueta: "Subtotal", valor: desglose.subtotal, fuerte: true },
    { signo: "−", etiqueta: "Descuento", valor: desglose.descuento, oculta: desglose.descuento === 0 },
    { signo: "=", etiqueta: "Base imponible", valor: desglose.base, oculta: desglose.descuento === 0 },
    { signo: "+", etiqueta: `IGV ${porcentaje(desglose.igv_pct, 0)}`, valor: desglose.igv },
  ];

  return (
    <div className="flex flex-col gap-1 text-sm" aria-live="polite">
      <div className={cn("flex flex-col gap-1 transition-opacity", estado === "desfasado" && "opacity-50")}>
        <dl className="flex flex-col gap-1">
          {filas
            .filter((f) => !f.oculta)
            .map((f) => (
              <div key={f.etiqueta} className={cn("flex items-baseline justify-between gap-3", f.fuerte && "font-medium")}>
                <dt className="text-muted-foreground">
                  <span className="inline-block w-3 font-mono" aria-hidden>
                    {f.signo}
                  </span>{" "}
                  {f.etiqueta}
                </dt>
                <dd className="font-mono tabular-nums">{moneda(f.valor)}</dd>
              </div>
            ))}
        </dl>
        <div className="mt-1 flex items-baseline justify-between border-t pt-2">
          <span className="font-semibold">
            Total{" "}
            <span className={cn("text-xs font-normal", estado === "sin-guardar" ? "text-primary" : "text-muted-foreground")}>
              {estado === "sin-guardar" ? "sin guardar" : estado === "desfasado" ? "guardado" : "con IGV"}
            </span>
          </span>
          <span className="font-mono text-lg font-semibold tabular-nums">{moneda(desglose.total)}</span>
        </div>
      </div>
      {nota ? <p className="text-muted-foreground text-xs">{nota}</p> : null}
    </div>
  );
}
