"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Notificacion } from "@/components/comunes/notificacion";
import { Button } from "@/components/ui/button";
import { useBorradorEnEdicion } from "@/features/proyectos/components/borrador-en-edicion";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import type { Cotizacion, Sustitucion } from "@/features/proyectos/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";
import { moneda } from "@/lib/formato";
import { notificar } from "@/lib/notificar";

/**
 * «Emitir» (`proyectos/50-api` § emitir, tajada B.2): el punto de no retorno.
 *
 * La confirmación **lee el documento al abrirse** y enseña lo que se va a emitir —ítems, total, validez—, y emite
 * con esa lectura: lo que Miguel confirma es lo que sale (`P9`). Si los precios cambiaron, el servidor no emite y
 * lo dice (`PRECIOS_CAMBIARON`): la ficha se recarga con el borrador al precio de hoy. Un doble toque no produce
 * dos números: el servidor devuelve la misma emitida (`PRY-I06`).
 *
 * **Con cambios sin guardar en el documento, primero los guarda** (V02, V03): se emite lo que se ve, desde el pie o
 * desde el riel. Guarda sin refrescar —el documento se remontaría y cerraría este diálogo— y refresca al cerrarlo.
 */
export function EmitirCotizacion({
  cotizacionId,
  sustituye = null,
  variante = "brand",
  className,
}: {
  cotizacionId: string;
  /** Recotizando (B.3): a qué versión sustituye, y si estaba aprobada */
  sustituye?: Sustitucion | null;
  variante?: "brand" | "outline";
  className?: string;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [leida, setLeida] = useState<Cotizacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardo, setGuardo] = useState(false);
  const pendientes = useBorradorEnEdicion()?.pendientes;
  const porGuardar = pendientes?.cotizacionId === cotizacionId ? pendientes : null;

  async function abrir() {
    if (porGuardar) {
      setGuardando(true);
      const guardado = await porGuardar.guardar();
      setGuardando(false);
      if (!guardado) {
        // Desde el riel el formulario puede no estar a la vista: el error de cada campo está en él
        notificar({
          tono: "error",
          titulo: "No se emitió: el documento no se pudo guardar",
          descripcion: "Corrija lo marcado en «El documento» y vuelva a emitir.",
        });
        return;
      }
      setGuardo(true);
    }
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

    notificar({
      tono: "exito",
      titulo: `Emitida ${respuesta.datos.numero}`,
      // La primera emisión solo ocurre en `lead`; las siguientes sustituyen a una vigente (B.3)
      descripcion: sustituye?.aprobada
        ? `Sustituye a la v${sustituye.version}, que estaba aprobada: el proyecto volvió a Cotizado hasta que el cliente apruebe esta.`
        : sustituye
          ? `Sustituye a la v${sustituye.version}. El documento quedó numerado y ya no cambia.`
          : "El documento quedó numerado y ya no cambia. El proyecto pasó a Cotizado.",
    });
    cerrar();
  }

  /** Lo guardado al abrir no se ha pintado todavía: se refresca al salir, se emita o no */
  function cerrar() {
    setAbierto(false);
    setGuardo(false);
    router.refresh();
  }

  const validez = leida ? (leida.validez_dias ?? leida.validez_por_omision) : null;

  return (
    <>
      {/* `type="button"`: dentro del formulario del documento, un botón sin tipo lo envía (así nacía V03) */}
      <Button type="button" variant={variante} className={className ?? "h-11 w-full md:h-9"} onClick={abrir} disabled={guardando}>
        {guardando ? <Loader2 className="size-4 animate-spin" /> : null}
        {porGuardar ? "Guardar y emitir" : "Emitir"}
      </Button>

      <PanelResponsivo
        abierto={abierto}
        alCambiar={(abrirlo) => (abrirlo ? setAbierto(true) : guardo ? cerrar() : setAbierto(false))}
        titulo={leida ? `Emitir la cotización v${leida.version}` : "Emitir la cotización"}
        descripcion="Se numerará y ya no podrá editarse: es el documento que recibe el cliente."
      >
        <div className="flex flex-col gap-4">
          {error ? <Notificacion tono="error">{error}</Notificacion> : null}

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
              {sustituye ? (
                <p className="bg-muted rounded-md px-3 py-2 text-sm">
                  Sustituye a la v{sustituye.version}: deja de estar vigente y el cliente recibe este documento.
                  {sustituye.aprobada ? " Estaba aprobada: el proyecto vuelve a Cotizado hasta que el cliente apruebe este." : ""}
                </p>
              ) : null}
              {/* Es el punto de no retorno: la salida se ofrece con palabras, no solo con la ✕ (recorrido UX.0, R28) */}
              <div className="flex flex-col gap-2 md:flex-row-reverse">
                <Button variant="brand" className="h-11 md:h-9" onClick={emitir} disabled={trabajando}>
                  {trabajando ? <Loader2 className="size-4 animate-spin" /> : null}
                  Emitir y numerar
                </Button>
                <Button variant="outline" className="h-11 md:h-9" onClick={() => (guardo ? cerrar() : setAbierto(false))} disabled={trabajando}>
                  Cancelar
                </Button>
              </div>
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
