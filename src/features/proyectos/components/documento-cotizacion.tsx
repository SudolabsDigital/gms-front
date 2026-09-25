"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AvisoDeError } from "@/components/comunes/aviso-de-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DesgloseCotizacion, type EstadoDelDesglose } from "@/features/proyectos/components/desglose-cotizacion";
import { EmitirCotizacion } from "@/features/proyectos/components/emitir-cotizacion";
import type { Cotizacion, Desglose } from "@/features/proyectos/types";
import { moneda } from "@/lib/formato";
import { erroresPorCampo, mensajeDeError, pedir, sinErrores } from "@/lib/api-cliente";

type Campos = {
  margen_pct: string;
  transporte: string;
  descuento: string;
  descuento_motivo: string;
  validez_dias: string;
};

const ETIQUETAS: Record<keyof Campos | "items", string> = {
  margen_pct: "margen",
  transporte: "transporte",
  descuento: "descuento",
  descuento_motivo: "motivo del descuento",
  validez_dias: "validez",
  items: "ítems",
};

function camposDe(c: Cotizacion): Campos {
  return {
    margen_pct: String(c.margen_pct ?? 0),
    transporte: String(c.transporte ?? 0),
    descuento: String(c.descuento ?? 0),
    descuento_motivo: c.descuento_motivo ?? "",
    validez_dias: c.validez_dias === null ? "" : String(c.validez_dias),
  };
}

/** Los campos que cambian el total: los que se previsualizan en seco */
const IMPORTES = ["margen_pct", "transporte", "descuento"] as const;

/** «12,5» se escribe con coma en un teclado peruano; la API lee el punto. No es formatear: es leer lo escrito */
const aNumero = (texto: string) => texto.trim().replace(",", ".");

/**
 * Lo que el documento decide sobre el trato entero: margen, transporte, descuento con su motivo y validez
 * (`proyectos/50-api` § el borrador). Solo se envía lo que cambió, con la versión leída; el servidor recompone
 * el total y lo devuelve. Aquí no se suma nada (`G-32`).
 */
