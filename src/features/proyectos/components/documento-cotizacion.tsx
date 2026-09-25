"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AvisoDeError } from "@/components/comunes/aviso-de-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Cotizacion } from "@/features/proyectos/types";
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

/** «12,5» se escribe con coma en un teclado peruano; la API lee el punto. No es formatear: es leer lo escrito */
const aNumero = (texto: string) => texto.trim().replace(",", ".");

/**
 * Lo que el documento decide sobre el trato entero: margen, transporte, descuento con su motivo y validez
 * (`proyectos/50-api` § el borrador). Solo se envía lo que cambió, con la versión leída; el servidor recompone
 * el total y lo devuelve. Aquí no se suma nada (`G-32`).
 */
export function DocumentoCotizacion({ cotizacion, puedeEditar }: { cotizacion: Cotizacion; puedeEditar: boolean }) {
  const router = useRouter();
  const [datos, setDatos] = useState<Campos>(camposDe(cotizacion));
  const [errores, setErrores] = useState<Record<string, string[]>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [conflicto, setConflicto] = useState<string[] | null>(null);
  const [enviando, setEnviando] = useState(false);

  const original = camposDe(cotizacion);
  const cambios = (Object.keys(datos) as (keyof Campos)[]).filter((clave) => datos[clave].trim() !== original[clave].trim());
  const conDescuento = Number(aNumero(datos.descuento)) > 0;

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

  const errorDe = (clave: string) => errores[clave]?.[0];

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

            <div className="flex items-baseline justify-between border-t pt-3">
              <span className="font-semibold">
                Total <span className="text-muted-foreground text-xs font-normal">con IGV</span>
              </span>
              <span className="font-mono text-lg font-semibold tabular-nums">{moneda(cotizacion.total)}</span>
            </div>
            {cambios.length > 0 ? (
              <p className="text-muted-foreground -mt-2 text-xs">El total se recalcula al guardar.</p>
            ) : null}

            {puedeEditar ? (
              <div className="flex flex-col gap-2 md:flex-row md:justify-end">
                <Button type="submit" variant={cambios.length > 0 ? "brand" : "outline"} className="h-11 md:h-9" disabled={enviando || cambios.length === 0}>
                  {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
                  Guardar
                </Button>
                <div className="flex flex-col items-center gap-1 md:items-end">
                  <Button type="button" variant="outline" className="h-11 w-full md:h-9 md:w-auto" disabled>
                    Emitir
                  </Button>
                  <span className="text-muted-foreground text-xs">Llega con la emisión</span>
                </div>
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
