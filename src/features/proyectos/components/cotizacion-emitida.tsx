import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilaItem } from "@/features/proyectos/components/cotizacion-borrador";
import { DesgloseCotizacion } from "@/features/proyectos/components/desglose-cotizacion";
import type { Cotizacion } from "@/features/proyectos/types";
import { fechaHora } from "@/lib/formato";

/**
 * La cotización emitida, **de solo lectura** (`proyectos/51-ui` § la cotización, tajada B.2): número, vencimiento,
 * ítems y el desglose congelado. Nada se edita: lo emitido no cambia (`PRY-I07`). Aprobarla, anularla y recotizar
 * llegan con B.3.
 */
export function CotizacionEmitida({ cotizacion, ahora = new Date() }: { cotizacion: Cotizacion; ahora?: Date }) {
  const vencida = cotizacion.vence_at !== null && new Date(cotizacion.vence_at) < ahora;
  const veDinero = cotizacion.total !== undefined;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="gap-1">
          <CardTitle className="text-base">
            Cotización · v{cotizacion.version}{" "}
            <span className="font-mono font-normal">{cotizacion.numero}</span>
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {cotizacion.estado === "emitida" ? "Emitida" : cotizacion.estado}
            {cotizacion.vigente ? " · vigente" : ""} ·{" "}
            {vencida ? (
              <span className="text-destructive">vencida el {fechaHora(cotizacion.vence_at).slice(0, 10)}</span>
            ) : (
              <>vence el {fechaHora(cotizacion.vence_at).slice(0, 10)}</>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {cotizacion.items.map((item) => (
              <FilaItem key={item.id} item={item} veDinero={veDinero} puedeQuitar={false} />
            ))}
          </ul>
        </CardContent>
      </Card>

      {veDinero && cotizacion.desglose ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">El documento</CardTitle>
          </CardHeader>
          <CardContent>
            <DesgloseCotizacion desglose={cotizacion.desglose} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