export function DocumentoCotizacion({
  cotizacion,
  puedeEditar,
  puedeEmitir,
}: {
  cotizacion: Cotizacion;
  puedeEditar: boolean;
  /** `cotizaciones:emitir` */
  puedeEmitir: boolean;
}) {
  const router = useRouter();
  const [datos, setDatos] = useState<Campos>(camposDe(cotizacion));
  const [errores, setErrores] = useState<Record<string, string[]>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [conflicto, setConflicto] = useState<string[] | null>(null);
  const [enviando, setEnviando] = useState(false);

  const original = camposDe(cotizacion);
  const cambios = (Object.keys(datos) as (keyof Campos)[]).filter((clave) => datos[clave].trim() !== original[clave].trim());
  const conDescuento = Number(aNumero(datos.descuento)) > 0;

  // El desglose en vivo (decisión del usuario, B.2): lo que saldría con lo escrito, calculado en seco por el
  // servidor con la misma función que guarda. Lo vacío no se manda: vale lo guardado
  const importes = Object.fromEntries(
    IMPORTES.filter((clave) => aNumero(datos[clave]) !== "").map((clave) => [clave, aNumero(datos[clave])]),
  );
  const claveDeImportes = JSON.stringify(importes);
  const importesCambiaron = IMPORTES.some((clave) => datos[clave].trim() !== original[clave].trim());
  const [previa, setPrevia] = useState<{ clave: string; desglose: Desglose } | null>(null);
  const [erroresPrevios, setErroresPrevios] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!importesCambiaron || !puedeEditar) return;

    const control = new AbortController();
    // 300 ms, como el cotizador: se pregunta cuando se deja de escribir, no en cada tecla
    const espera = setTimeout(async () => {
      const respuesta = await pedir<{ desglose: Desglose }>(`/api/v1/cotizaciones/${cotizacion.id}/totales`, {
        method: "POST",
        body: claveDeImportes,
        signal: control.signal,
      });
      if (control.signal.aborted) return;

      if (respuesta.ok) {
        setPrevia({ clave: claveDeImportes, desglose: respuesta.datos.desglose });
        setErroresPrevios({});
      } else {
        setPrevia(null);
        setErroresPrevios(erroresPorCampo(respuesta.error));
      }
    }, 300);

    return () => {
      clearTimeout(espera);
      control.abort();
    };
  }, [claveDeImportes, importesCambiaron, puedeEditar, cotizacion.id]);

  const provisional = importesCambiaron && previa?.clave === claveDeImportes;
  const desgloseVisible = provisional ? previa.desglose : cotizacion.desglose;
  const hayErrorPrevio = Object.keys(erroresPrevios).length > 0;
  const estadoDesglose: EstadoDelDesglose = provisional ? "sin-guardar" : importesCambiaron ? "desfasado" : "guardado";
  const notaDesglose =
    estadoDesglose !== "desfasado"
      ? undefined
      : hayErrorPrevio
        ? "Corrija el campo marcado para ver el nuevo total. Arriba, lo guardado."
        : "Calculando el nuevo total…";

  const campo = (clave: keyof Campos, valor: string) => {
    setDatos((actual) => ({ ...actual, [clave]: valor }));
    setErrores((actuales) => sinErrores(actuales, [clave]));
  };

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    if (cambios.length === 0) return;

    const cuerpo = Object.fromEntries(
      cambios.map((clave) => {
        const valor = datos[clave].trim();
        if (clave === "descuento_motivo") return [clave, valor === "" ? null : valor];
        if (clave === "validez_dias") return [clave, valor === "" ? null : aNumero(valor)];
        return [clave, aNumero(valor) === "" ? "0" : aNumero(valor)];
      }),
    );

    setEnviando(true);
    setErrorGeneral(null);
    const respuesta = await pedir<Cotizacion, Cotizacion>(`/api/v1/cotizaciones/${cotizacion.id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...cuerpo, updated_at: cotizacion.updated_at }),
    });
    setEnviando(false);

    if (!respuesta.ok) {
      if (respuesta.error.estado === 409) {
        setConflicto(queCambio(cotizacion, respuesta.error.actual));
        return;
      }
      const porCampo = erroresPorCampo(respuesta.error);
      setErrores(porCampo);
      if (Object.keys(porCampo).length === 0) setErrorGeneral(mensajeDeError(respuesta.error));
      return;
    }

    toast.success("Documento guardado", { description: `Total: ${moneda(respuesta.datos.total)}` });
    router.refresh();
  }

  // El error de lo guardado manda; si no lo hay, el de la previsualización (p. ej. un descuento imposible)
  const errorDe = (clave: string) => errores[clave]?.[0] ?? erroresPrevios[clave]?.[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">El documento</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {conflicto ? (
          <div role="alert" className="flex flex-col gap-3">
            <p className="text-sm font-medium">Alguien cambió esta cotización mientras la tenía abierta.</p>
            <p className="text-muted-foreground text-sm">
              {conflicto.length > 0
                ? `Cambió: ${conflicto.join(", ")}. Recargue para ver lo que hay ahora y vuelva a aplicar lo suyo.`
                : "Recargue para ver lo que hay ahora y vuelva a aplicar lo suyo."}
            </p>
            <Button variant="brand" className="h-11 md:h-9" onClick={() => router.refresh()}>
              Recargar
            </Button>
          </div>
        ) : (
          <form onSubmit={guardar} className="flex flex-col gap-4" noValidate>
            {errorGeneral ? <AvisoDeError>{errorGeneral}</AvisoDeError> : null}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <CampoNumero id="margen_pct" etiqueta="Margen" unidad="%" valor={datos.margen_pct} error={errorDe("margen_pct")} deshabilitado={!puedeEditar} alCambiar={(v) => campo("margen_pct", v)} />
              <CampoNumero id="transporte" etiqueta="Transporte" unidad="S/" valor={datos.transporte} error={errorDe("transporte")} deshabilitado={!puedeEditar} alCambiar={(v) => campo("transporte", v)} />
              <CampoNumero id="descuento" etiqueta="Descuento" unidad="S/" valor={datos.descuento} error={errorDe("descuento")} deshabilitado={!puedeEditar} alCambiar={(v) => campo("descuento", v)} />
              <CampoNumero
                id="validez_dias"
                etiqueta="Validez"
                unidad="días"
                valor={datos.validez_dias}
                marcador={String(cotizacion.validez_por_omision)}
                error={errorDe("validez_dias")}
                deshabilitado={!puedeEditar}
                alCambiar={(v) => campo("validez_dias", v)}
              />
            </div>

            {conDescuento || errorDe("descuento_motivo") ? (
              <div className="space-y-1.5">
                <Label htmlFor="descuento_motivo">Motivo del descuento</Label>
                <Input
                  id="descuento_motivo"
                  className="h-11 md:h-9"
                  maxLength={200}
                  value={datos.descuento_motivo}
                  placeholder="Cierre por WhatsApp · Cliente frecuente…"
                  disabled={!puedeEditar}
                  onChange={(e) => campo("descuento_motivo", e.target.value)}
                />
                {errorDe("descuento_motivo") ? <p className="text-destructive text-sm">{errorDe("descuento_motivo")}</p> : null}
              </div>
            ) : null}

            {cotizacion.avisos.map((aviso) => (
              <p key={aviso.codigo} className="text-muted-foreground flex gap-2 text-sm">
                <AlertTriangle className="text-primary mt-0.5 size-4 shrink-0" />
                {aviso.mensaje}
              </p>
            ))}

            {desgloseVisible ? (
              <div className="border-t pt-3">
                <DesgloseCotizacion desglose={desgloseVisible} estado={estadoDesglose} nota={notaDesglose} />
              </div>
            ) : null}

            {puedeEditar ? (
              <div className="flex flex-col gap-2 md:flex-row md:justify-end">
                <Button type="submit" variant={cambios.length > 0 ? "brand" : "outline"} className="h-11 md:h-9" disabled={enviando || cambios.length === 0}>
                  {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
                  Guardar
                </Button>
                {puedeEmitir ? (
                  <EmitirCotizacion
                    cotizacionId={cotizacion.id}
                    hayCambiosSinGuardar={cambios.length > 0}
                    variante={cambios.length > 0 ? "outline" : "brand"}
                    className="h-11 md:h-9"
                  />
                ) : null}
              </div>
            ) : null}
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function CampoNumero({
  id,
  etiqueta,
  unidad,
  valor,
  marcador,
  error,
  deshabilitado,
  alCambiar,
}: {
  id: string;
  etiqueta: string;
  unidad: string;
  valor: string;
  marcador?: string;
  error?: string;
  deshabilitado: boolean;
  alCambiar: (valor: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {etiqueta} <span className="text-muted-foreground font-normal">({unidad})</span>
      </Label>
      <Input
        id={id}
        inputMode="decimal"
        className="h-11 font-mono tabular-nums md:h-9"
        value={valor}
        placeholder={marcador}
        disabled={deshabilitado}
        aria-invalid={error ? true : undefined}
        onChange={(e) => alCambiar(e.target.value)}
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}

/** Qué cambió entre lo leído y lo que el servidor tiene ahora (`actual` del 409) */
function queCambio(leido: Cotizacion, actual: Cotizacion | undefined): string[] {
  if (!actual) return [];

  const antes = camposDe(leido);
  const ahora = camposDe(actual);
  const campos = (Object.keys(ahora) as (keyof Campos)[]).filter((clave) => ahora[clave] !== antes[clave]).map((clave) => ETIQUETAS[clave]);
  const items = leido.items.map((i) => i.id).join() !== actual.items.map((i) => i.id).join() ? [ETIQUETAS.items] : [];

  return [...items, ...campos];
}
