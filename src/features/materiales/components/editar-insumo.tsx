"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus } from "lucide-react";

import { describeError, ErrorDeCampo } from "@/components/comunes/error-de-campo";
import { Notificacion } from "@/components/comunes/notificacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLASE, MEDIDAS } from "@/features/materiales/textos";
import type { Clase, InsumoFicha, Material, Serie, TipoMedida } from "@/features/materiales/types";
import { BotonesDeEleccion } from "@/features/proyectos/components/botones-de-eleccion";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import type { Meta } from "@/features/proyectos/types";
import { erroresPorCampo, mensajeDeError, pedir } from "@/lib/api-cliente";
import { notificar } from "@/lib/notificar";

type Campos = {
  codigo: string;
  nombre_comercial: string;
  clase: Clase;
  tipo_medida: TipoMedida;
  material_id: string;
  serie_id: string;
  presentacion: string;
  largo_barra_cm: string;
  requiere_pieza_unica: boolean;
  peso_kg_por_metro: string;
  color_hex: string;
};

const VACIO: Campos = {
  codigo: "",
  nombre_comercial: "",
  clase: "perfil",
  tipo_medida: "lineal",
  material_id: "",
  serie_id: "",
  presentacion: "",
  largo_barra_cm: "",
  requiere_pieza_unica: false,
  peso_kg_por_metro: "",
  color_hex: "",
};

function camposDe(i: InsumoFicha): Campos {
  return {
    codigo: i.codigo,
    nombre_comercial: i.nombre_comercial,
    clase: i.clase,
    tipo_medida: i.tipo_medida,
    material_id: i.material?.id ?? "",
    serie_id: i.serie?.id ?? "",
    presentacion: i.presentacion ?? "",
    largo_barra_cm: i.largo_barra_cm === null ? "" : String(i.largo_barra_cm),
    requiere_pieza_unica: i.requiere_pieza_unica,
    peso_kg_por_metro: i.peso_kg_por_metro === null ? "" : String(i.peso_kg_por_metro),
    color_hex: i.color_hex ?? "",
  };
}

const SELECT = "border-input bg-background h-11 w-full rounded-md border px-3 text-sm md:h-9";

/**
 * Alta y edición de un insumo (`materiales/50-api`, `51-ui`). **Sin precio**: el precio se cambia aparte, porque deja
 * historial y desactualiza lo emitido (MAE.3). En la edición solo viaja lo que cambió, con la versión leída (`P9`).
 * De primera en el escritorio; en el móvil funciona (decisión del usuario del 2026-09-27).
 */
