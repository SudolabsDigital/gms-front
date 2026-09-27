"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Notificacion } from "@/components/comunes/notificacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import type { Cotizacion, DocumentoResumen } from "@/features/proyectos/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";
import { diaDe, diaDeHoy, diaLegible, moneda } from "@/lib/formato";
import { notificar } from "@/lib/notificar";

/**
 * «Registrar aprobación» (`proyectos/50-api` § aprobar, tajada B.3): el sí del cliente, con **el día en que lo
 * dio**. Contra ese día se juzga el vencimiento, no contra hoy (decisión 26): un sí a tiempo anotado tarde vale.
 *
 * Como emitir, **lee el documento al abrirse** y aprueba con esa lectura (`P9`). El día va de la emisión a hoy, en
 * hora de Lima; los límites del campo solo ayudan, el servidor decide igual. Si el día declarado pasa del
 * vencimiento, el servidor responde `COTIZACION_VENCIDA` y lo dice: lo que queda es recotizar, que está en las
 * acciones de la etapa (no se abre un panel encima de otro).
 */
export function AprobarCotizacion({
  vigente,
  variante = "brand",
  className,
}: {
  vigente: DocumentoResumen;
  /** Secundaria cuando lo principal es emitir la versión que se está recotizando (recorrido UX.0, R09) */
  variante?: "brand" | "outline";
  className?: string;
}) {
  const router = useRouter();
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [leida, setLeida] = useState<Cotizacion | null>(null);
  const [dia, setDia] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const hoy = diaDeHoy();
  const emitidaEl = vigente.emitida_at ? diaDe(vigente.emitida_at) : undefined;
  const venceEl = vigente.vence_at ? diaDe(vigente.vence_at) : null;

  async function abrir() {
    setAbierto(true);
    setLeida(null);
    setDia(hoy);
    setNota("");
    setError(null);
    const respuesta = await pedir<Cotizacion>(`/api/v1/cotizaciones/${vigente.id}`);

    if (!respuesta.ok) {
      setError(mensajeDeError(respuesta.error));
      return;
    }
    setLeida(respuesta.datos);
  }

  async function aprobar() {
    if (!leida) return;
    setTrabajando(true);
    setError(null);
    const respuesta = await pedir<Cotizacion>(`/api/v1/cotizaciones/${vigente.id}/aprobar`, {
      method: "POST",
      body: JSON.stringify({ aprobada_el: dia, nota: nota.trim() || null, updated_at: leida.updated_at }),
    });
    setTrabajando(false);

    if (!respuesta.ok) {
      setError(mensajeDeError(respuesta.error));
      if (respuesta.error.estado === 409) {
        setLeida(null);
        router.refresh();
      }
      return;
    }

    notificar({
      tono: "exito",
      titulo: `Aprobada ${respuesta.datos.numero}`,
      descripcion: "El proyecto pasó a Aprobado. Lo siguiente es confirmar las medidas en obra.",
    });
    setAbierto(false);
    // Sin `?pestana=`, la ficha abre en la de lo siguiente —Obra—, no en la que había (recorrido UX.0, R11)
    router.replace(ruta);
    router.refresh();
  }

  return (
    <>
      <Button variant={variante} className={className ?? "h-11 w-full md:h-9"} onClick={abrir}>
        Registrar aprobación
      </Button>

      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo={`Registrar la aprobación · v${vigente.version}`}
        descripcion="El cliente aceptó esta versión: el documento queda aprobado y el proyecto pasa a Aprobado."
      >
        <div className="flex flex-col gap-4">
          {error ? <Notificacion tono="error">{error}</Notificacion> : null}

          {leida ? (
            <>
              <dl className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Documento</dt>
                  <dd className="font-mono">{leida.numero}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Vence</dt>
                  <dd>{diaLegible(venceEl)}</dd>
                </div>
                {leida.total !== undefined ? (
                  <div className="flex justify-between gap-3 border-t pt-2 font-semibold">
                    <dt>Total con IGV</dt>
                    <dd className="font-mono tabular-nums">{moneda(leida.total)}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="space-y-1.5">
                <Label htmlFor="aprobada-el">Día en que el cliente dijo que sí</Label>
                <Input
                  id="aprobada-el"
                  type="date"
                  className="h-11 md:h-9"
                  min={emitidaEl}
                  max={hoy}
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                />
                <p className="text-muted-foreground text-xs">
                  Si lo anota tarde, ponga el día real: el vencimiento se cuenta contra ese día.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="aprobacion-nota">Cómo llegó el sí (opcional)</Label>
                <Textarea
                  id="aprobacion-nota"
                  rows={2}
                  maxLength={500}
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Por WhatsApp · Firmó en obra · Llamó a la oficina…"
                />
              </div>

              <Button variant="brand" className="h-11 md:h-9" onClick={aprobar} disabled={trabajando || dia === ""}>
                {trabajando ? <Loader2 className="size-4 animate-spin" /> : null}
                Registrar aprobación
              </Button>
            </>
          ) : !error ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Leyendo el documento…
            </p>
          ) : null}
        </div>
      </PanelResponsivo>
    </>
  );
}
