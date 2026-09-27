"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { BarraFijaMovil } from "@/components/comunes/barra-fija-movil";
import { describeError, ErrorDeCampo } from "@/components/comunes/error-de-campo";
import { Notificacion } from "@/components/comunes/notificacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Cotizacion } from "@/features/proyectos/types";
import { medida } from "@/lib/formato";
import { erroresPorCampo, mensajeDeError, pedir, sinErrores } from "@/lib/api-cliente";
import { notificar } from "@/lib/notificar";

/** El proyecto para el que se cotiza: lo que el cotizador necesita saber de él, y nada más */
export type DestinoDeCotizacion = {
  cotizacionId: string;
  proyectoId: string;
  codigo: string;
  nombre: string;
  version: number;
  items: number;
};

/** El formulario que envía también el botón de la barra fija */
const FORMULARIO = "agregar-al-proyecto";

/**
 * «Agregar al proyecto» (`proyectos/51-ui` § la cotización, `52-brief-ficha` § 10).
 *
 * Manda lo que el usuario eligió —tipo, medidas, cantidad y dónde va— y **ningún importe**: el servidor
 * vuelve a llamar al motor y guarda (`PRY-03`, `PRY-I16`). El cotizador no se duplica: esta pieza se monta
 * debajo del cálculo en seco que ya existe.
 *
 * **En el móvil el botón va en la barra fija** (recorrido UX.2, V09): los avisos del motor lo empujaban bajo el pliegue
 * y había que desplazarse para la acción que se viene a hacer. Cantidad y «dónde va» se quedan aquí, con sus valores
 * por omisión; el botón de la barra envía este mismo formulario.
 */
export function AgregarAlProyecto({
  destino,
  tipoId,
  ancho,
  alto,
  alAgregar,
}: {
  destino: DestinoDeCotizacion;
  tipoId: string;
  ancho: string;
  alto: string;
  alAgregar: (documento: Cotizacion) => void;
}) {
  const [cantidad, setCantidad] = useState("1");
  const [ubicacion, setUbicacion] = useState("");
  const [errores, setErrores] = useState<Record<string, string[]>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function agregar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErrorGeneral(null);

    const respuesta = await pedir<Cotizacion>(`/api/v1/cotizaciones/${destino.cotizacionId}/items`, {
      method: "POST",
      body: JSON.stringify({
        tipo_id: tipoId,
        ancho_cm: ancho,
        alto_cm: alto,
        cantidad: cantidad.trim(),
        ubicacion: ubicacion.trim() || null,
      }),
    });
    setEnviando(false);

    if (!respuesta.ok) {
      const porCampo = erroresPorCampo(respuesta.error);
      setErrores(porCampo);
      // Lo que no es de cantidad ni de ubicación —el motor, el estado del documento, la red— va arriba
      if (!porCampo.cantidad && !porCampo.ubicacion) setErrorGeneral(mensajeDeError(respuesta.error));
      return;
    }

    const n = respuesta.datos.items.length;
    notificar({
      tono: "exito",
      titulo: `Agregado a ${destino.codigo}`,
      descripcion: `${n} ${n === 1 ? "ítem" : "ítems"} en la cotización v${destino.version}.`,
    });
    setCantidad("1");
    setUbicacion("");
    alAgregar(respuesta.datos);
  }

  const errorDe = (clave: string) => errores[clave]?.[0];

  return (
    <form id={FORMULARIO} onSubmit={agregar} noValidate className="bg-card flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-start">
      <div className="grid flex-1 grid-cols-[6rem_minmax(0,1fr)] gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="agregar-cantidad">Cantidad</Label>
          <Input
            id="agregar-cantidad"
            inputMode="numeric"
            className="h-11 font-mono tabular-nums md:h-9"
            value={cantidad}
            aria-invalid={errorDe("cantidad") ? true : undefined}
            aria-describedby={describeError("agregar-cantidad", errorDe("cantidad"))}
            onChange={(e) => {
              setCantidad(e.target.value);
              setErrores((actuales) => sinErrores(actuales, ["cantidad"]));
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="agregar-ubicacion">Dónde va</Label>
          <Input
            id="agregar-ubicacion"
            className="h-11 md:h-9"
            maxLength={80}
            value={ubicacion}
            placeholder="Sala · Dormitorio 2…"
            aria-invalid={errorDe("ubicacion") ? true : undefined}
            aria-describedby={describeError("agregar-ubicacion", errorDe("ubicacion"))}
            onChange={(e) => {
              setUbicacion(e.target.value);
              setErrores((actuales) => sinErrores(actuales, ["ubicacion"]));
            }}
          />
        </div>
        <div className="col-span-2 empty:hidden">
          <ErrorDeCampo campo="agregar-cantidad">{errorDe("cantidad")}</ErrorDeCampo>
          <ErrorDeCampo campo="agregar-ubicacion">{errorDe("ubicacion")}</ErrorDeCampo>
        </div>
        {errorGeneral ? <Notificacion tono="error" className="col-span-2">{errorGeneral}</Notificacion> : null}
        <p className="text-muted-foreground col-span-2 text-xs">
          Se agrega lo que se ve en el plano:{" "}
          <span className="font-mono">
            {medida(Number(ancho))} × {medida(Number(alto))}
          </span>
          . El servidor lo vuelve a calcular al guardarlo.
        </p>
      </div>

      <Button type="submit" variant="brand" className="hidden md:mt-6 md:inline-flex md:h-9" disabled={enviando}>
        {enviando ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Agregar al proyecto
      </Button>

      <BarraFijaMovil>
        <Button type="submit" form={FORMULARIO} variant="brand" className="h-11 w-full" disabled={enviando}>
          {enviando ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Agregar al proyecto
        </Button>
      </BarraFijaMovil>
    </form>
  );
}