export function EditarInsumo({ insumo }: { insumo?: InsumoFicha }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState<Campos>(insumo ? camposDe(insumo) : VACIO);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [errores, setErrores] = useState<Record<string, string[]>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function abrir() {
    setDatos(insumo ? camposDe(insumo) : VACIO);
    setErrores({});
    setErrorGeneral(null);
    setAbierto(true);
    const [m, s] = await Promise.all([
      pedir<{ datos: Material[]; meta: Meta }>("/api/v1/materiales?por_pagina=100"),
      pedir<{ datos: Serie[]; meta: Meta }>("/api/v1/series?por_pagina=100"),
    ]);
    if (m.ok) setMateriales(m.datos.datos);
    if (s.ok) setSeries(s.datos.datos);
  }

  const campo = <K extends keyof Campos>(clave: K, valor: Campos[K]) => {
    setDatos((d) => ({ ...d, [clave]: valor }));
    setErrores((e) => ({ ...e, [clave]: [] }));
  };

  /** Lo que se manda: texto vacío es `null`, y en la edición solo lo que cambió */
  function cuerpo(): Record<string, unknown> {
    const valor = (clave: keyof Campos): unknown => {
      const v = datos[clave];
      if (typeof v === "boolean") return v;
      const t = v.trim().replace(",", ".");
      return t === "" ? null : t;
    };
    const claves = (Object.keys(datos) as (keyof Campos)[]).filter((c) => !insumo || datos[c] !== camposDe(insumo)[c]);
    return Object.fromEntries(claves.map((c) => [c, valor(c)]));
  }

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    const cambios = cuerpo();
    if (insumo && Object.keys(cambios).length === 0) {
      setAbierto(false);
      return;
    }

    setEnviando(true);
    setErrorGeneral(null);
    const respuesta = insumo
      ? await pedir<InsumoFicha>(`/api/v1/insumos/${insumo.id}`, { method: "PATCH", body: JSON.stringify({ ...cambios, updated_at: insumo.updated_at }) })
      : await pedir<InsumoFicha>("/api/v1/insumos", { method: "POST", body: JSON.stringify(cambios) });
    setEnviando(false);

    if (!respuesta.ok) {
      if (respuesta.error.estado === 409) {
        setErrorGeneral("Alguien cambió este insumo mientras lo tenía abierto. Cierre, recargue y vuelva a aplicar lo suyo.");
        return;
      }
      const porCampo = erroresPorCampo(respuesta.error);
      setErrores(porCampo);
      if (Object.keys(porCampo).length === 0) setErrorGeneral(mensajeDeError(respuesta.error));
      return;
    }

    notificar({ tono: "exito", titulo: insumo ? "Insumo guardado" : `${respuesta.datos.codigo} dado de alta`, descripcion: insumo ? undefined : "Nace a S/ 0: cargue su precio." });
    setAbierto(false);
    if (insumo) router.refresh();
    else router.push(`/materiales/${respuesta.datos.id}`);
  }

  const errorDe = (clave: string) => errores[clave]?.[0];
  const texto = (clave: "codigo" | "nombre_comercial" | "presentacion" | "largo_barra_cm" | "peso_kg_por_metro" | "color_hex", etiqueta: string, extra: Partial<React.ComponentProps<typeof Input>> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`insumo-${clave}`}>{etiqueta}</Label>
      <Input
        id={`insumo-${clave}`}
        className="h-11 md:h-9"
        value={datos[clave]}
        onChange={(e) => campo(clave, e.target.value)}
        aria-invalid={errorDe(clave) ? true : undefined}
        aria-describedby={describeError(`insumo-${clave}`, errorDe(clave))}
        {...extra}
      />
      <ErrorDeCampo campo={`insumo-${clave}`}>{errorDe(clave)}</ErrorDeCampo>
    </div>
  );

  return (
    <>
      <Button variant={insumo ? "outline" : "brand"} className="h-11 md:h-9" onClick={abrir}>
        {insumo ? <Pencil className="size-4" /> : <Plus className="size-4" />}
        {insumo ? "Editar" : "Nuevo insumo"}
      </Button>

      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo={insumo ? `Editar ${insumo.codigo}` : "Nuevo insumo"}
        descripcion={insumo ? "El precio se cambia aparte: así queda en el historial." : "Nace activo y a S/ 0; el precio se carga después."}
      >
        <form onSubmit={guardar} noValidate className="flex flex-col gap-4">
          {errorGeneral ? <Notificacion tono="error">{errorGeneral}</Notificacion> : null}

          <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
            {texto("codigo", "Código", { maxLength: 30, className: "h-11 font-mono md:h-9" })}
            {texto("nombre_comercial", "Nombre", { maxLength: 150 })}
          </div>

          <BotonesDeEleccion leyenda="Qué es" opciones={CLASE} valor={datos.clase} alCambiar={(v) => campo("clase", v)} error={errorDe("clase")} />
          <BotonesDeEleccion leyenda="Cómo se calcula" opciones={MEDIDAS} valor={datos.tipo_medida} alCambiar={(v) => campo("tipo_medida", v)} error={errorDe("tipo_medida")} />

          {/* La presentación de compra nace con el alta; después se cambia en «Cómo se compra» (decisión 48) */}
          {!insumo && datos.tipo_medida === "lineal"
            ? texto("largo_barra_cm", "Largo de barra o rollo (cm)", { inputMode: "decimal", className: "h-11 font-mono md:h-9" })
            : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="insumo-material">Material</Label>
              <select id="insumo-material" className={SELECT} value={datos.material_id} onChange={(e) => campo("material_id", e.target.value)}>
                <option value="">Sin material</option>
                {materiales.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="insumo-serie">Serie</Label>
              <select id="insumo-serie" className={SELECT} value={datos.serie_id} onChange={(e) => campo("serie_id", e.target.value)}>
                <option value="">Sin serie (vidrios, accesorios…)</option>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {!insumo ? texto("presentacion", "Se compra en", { maxLength: 40, placeholder: datos.tipo_medida === "lineal" ? "barra" : datos.tipo_medida === "area" ? "m²" : "unidad" }) : null}
            {texto("peso_kg_por_metro", "Peso (kg/m)", { inputMode: "decimal", className: "h-11 font-mono md:h-9" })}
            {texto("color_hex", "Color en el plano", { placeholder: "#9CA3AF", className: "h-11 font-mono md:h-9" })}
          </div>

          <label className="flex min-h-11 items-center gap-2 text-sm md:min-h-8">
            <input
              type="checkbox"
              className="size-4"
              checked={datos.requiere_pieza_unica}
              onChange={(e) => campo("requiere_pieza_unica", e.target.checked)}
            />
            Pieza única: no admite empalme
          </label>

          <Button type="submit" variant="brand" className="h-11 md:h-9" disabled={enviando}>
            {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
            {insumo ? "Guardar" : "Dar de alta"}
          </Button>
        </form>
      </PanelResponsivo>
    </>
  );
}
