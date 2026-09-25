"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AvisoDeError } from "@/components/comunes/aviso-de-error";
import { Button } from "@/components/ui/button";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import type { Cotizacion } from "@/features/proyectos/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";
import { moneda } from "@/lib/formato";

/**
 * «Emitir» (`proyectos/50-api` § emitir, tajada B.2): el punto de no retorno.
 *
 * La confirmación **lee el documento al abrirse** y enseña lo que se va a emitir —ítems, total, validez—, y emite
 * con esa lectura: lo que Miguel confirma es lo que sale (`P9`). Si los precios cambiaron, el servidor no emite y
 * lo dice (`PRECIOS_CAMBIARON`): la ficha se recarga con el borrador al precio de hoy. Un doble toque no produce
 * dos números: el servidor devuelve la misma emitida (`PRY-I06`).
 */
export function EmitirCotizacion({
  cotizacionId,
  hayCambiosSinGuardar = false,
  variante = "brand",
  className,
}: {
  cotizacionId: string;
  hayCambiosSinGuardar?: boolean;
  variante?: "brand" | "outline";
  className?: string;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [leida, setLeida] = useState<Cotizacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  async function abrir() {
    setAbierto(true);
    setLeida(null);
    setError(null);
    const respuesta = await pedir<Cotizacion>(`/api/v1/cotizaciones/${cotizacionId}`);

    if (!respuesta.ok) {
      setError(mensajeDeError(respuesta.error));
      return;
    }
    setLeida(respuesta.datos);
  }

  async function emitir() {
    if (!leida) return;
    setTrabajando(true);
    setError(null);
    const respuesta = await pedir<Cotizacion>(`/api/v1/cotizaciones/${cotizacionId}/emitir`, {
      method: "POST",
      body: JSON.stringify({ updated_at: leida.updated_at }),
    });
    setTrabajando(false);

    if (!respuesta.ok) {
      // 422 `PRECIOS_CAMBIARON` o 409: el borrador cambió; se enseña el porqué y se recarga debajo
      setError(mensajeDeError(respuesta.error));
      if (respuesta.error.estado === 409 || respuesta.error.error === "PRECIOS_CAMBIARON") {
        setLeida(null);
        router.refresh();
      }
      return;
    }

    toast.success(`Emitida ${respuesta.datos.numero}`, {
      description: "El documento quedó numerado y ya no cambia. El proyecto pasó a Cotizado.",
    });
    setAbierto(false);
    router.refresh();
  }

  const validez = leida ? (leida.validez_dias ?? leida.validez_por_omision) : null;

  return (
    <>
      <Button variant={variante} className={className ?? "h-11 w-full md:h-9"} onClick={abrir}>
        Emitir
      </Button>

      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo={leida ? `Emitir la cotización v${leida.version}` : "Emitir la cotización"}
        descripcion="Se numerará y ya no podrá editarse: es el documento que recibe el cliente."
      >
        <div className="flex flex-col gap-4">
          {error ? <AvisoDeError>{error}</AvisoDeError> : null}

          {leida ? (
            <>
              <dl className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Ítems</dt>
                  <dd>{leida.items.length}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Vale</dt>
                  <dd>{validez} días desde hoy</dd>
                </div>
                {leida.total !== undefined ? (
                  <div className="flex justify-between gap-3 border-t pt-2 font-semibold">
                    <dt>Total con IGV</dt>
                    <dd className="font-mono tabular-nums">{moneda(leida.total)}</dd>
                  </div>
                ) : null}
              </dl>
              {hayCambiosSinGuardar ? (
                <p className="text-muted-foreground text-sm">
                  Hay cambios sin guardar en el documento: se emite lo guardado, que es lo de arriba.
                </p>
              ) : null}
              <Button variant="brand" className="h-11 md:h-9" onClick={emitir} disabled={trabajando}>
                {trabajando ? <Loader2 className="size-4 animate-spin" /> : null}
                Emitir y numerar
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
