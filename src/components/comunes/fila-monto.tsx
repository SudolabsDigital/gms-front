import { moneda as formatearMoneda } from "@/lib/formato";
import { cn } from "@/lib/utils";

/**
 * Una línea del costeo: concepto a la izquierda, importe a la derecha.
 *
 * Los importes van en `tabular-nums` y alineados a la derecha para que las cifras se
 * apilen por unidades, decenas y centenas. Con cifras proporcionales, comparar dos
 * líneas de una cotización obliga a leerlas; alineadas, se comparan de un vistazo.
 */
export function FilaMonto({
  etiqueta,
  valor,
  codigoMoneda = "PEN",
  ayuda,
  destacado = false,
  className,
}: {
  etiqueta: string;
  valor: number;
  codigoMoneda?: string;
  /** De dónde sale el importe. Útil cuando un concepto sorprende al cliente. */
  ayuda?: string;
  /** El total: tipografía mayor y peso, porque es la cifra que se recuerda. */
  destacado?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", className)}>
      <div className="min-w-0">
        <span className={destacado ? "font-medium" : "text-muted-foreground text-sm"}>
          {etiqueta}
        </span>
        {ayuda ? (
          <p className="text-muted-foreground/80 text-xs leading-tight">{ayuda}</p>
        ) : null}
      </div>

      <span
        className={cn(
          "shrink-0 tabular-nums",
          destacado ? "text-lg font-semibold" : "text-sm",
        )}
      >
        {formatearMoneda(valor, codigoMoneda)}
      </span>
    </div>
  );
}
