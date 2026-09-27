"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Tag } from "lucide-react";

import { describeError, ErrorDeCampo } from "@/components/comunes/error-de-campo";
import { Notificacion } from "@/components/comunes/notificacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { diferencia } from "@/features/materiales/diferencia";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import { erroresPorCampo, mensajeDeError, pedir } from "@/lib/api-cliente";
import { moneda } from "@/lib/formato";
import { notificar } from "@/lib/notificar";

/**
 * El precio de una presentación (MAE.3 y MAE.5): deja historial y, si es la de compra, **desactualiza lo emitido que
 * usa el insumo**. Se dice antes de guardar, y el resultado —cuántas cotizaciones— después. Sirve a las dos rutas: la
 * del insumo (su compra) y la de cualquier presentación; cambia solo la ruta y el nombre del campo.
 */
export function CambiarPrecio({
  titulo,
  actual,
  por,
  ruta,
  campo,
  leido,
  compra,
  variante = "outline",
  compacto = false,
}: {
  titulo: string;
  actual: number;
  /** «por barra de 600 cm»: de qué es el precio */
  por: string;
  ruta: string;
  campo: "precio_unitario" | "precio";
  leido: string;
  /** Si es la de compra, el cambio llega a las cotizaciones y se avisa */
  compra: boolean;
  variante?: "outline" | "ghost";
  compacto?: boolean;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [precio, setPrecio] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const nuevo = Number(precio.trim().replace(",", "."));
  const cambio = precio.trim() === "" ? null : diferencia(actual, nuevo);

  function abrir() {
    setPrecio(actual === 0 ? "" : String(actual));
    setMotivo("");
    setError(null);
    setErrorGeneral(null);
    setAbierto(true);
  }

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErrorGeneral(null);
    const respuesta = await pedir<{ cotizaciones_desactualizadas: number }>(ruta, {
      method: "PATCH",
      body: JSON.stringify({ [campo]: precio.trim().replace(",", "."), motivo: motivo.trim() || null, updated_at: leido }),
    });
    setEnviando(false);

    if (!respuesta.ok) {
      if (respuesta.error.estado === 409) {
        setErrorGeneral("Alguien lo cambió mientras lo tenía abierto. Cierre y recargue.");
        return;
      }
      const porCampo = erroresPorCampo(respuesta.error);
      setError(porCampo[campo]?.[0] ?? null);
      if (!porCampo[campo]) setErrorGeneral(mensajeDeError(respuesta.error));
      return;
    }

    const n = respuesta.datos.cotizaciones_desactualizadas;
    notificar({
      tono: n > 0 ? "advertencia" : "exito",
      titulo: `${titulo}: ${moneda(nuevo)}`,
      descripcion: !compra
        ? "Es una alternativa: no cambia lo que se cotiza."
        : n > 0
          ? `${n} ${n === 1 ? "cotización emitida quedó desactualizada" : "cotizaciones emitidas quedaron desactualizadas"}.`
          : "Ninguna cotización emitida lo usaba.",
    });
    setAbierto(false);
    router.refresh();
  }

  return (
    <>
      <Button variant={variante} size={compacto ? "sm" : "default"} className={compacto ? "h-11 md:h-8" : "h-11 md:h-9"} onClick={abrir}>
        <Tag className="size-4" />
        {compacto ? "Precio" : "Cambiar precio"}
      </Button>

      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo={`Precio · ${titulo}`}
        descripcion={
          compra
            ? "Es la presentación de compra: queda en el historial y las cotizaciones emitidas que usan el insumo quedan marcadas como desactualizadas; las aprobadas no se tocan."
            : "Es una alternativa: queda en el historial, pero lo que se cotiza sale de la de compra."
        }
      >
        <form onSubmit={guardar} noValidate className="flex flex-col gap-4">
          {errorGeneral ? <Notificacion tono="error">{errorGeneral}</Notificacion> : null}
          <p className="text-sm">
            Actual: <span className="font-mono tabular-nums">{moneda(actual)}</span> <span className="text-muted-foreground">{por}</span>
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="precio-nuevo">Precio nuevo (S/)</Label>
            <Input
              id="precio-nuevo"
              inputMode="decimal"
              className="h-11 font-mono tabular-nums md:h-9"
              value={precio}
              onChange={(e) => {
                setPrecio(e.target.value);
                setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={describeError("precio-nuevo", error) ?? "precio-diferencia"}
            />
            <ErrorDeCampo campo="precio-nuevo">{error}</ErrorDeCampo>
            {cambio ? (
              <p id="precio-diferencia" className={cambio.grande ? "text-warning-fuerte text-sm font-medium" : "text-muted-foreground text-sm"}>
                {cambio.texto}
                {cambio.grande ? " · ¿seguro? Es un cambio grande" : ""}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="precio-motivo">Motivo (opcional)</Label>
            <Input id="precio-motivo" className="h-11 md:h-9" maxLength={200} value={motivo} placeholder="Lista de octubre del proveedor" onChange={(e) => setMotivo(e.target.value)} />
          </div>
          <Button type="submit" variant="brand" className="h-11 md:h-9" disabled={enviando || precio.trim() === ""}>
            {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
            Guardar precio
          </Button>
        </form>
      </PanelResponsivo>
    </>
  );
}
