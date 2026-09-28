"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";

import { describeError, ErrorDeCampo } from "@/components/comunes/error-de-campo";
import { Notificacion } from "@/components/comunes/notificacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Parametro } from "@/features/parametros/types";
import { cambioDeParametro, unidadDelCampo, valorLegible } from "@/features/parametros/valor";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import { erroresPorCampo, mensajeDeError, pedir } from "@/lib/api-cliente";
import { fechaHora } from "@/lib/formato";
import { notificar } from "@/lib/notificar";

/**
 * Cambiar un parámetro (`parametros/52-brief-parametros` § 4, MAE.7): el valor, la diferencia en vivo y, en la mano de
 * obra, la advertencia de la cascada **antes** de guardar; el resultado —cuántas cotizaciones— después. Debajo, los
 * últimos cambios.
 */
export function CambiarParametro({ parametro }: { parametro: Parametro }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [valor, setValor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const actual = Number(parametro.valor);
  const escrito = valor.trim().replace(",", ".");
  const nuevo = Number(escrito);
  const cambio = escrito === "" ? null : cambioDeParametro(actual, nuevo, parametro.unidad);
  const manoDeObra = parametro.grupo === "mano_de_obra";
  const campoId = `parametro-${parametro.clave}`;

  function abrir() {
    setValor(String(actual));
    setError(null);
    setErrorGeneral(null);
    setAbierto(true);
  }

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErrorGeneral(null);
    const respuesta = await pedir<{ cotizaciones_desactualizadas: number }>(`/api/v1/variables/${parametro.id}`, {
      method: "PATCH",
      body: JSON.stringify({ valor: escrito, updated_at: parametro.updated_at }),
    });
    setEnviando(false);

    if (!respuesta.ok) {
      if (respuesta.error.estado === 409) {
        setErrorGeneral("Alguien lo cambió mientras lo tenía abierto. Cierre y recargue.");
        return;
      }
      const porCampo = erroresPorCampo(respuesta.error);
      setError(porCampo.valor?.[0] ?? null);
      if (!porCampo.valor) setErrorGeneral(mensajeDeError(respuesta.error));
      return;
    }

    const n = respuesta.datos.cotizaciones_desactualizadas;
    notificar({
      tono: n > 0 ? "advertencia" : "exito",
      titulo: `${parametro.nombre}: ${valorLegible(nuevo, parametro.unidad)}`,
      descripcion: !manoDeObra
        ? "Cuenta para lo que se emita desde ahora."
        : n > 0
          ? `${n} ${n === 1 ? "cotización emitida quedó desactualizada" : "cotizaciones emitidas quedaron desactualizadas"}.`
          : "Ninguna cotización emitida quedó desactualizada por este cambio.",
    });
    setAbierto(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="outline" size="sm" className="h-11 md:h-8" onClick={abrir} aria-label={`Cambiar ${parametro.nombre}`}>
        <Pencil className="size-4" />
        Cambiar
      </Button>

      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo={parametro.nombre}
        descripcion={
          manoDeObra
            ? "Al guardar, las cotizaciones emitidas vigentes quedan marcadas como desactualizadas: el cliente tiene la tarifa de entonces. Las aprobadas no se tocan."
            : "Cuenta para lo que se emita desde ahora; lo ya emitido no cambia."
        }
      >
        <form onSubmit={guardar} noValidate className="flex flex-col gap-4">
          {errorGeneral ? <Notificacion tono="error">{errorGeneral}</Notificacion> : null}
          <p className="text-sm">
            Actual: <span className="font-mono tabular-nums">{valorLegible(actual, parametro.unidad)}</span>
          </p>
          <div className="space-y-1.5">
            <Label htmlFor={campoId}>Valor nuevo</Label>
            <div className="flex items-center gap-2">
              <Input
                id={campoId}
                inputMode="decimal"
                className="h-11 max-w-40 font-mono tabular-nums md:h-9"
                value={valor}
                onChange={(e) => {
                  setValor(e.target.value);
                  setError(null);
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={describeError(campoId, error) ?? `${campoId}-diferencia`}
              />
              <span className="text-muted-foreground text-sm">{unidadDelCampo(parametro.unidad)}</span>
            </div>
            <ErrorDeCampo campo={campoId}>{error}</ErrorDeCampo>
            {cambio ? (
              <p id={`${campoId}-diferencia`} className={cambio.grande ? "text-warning-fuerte text-sm font-medium" : "text-muted-foreground text-sm"}>
                {cambio.texto}
                {cambio.grande ? " · ¿seguro? Es un cambio grande" : ""}
              </p>
            ) : null}
          </div>
          <Button type="submit" variant="brand" className="h-11 md:h-9" disabled={enviando || escrito === ""}>
            {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
            Guardar
          </Button>

          {parametro.historial.length > 0 ? (
            <div className="border-t pt-3">
              <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">Últimos cambios</p>
              <ul className="space-y-1 text-sm">
                {parametro.historial.map((c) => (
                  <li key={c.at} className="flex flex-wrap justify-between gap-x-3">
                    <span className="font-mono tabular-nums">
                      {valorLegible(Number(c.valor_anterior), parametro.unidad)} → {valorLegible(Number(c.valor_nuevo), parametro.unidad)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {fechaHora(c.at)}
                      {c.por ? ` · ${c.por}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </form>
      </PanelResponsivo>
    </>
  );
}
