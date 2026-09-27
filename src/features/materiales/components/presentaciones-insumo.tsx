"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

import { describeError, ErrorDeCampo } from "@/components/comunes/error-de-campo";
import { Notificacion } from "@/components/comunes/notificacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CambiarPrecio } from "@/features/materiales/components/cambiar-precio";
import { contenidoLegible } from "@/features/materiales/contenido";
import type { InsumoFicha } from "@/features/materiales/types";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import { erroresPorCampo, mensajeDeError, pedir } from "@/lib/api-cliente";
import { moneda } from "@/lib/formato";
import { notificar } from "@/lib/notificar";

/**
 * Cómo se compra el insumo (decisión 48, `materiales/10-modelo` § presentaciones): una o varias presentaciones y **una
 * de compra**, de la que sale lo que se cotiza. Cambiar cuál es la de compra puede cambiar lo que cuesta cada cm, m² o
 * unidad, y entonces desactualiza lo emitido: el servidor lo dice y aquí se avisa.
 */
export function PresentacionesInsumo({
  insumo,
  gestiona,
  cambiaPrecios,
}: {
  insumo: InsumoFicha;
  gestiona: boolean;
  cambiaPrecios: boolean;
}) {
  const router = useRouter();
  const [trabajando, setTrabajando] = useState<string | null>(null);

  async function accion(id: string, metodo: "POST" | "DELETE", ruta: string, exito: string) {
    setTrabajando(id);
    const respuesta = await pedir<{ cotizaciones_desactualizadas?: number }>(ruta, { method: metodo });
    setTrabajando(null);
    if (!respuesta.ok) {
      notificar({ tono: "error", titulo: "No se pudo", descripcion: mensajeDeError(respuesta.error) });
      return;
    }
    const n = respuesta.datos?.cotizaciones_desactualizadas ?? 0;
    notificar({
      tono: n > 0 ? "advertencia" : "exito",
      titulo: exito,
      descripcion: n > 0 ? `${n} ${n === 1 ? "cotización emitida quedó desactualizada" : "cotizaciones emitidas quedaron desactualizadas"}.` : undefined,
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="divide-y">
        {insumo.presentaciones.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2">
            <span className="min-w-0">
              <span className="font-medium">{p.nombre}</span>
              {p.es_compra ? (
                <span className="border-primary/40 text-primary ml-2 rounded-full border px-2 py-0.5 text-xs font-medium">de compra</span>
              ) : null}
              <span className="text-muted-foreground block text-xs">
                {contenidoLegible(insumo.tipo_medida, p)}
                {p.precio !== undefined ? <> · <span className="font-mono tabular-nums">{moneda(p.precio)}</span></> : null}
              </span>
            </span>
            <span className="flex flex-wrap gap-2">
              {cambiaPrecios && p.precio !== undefined ? (
                <CambiarPrecio
                  titulo={`${insumo.codigo} · ${p.nombre}`}
                  actual={p.precio}
                  por={`por ${p.nombre} (${contenidoLegible(insumo.tipo_medida, p)})`}
                  ruta={`/api/v1/presentaciones/${p.id}/precio`}
                  campo="precio"
                  leido={p.updated_at}
                  compra={p.es_compra}
                  variante="ghost"
                  compacto
                />
              ) : null}
              {gestiona && !p.es_compra ? (
                <>
                  <Button variant="ghost" size="sm" className="h-11 md:h-8" disabled={trabajando === p.id} onClick={() => accion(p.id, "POST", `/api/v1/presentaciones/${p.id}/compra`, `${p.nombre} es ahora la de compra`)}>
                    {trabajando === p.id ? <Loader2 className="size-4 animate-spin" /> : null}
                    Hacer de compra
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground h-11 md:h-8" disabled={trabajando === p.id} onClick={() => accion(p.id, "DELETE", `/api/v1/presentaciones/${p.id}`, `${p.nombre} quitada`)}>
                    Quitar
                  </Button>
                </>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      {gestiona ? <AgregarPresentacion insumo={insumo} /> : null}
    </div>
  );
}

function AgregarPresentacion({ insumo }: { insumo: InsumoFicha }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState({ nombre: "", contenido: "", ancho_cm: "", alto_cm: "" });
  const [errores, setErrores] = useState<Record<string, string[]>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const area = insumo.tipo_medida === "area";

  const campo = (clave: keyof typeof datos, valor: string) => {
    setDatos((d) => ({ ...d, [clave]: valor }));
    setErrores((e) => ({ ...e, [clave]: [] }));
  };

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErrorGeneral(null);
    const numero = (v: string) => (v.trim() === "" ? null : v.trim().replace(",", "."));
    const cuerpo = area
      ? { nombre: datos.nombre.trim(), ancho_cm: numero(datos.ancho_cm), alto_cm: numero(datos.alto_cm) }
      : { nombre: datos.nombre.trim(), contenido: numero(datos.contenido) };
    const respuesta = await pedir(`/api/v1/insumos/${insumo.id}/presentaciones`, { method: "POST", body: JSON.stringify(cuerpo) });
    setEnviando(false);

    if (!respuesta.ok) {
      const porCampo = erroresPorCampo(respuesta.error);
      setErrores(porCampo);
      if (Object.keys(porCampo).length === 0) setErrorGeneral(mensajeDeError(respuesta.error));
      return;
    }
    notificar({ tono: "exito", titulo: `${datos.nombre.trim()} agregada`, descripcion: "Nace a S/ 0 y como alternativa: cárguele el precio o hágala de compra." });
    setAbierto(false);
    setDatos({ nombre: "", contenido: "", ancho_cm: "", alto_cm: "" });
    router.refresh();
  }

  const errorDe = (clave: string) => errores[clave]?.[0];
  const texto = (clave: keyof typeof datos, etiqueta: string, extra: Partial<React.ComponentProps<typeof Input>> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`presentacion-${clave}`}>{etiqueta}</Label>
      <Input
        id={`presentacion-${clave}`}
        className="h-11 md:h-9"
        value={datos[clave]}
        onChange={(e) => campo(clave, e.target.value)}
        aria-invalid={errorDe(clave) ? true : undefined}
        aria-describedby={describeError(`presentacion-${clave}`, errorDe(clave))}
        {...extra}
      />
      <ErrorDeCampo campo={`presentacion-${clave}`}>{errorDe(clave)}</ErrorDeCampo>
    </div>
  );

  return (
    <>
      <Button variant="outline" className="h-11 self-start md:h-9" onClick={() => setAbierto(true)}>
        <Plus className="size-4" />
        Agregar presentación
      </Button>
      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo={`Otra forma de comprar ${insumo.codigo}`}
        descripcion={area ? "Una plancha, con su ancho y alto: el área la calcula el sistema." : insumo.tipo_medida === "lineal" ? "Una barra o un rollo de otro largo." : "Una caja, un paquete…: cuántas unidades trae."}
      >
        <form onSubmit={guardar} noValidate className="flex flex-col gap-4">
          {errorGeneral ? <Notificacion tono="error">{errorGeneral}</Notificacion> : null}
          {texto("nombre", "Nombre", { maxLength: 40, placeholder: area ? "plancha 244×183" : insumo.tipo_medida === "lineal" ? "barra 585" : "caja" })}
          {area ? (
            <div className="grid grid-cols-2 gap-3">
              {texto("ancho_cm", "Ancho (cm)", { inputMode: "decimal", className: "h-11 font-mono md:h-9" })}
              {texto("alto_cm", "Alto (cm)", { inputMode: "decimal", className: "h-11 font-mono md:h-9" })}
            </div>
          ) : (
            texto("contenido", insumo.tipo_medida === "lineal" ? "Largo (cm)" : "Unidades que trae", {
              inputMode: insumo.tipo_medida === "lineal" ? "decimal" : "numeric",
              className: "h-11 font-mono md:h-9",
            })
          )}
          <Button type="submit" variant="brand" className="h-11 md:h-9" disabled={enviando}>
            {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
            Agregar
          </Button>
        </form>
      </PanelResponsivo>
    </>
  );
}
