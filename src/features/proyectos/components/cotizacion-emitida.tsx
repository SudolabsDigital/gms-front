import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilaItem } from "@/features/proyectos/components/cotizacion-borrador";
import { DesgloseCotizacion } from "@/features/proyectos/components/desglose-cotizacion";
import type { Cotizacion } from "@/features/proyectos/types";
import { diaLegible, fechaHora } from "@/lib/formato";

/**
 * Una cotización ya emitida, **de solo lectura** (`proyectos/51-ui` § la cotización): número, estado, ítems y el
 * desglose congelado. Nada se edita: lo emitido no cambia (`PRY-I07`). Una versión anterior va rotulada «Sustituida
 * por vN» (B.3), como en la sonda que decidió la ficha (`06-mejora-continua/sondas/ficha-del-proyecto.html`).
 */
export function CotizacionEmitida({
  cotizacion,
  sustituidaPor = null,
  ahora = new Date(),
}: {
  cotizacion: Cotizacion;
  /** La versión que la sustituyó, si no es la vigente: la calcula el servidor */
  sustituidaPor?: number | null;
  ahora?: Date;
}) {
  const vencida = cotizacion.vence_at !== null && new Date(cotizacion.vence_at) < ahora;
  const veDinero = cotizacion.total !== undefined;
  const vence = fechaHora(cotizacion.vence_at).slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      {sustituidaPor !== null ? (
        <p className="bg-muted rounded-md px-3 py-2 text-sm">
          Solo lectura · <b>sustituida por la v{sustituidaPor}</b>. Es el documento que el cliente recibió entonces.
        </p>
      ) : null}

      <Card>
        <CardHeader className="gap-1">
          <CardTitle className="text-base">
            Cotización · v{cotizacion.version}{" "}
            <span className="font-mono font-normal">{cotizacion.numero}</span>
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {cotizacion.estado === "aprobada" ? (
              <>Aprobada el {diaLegible(cotizacion.aprobada_el)}</>
            ) : cotizacion.estado === "anulada" ? (
              <span className="text-destructive">Anulada con el proyecto</span>
            ) : vencida ? (
              <span className="text-destructive">Emitida · vencida el {vence}</span>
            ) : (
              <>Emitida · vence el {vence}</>
            )}
            {cotizacion.vigente ? " · vigente" : ""}
          </p>
          {cotizacion.aprobacion_nota ? <p className="text-sm">«{cotizacion.aprobacion_nota}»</p> : null}
          {vencida && cotizacion.vigente && cotizacion.estado === "emitida" ? (
            <p className="text-sm">Para que el cliente la apruebe, recotice con los precios de hoy.</p>
          ) : null}
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
