"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Notificacion } from "@/components/comunes/notificacion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VentanaSVG } from "@/features/cotizar/components/ventana-svg";
import { rutaDelCotizador } from "@/features/proyectos/components/cotizar-proyecto";
import { DocumentoCotizacion } from "@/features/proyectos/components/documento-cotizacion";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import type { Cotizacion, ItemCotizacion, Sustitucion } from "@/features/proyectos/types";
import { medida, moneda } from "@/lib/formato";
import { mensajeDeError, pedir } from "@/lib/api-cliente";
import { notificar } from "@/lib/notificar";

/**
 * La cotización en borrador, dentro de su pestaña (`proyectos/52-brief-ficha` § 10, tajada B.1).
 *
 * Los ítems con su dibujo —lo pinta el motor—, medida, cantidad, ubicación y costo de línea; debajo, el
 * documento. **Nada de lo que se ve aquí se calcula aquí**: cada importe llega del servidor, que recompone
 * el documento en cada escritura (`G-32`, `INV-E02`). Sin `costeo:ver` no llega ni una cifra, y no se pinta.
 */
export function CotizacionBorrador({
  cotizacion,
  puedeEditar,
  puedeEmitir,
  sustituye = null,
}: {
  cotizacion: Cotizacion;
  puedeEditar: boolean;
  puedeEmitir: boolean;
  /** Recotizando (B.3): la vigente a la que sustituirá al emitirse */
  sustituye?: Sustitucion | null;
}) {
  const router = useRouter();
  const [quitando, setQuitando] = useState<ItemCotizacion | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const veDinero = cotizacion.total !== undefined;

  async function quitar() {
    if (!quitando) return;
    setEnviando(true);
    setError(null);
    const respuesta = await pedir<Cotizacion>(`/api/v1/cotizacion-items/${quitando.id}`, { method: "DELETE" });
    setEnviando(false);

    if (!respuesta.ok) {
      // `DESCUENTO_EXCEDE_SUBTOTAL`: el mensaje del servidor dice cuánto y qué hacer
      setError(mensajeDeError(respuesta.error));
      return;
    }

    notificar({ tono: "exito", titulo: "Ítem quitado", descripcion: `${quitando.tipo.nombre} · ${quitando.ubicacion ?? "sin ubicación"}` });
    setQuitando(null);
    router.refresh();
  }

  const agregar = puedeEditar ? (
    <Button asChild variant={cotizacion.items.length === 0 ? "brand" : "outline"} className="h-11 md:h-9">
      <Link href={rutaDelCotizador(cotizacion.id)}>
        <Plus className="size-4" />
        Agregar ítem
      </Link>
    </Button>
  ) : null;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">
              Cotización · v{cotizacion.version} <span className="text-muted-foreground font-normal">· borrador</span>
            </CardTitle>
            {sustituye ? (
              <p className="text-muted-foreground text-sm">
                Recotiza la v{sustituye.version}, que sigue vigente hasta que emita esta.
              </p>
            ) : null}
          </div>
          {cotizacion.items.length > 0 ? agregar : null}
        </CardHeader>
        <CardContent>
          {cotizacion.items.length === 0 ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-muted-foreground text-sm">
                Todavía no tiene ítems. Cada ventana se calcula en el cotizador y se agrega desde ahí con su cantidad y
                dónde va.
              </p>
              {agregar}
            </div>
          ) : (
            <ul className="divide-y">
              {cotizacion.items.map((item) => (
                <FilaItem key={item.id} item={item} veDinero={veDinero} puedeQuitar={puedeEditar} alQuitar={() => setQuitando(item)} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {veDinero && cotizacion.items.length > 0 ? (
        <DocumentoCotizacion
          // Remontar con cada versión del documento: el formulario parte siempre de lo que hay ahora
          key={cotizacion.updated_at}
          cotizacion={cotizacion}
          puedeEditar={puedeEditar}
          puedeEmitir={puedeEmitir}
          sustituye={sustituye}
        />
      ) : null}

      <PanelResponsivo
        abierto={quitando !== null}
        alCambiar={(abierto) => {
          if (!abierto) {
            setQuitando(null);
            setError(null);
          }
        }}
        titulo="Quitar ítem"
        descripcion={
          quitando
            ? `${quitando.tipo.nombre} de ${medida(quitando.ancho_cm)} × ${medida(quitando.alto_cm)}, ×${quitando.cantidad}${quitando.ubicacion ? ` · ${quitando.ubicacion}` : ""}. El documento se recalcula sin él.`
            : ""
        }
      >
        <div className="flex flex-col gap-4">
          {error ? <Notificacion tono="error">{error}</Notificacion> : null}
          <Button variant="destructive" className="h-11 md:h-9" onClick={quitar} disabled={enviando}>
            {enviando ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Quitar
          </Button>
        </div>
      </PanelResponsivo>
    </div>
  );
}

/** Un ítem: el dibujo pequeño a la izquierda y el importe a la derecha, en el móvil y en el escritorio */
export function FilaItem({
  item,
  veDinero,
  puedeQuitar,
  alQuitar,
}: {
  item: ItemCotizacion;
  veDinero: boolean;
  puedeQuitar: boolean;
  /** Opcional: la emitida la pinta el servidor, que no puede pasar funciones */
  alQuitar?: () => void;
}) {
  // En la línea, solo lo que cambia una decisión; el precio se avisa una vez, en el documento (R22 del recorrido UX.0)
  const avisos = item.advertencias.filter((a) => a.nivel === "warn" && a.codigo !== "PRECIO_DESACTUALIZADO");

  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="bg-muted/40 flex size-16 shrink-0 items-center justify-center rounded-md border p-1 md:size-20">
        {item.geometria ? (
          <VentanaSVG geometria={item.geometria} ancho={item.ancho_cm} alto={item.alto_cm} mostrarCotas={false} className="size-full" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        {/* Se parte, no se corta: «F-D-F-D-F · Dos bloqu…» perdía justo lo que explica el tipo (recorrido B.1) */}
        <p className="text-sm font-semibold break-words">{item.tipo.nombre}</p>
        <p className="text-muted-foreground text-sm">
          <span className="font-mono">
            {medida(item.ancho_cm)} × {medida(item.alto_cm)}
          </span>{" "}
          · ×{item.cantidad}
          {item.ubicacion ? ` · ${item.ubicacion}` : ""}
        </p>
        <p className="text-muted-foreground font-mono text-xs">{item.tipo.codigo}</p>
        {avisos.length > 0 ? (
          <Notificacion tono="advertencia" compacta className="mt-1">
            {avisos.length === 1 ? avisos[0].mensaje : `${avisos.length} advertencias del motor`}
          </Notificacion>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {veDinero ? (
          // Costo de la línea: el margen y el transporte son del documento, no de cada ventana (`20-integracion`)
          <span className="text-right">
            <span className="block font-mono text-sm tabular-nums">{moneda(item.subtotal)}</span>
            <span className="text-muted-foreground block text-xs">costo</span>
          </span>
        ) : null}
        {puedeQuitar && alQuitar ? (
          <Button variant="ghost" size="sm" className="text-muted-foreground h-11 px-2 md:h-8" onClick={alQuitar}>
            <Trash2 className="size-4" />
            <span className="sr-only md:not-sr-only">Quitar</span>
          </Button>
        ) : null}
      </div>
    </li>
  );
}
