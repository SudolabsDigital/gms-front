"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AvisoDeError } from "@/components/comunes/aviso-de-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import { RegistrarCobro } from "@/features/proyectos/components/registrar-cobro";
import { ETAPAS_CON_COBROS, MEDIOS_COBRO, TIPOS_COBRO } from "@/features/proyectos/textos";
import type { Cobro, ProyectoFicha } from "@/features/proyectos/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";
import { diaLegible, moneda } from "@/lib/formato";
import { cn } from "@/lib/utils";

/**
 * La pestaña Cobros (`proyectos/51-ui`, tajada C.1): el total de la vigente, el saldo —los dos del servidor, que el
 * front no compone importes (`G-32`)— y cada cobro. **Un cobro anulado sigue visible, tachado, con quién y por qué**
 * (`PRY-08`): no hay borrar.
 */
export function CobrosProyecto({
  proyecto,
  puedeRegistrar,
  puedeAnular,
}: {
  proyecto: ProyectoFicha;
  puedeRegistrar: boolean;
  puedeAnular: boolean;
}) {
  const router = useRouter();
  const [anulando, setAnulando] = useState<Cobro | null>(null);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const veDinero = proyecto.saldo !== undefined;
  const total = proyecto.vigente?.total;
  const saldo = proyecto.saldo;
  const cobra = puedeRegistrar && ETAPAS_CON_COBROS.includes(proyecto.etapa);

  async function anular() {
    if (!anulando) return;
    setEnviando(true);
    setError(null);
    const respuesta = await pedir<ProyectoFicha>(`/api/v1/cobros/${anulando.id}/anular`, {
      method: "POST",
      body: JSON.stringify({ motivo: motivo.trim() || null, updated_at: anulando.updated_at }),
    });
    setEnviando(false);

    if (!respuesta.ok) {
      setError(mensajeDeError(respuesta.error));
      if (respuesta.error.estado === 409) router.refresh();
      return;
    }

    toast.success(`${TIPOS_COBRO[anulando.tipo]} anulado`, { description: "Sigue en la lista, tachado, con el motivo." });
    setAnulando(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">Cobros</CardTitle>
          {veDinero && total !== undefined && total !== null ? (
            <dl className="text-muted-foreground flex flex-wrap gap-x-4 text-sm">
              <div className="flex gap-1">
                <dt>Total</dt>
                <dd className="text-foreground font-mono tabular-nums">{moneda(total)}</dd>
              </div>
              {saldo !== null && saldo !== undefined ? (
                <div className="flex gap-1">
                  <dt>{saldo < 0 ? "A favor del cliente" : "Saldo"}</dt>
                  <dd className="text-foreground font-mono font-semibold tabular-nums">{moneda(saldo)}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
        {/* La misma etiqueta que el riel: decían «cobro» y «anticipo» para la misma acción (recorrido de C.1) */}
        {cobra ? (
          <RegistrarCobro
            proyecto={proyecto}
            etiqueta={proyecto.cobros.some((c) => c.anulado_at === null) ? "Registrar cobro" : "Registrar anticipo"}
          />
        ) : null}
      </CardHeader>
      <CardContent>
        {proyecto.cobros.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {ETAPAS_CON_COBROS.includes(proyecto.etapa)
              ? "Todavía no hay cobros. El primero suele ser el anticipo."
              : "Los cobros se registran desde que el cliente aprueba la cotización."}
          </p>
        ) : (
          <ul className="divide-y">
            {proyecto.cobros.map((cobro) => {
              const anulado = cobro.anulado_at !== null;
              return (
                <li key={cobro.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                  <div className={cn("flex flex-col gap-0.5 text-sm", anulado && "text-muted-foreground")}>
                    <p className={cn("font-medium", anulado && "line-through")}>
                      {TIPOS_COBRO[cobro.tipo]} · {diaLegible(cobro.fecha)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {MEDIOS_COBRO[cobro.medio]}
                      {cobro.referencia ? ` · ${cobro.referencia}` : ""}
                    </p>
                    {anulado ? (
                      <p className="text-xs">
                        Anulado{cobro.anulado_por ? ` por ${cobro.anulado_por.nombre}` : ""}: «{cobro.anulado_motivo}»
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {cobro.monto !== undefined ? (
                      <span className={cn("font-mono tabular-nums", anulado && "text-muted-foreground line-through")}>
                        {moneda(cobro.monto)}
                      </span>
                    ) : null}
                    {puedeAnular && !anulado ? (
                      <Button
                        variant="ghost"
                        className="h-11 md:h-8"
                        onClick={() => {
                          setAnulando(cobro);
                          setMotivo("");
                          setError(null);
                        }}
                      >
                        Anular
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <PanelResponsivo
        abierto={anulando !== null}
        alCambiar={(abierto) => !abierto && setAnulando(null)}
        titulo={anulando ? `Anular ${TIPOS_COBRO[anulando.tipo].toLowerCase()} del ${diaLegible(anulando.fecha)}` : ""}
        descripcion="El cobro no se borra: queda tachado, con quién lo anuló y por qué, y deja de contar en el saldo."
      >
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cobro-motivo">Motivo</Label>
            <Textarea
              id="cobro-motivo"
              rows={3}
              maxLength={500}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Se cargó dos veces · El monto estaba mal · Rebotó la transferencia…"
            />
          </div>
          {error ? <AvisoDeError>{error}</AvisoDeError> : null}
          <Button variant="destructive" className="h-11 md:h-9" onClick={anular} disabled={enviando || motivo.trim() === ""}>
            {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
            Anular cobro
          </Button>
        </div>
      </PanelResponsivo>
    </Card>
  );
}
