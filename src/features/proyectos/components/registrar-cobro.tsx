"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Notificacion } from "@/components/comunes/notificacion";
import { describeError, ErrorDeCampo } from "@/components/comunes/error-de-campo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BotonesDeEleccion } from "@/features/proyectos/components/botones-de-eleccion";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import { MEDIOS_COBRO, TIPOS_COBRO } from "@/features/proyectos/textos";
import type { MedioCobro, ProyectoFicha, TipoCobro } from "@/features/proyectos/types";
import { erroresPorCampo, mensajeDeError, pedir } from "@/lib/api-cliente";
import { diaDe, diaDeHoy, moneda } from "@/lib/formato";
import { notificar } from "@/lib/notificar";

/**
 * «Registrar cobro» (`proyectos/50-api` § cobros, tajada C.1): el dinero como hecho, con **el día en que se
 * cobró**, el medio y el número de operación.
 *
 * El monto se propone según el tipo —el anticipo sugerido o el saldo, **los dos calculados por el servidor**— y se
 * puede cambiar: el front no compone importes (`G-32`). Si deja el saldo bajo cero, el servidor lo rechaza
 * (`COBRO_EXCEDE_SALDO`, decisión 27) y el mensaje dice cuánto queda.
 */
export function RegistrarCobro({
  proyecto,
  etiqueta = "Registrar cobro",
  variante = "outline",
  tipoInicial,
  className,
}: {
  proyecto: ProyectoFicha;
  etiqueta?: string;
  variante?: "brand" | "outline";
  /** El botón dice qué se cobra: «Registrar saldo» abría en «Parcial» con el monto vacío (recorrido UX.0, R07) */
  tipoInicial?: TipoCobro;
  className?: string;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState<TipoCobro>("anticipo");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [medio, setMedio] = useState<MedioCobro>("yape_plin");
  const [referencia, setReferencia] = useState("");
  const [errores, setErrores] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const hayCobros = proyecto.cobros.some((c) => c.anulado_at === null);

  /** Lo que propone el servidor para cada tipo; el parcial, nada */
  const sugerido = (elegido: TipoCobro): string => {
    const valor = elegido === "anticipo" ? proyecto.anticipo_sugerido : elegido === "saldo" ? proyecto.saldo : null;
    return valor !== null && valor !== undefined && valor > 0 ? String(valor) : "";
  };

  function abrir() {
    // El primero suele ser el anticipo; después, un parcial o el saldo
    const inicial: TipoCobro = tipoInicial ?? (hayCobros ? "parcial" : "anticipo");
    setTipo(inicial);
    setMonto(sugerido(inicial));
    setFecha(diaDeHoy());
    setMedio("yape_plin");
    setReferencia("");
    setErrores({});
    setError(null);
    setAbierto(true);
  }

  function elegirTipo(elegido: TipoCobro) {
    setTipo(elegido);
    setMonto(sugerido(elegido));
  }

  async function registrar() {
    setEnviando(true);
    setErrores({});
    setError(null);

    const respuesta = await pedir<ProyectoFicha>(`/api/v1/proyectos/${proyecto.id}/cobros`, {
      method: "POST",
      body: JSON.stringify({ tipo, monto: monto.replace(",", "."), fecha, medio, referencia: referencia.trim() || null }),
    });
    setEnviando(false);

    if (!respuesta.ok) {
      const porCampo = erroresPorCampo(respuesta.error);
      // `COBRO_EXCEDE_SALDO` y `FECHA_ANTERIOR_AL_PROYECTO` nombran su campo: van debajo de él
      if (Object.keys(porCampo).some((campo) => ["monto", "fecha", "tipo", "medio", "referencia"].includes(campo))) {
        setErrores(porCampo);
      } else {
        setError(mensajeDeError(respuesta.error));
      }
      return;
    }

    const saldo = respuesta.datos.saldo;
    notificar({
      tono: "exito",
      titulo: `${TIPOS_COBRO[tipo]} registrado`,
      descripcion:
        saldo === 0 ? "Pagado por completo." : saldo !== undefined && saldo !== null ? `Queda un saldo de ${moneda(saldo)}.` : undefined,
    });
    setAbierto(false);
    router.refresh();
  }

  const campo = (nombre: string) => errores[nombre]?.[0];

  return (
    <>
      <Button variant={variante} className={className ?? "h-11 md:h-9"} onClick={abrir}>
        {etiqueta}
      </Button>

      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo={`Registrar cobro · ${proyecto.codigo}`}
        descripcion={
          proyecto.saldo !== undefined && proyecto.saldo !== null
            ? `Saldo pendiente: ${moneda(proyecto.saldo)}. Un cobro no puede pasarlo.`
            : "El cobro queda en la historia con su día, su medio y quién lo registró."
        }
      >
        <div className="flex flex-col gap-4">
          {error ? <Notificacion tono="error">{error}</Notificacion> : null}

          <BotonesDeEleccion leyenda="Qué se cobra" opciones={TIPOS_COBRO} valor={tipo} alCambiar={elegirTipo} error={campo("tipo")} />

          <div className="space-y-1.5">
            <Label htmlFor="cobro-monto">Monto (S/)</Label>
            <Input
              id="cobro-monto"
              inputMode="decimal"
              className="h-11 font-mono tabular-nums md:h-9"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              aria-invalid={campo("monto") ? true : undefined}
              aria-describedby={describeError("cobro-monto", campo("monto"))}
            />
            {tipo === "anticipo" && proyecto.anticipo_sugerido ? (
              <p className="text-muted-foreground text-xs">Se propone el anticipo acordado: {moneda(proyecto.anticipo_sugerido)}.</p>
            ) : null}
            <ErrorDeCampo campo="cobro-monto">{campo("monto")}</ErrorDeCampo>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cobro-fecha">Día del cobro</Label>
            <Input
              id="cobro-fecha"
              type="date"
              className="h-11 md:h-9"
              min={diaDe(proyecto.created_at)}
              max={diaDeHoy()}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              aria-invalid={campo("fecha") ? true : undefined}
              aria-describedby={describeError("cobro-fecha", campo("fecha"))}
            />
            <ErrorDeCampo campo="cobro-fecha">{campo("fecha")}</ErrorDeCampo>
          </div>

          <BotonesDeEleccion leyenda="Cómo pagó" opciones={MEDIOS_COBRO} valor={medio} alCambiar={setMedio} error={campo("medio")} />

          <div className="space-y-1.5">
            <Label htmlFor="cobro-referencia">N.º de operación (opcional)</Label>
            <Input
              id="cobro-referencia"
              className="h-11 md:h-9"
              maxLength={80}
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              aria-invalid={campo("referencia") ? true : undefined}
              aria-describedby={describeError("cobro-referencia", campo("referencia"))}
            />
            <ErrorDeCampo campo="cobro-referencia">{campo("referencia")}</ErrorDeCampo>
          </div>

          <Button variant="brand" className="h-11 md:h-9" onClick={registrar} disabled={enviando || monto.trim() === "" || fecha === ""}>
            {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
            Registrar {TIPOS_COBRO[tipo].toLowerCase()}
          </Button>
        </div>
      </PanelResponsivo>
    </>
  );
}
