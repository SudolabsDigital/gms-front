"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus } from "lucide-react";

import { describeError, ErrorDeCampo } from "@/components/comunes/error-de-campo";
import { Notificacion } from "@/components/comunes/notificacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Material } from "@/features/materiales/types";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import { erroresPorCampo, mensajeDeError, pedir } from "@/lib/api-cliente";
import { notificar } from "@/lib/notificar";

/**
 * Alta y edición de una familia de material (MAE.6, `52-brief-materiales` § 11). El código no cambia una vez dado:
 * lo nombran los insumos y los reportes de consumo; se corrigen el nombre y la unidad.
 */
export function EditarFamilia({ familia }: { familia?: Material }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState({ codigo: "", nombre: "", unidad_consumo: "" });
  const [errores, setErrores] = useState<Record<string, string[]>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function abrir() {
    setDatos(familia ? { codigo: familia.codigo, nombre: familia.nombre, unidad_consumo: familia.unidad_consumo } : { codigo: "", nombre: "", unidad_consumo: "" });
    setErrores({});
    setErrorGeneral(null);
    setAbierto(true);
  }

  const campo = (clave: keyof typeof datos, valor: string) => {
    setDatos((d) => ({ ...d, [clave]: valor }));
    setErrores((e) => ({ ...e, [clave]: [] }));
  };

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErrorGeneral(null);
    const cuerpo = familia
      ? { nombre: datos.nombre.trim(), unidad_consumo: datos.unidad_consumo.trim() }
      : { codigo: datos.codigo.trim().toUpperCase(), nombre: datos.nombre.trim(), unidad_consumo: datos.unidad_consumo.trim() };
    const respuesta = familia
      ? await pedir<Material>(`/api/v1/materiales/${familia.id}`, { method: "PATCH", body: JSON.stringify(cuerpo) })
      : await pedir<Material>("/api/v1/materiales", { method: "POST", body: JSON.stringify(cuerpo) });
    setEnviando(false);

    if (!respuesta.ok) {
      const porCampo = erroresPorCampo(respuesta.error);
      setErrores(porCampo);
      if (Object.keys(porCampo).length === 0) setErrorGeneral(mensajeDeError(respuesta.error));
      return;
    }
    notificar({ tono: "exito", titulo: familia ? "Familia guardada" : `${respuesta.datos.nombre} dada de alta` });
    setAbierto(false);
    router.refresh();
  }

  const errorDe = (clave: string) => errores[clave]?.[0];
  const texto = (clave: keyof typeof datos, etiqueta: string, extra: Partial<React.ComponentProps<typeof Input>> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`familia-${clave}`}>{etiqueta}</Label>
      <Input
        id={`familia-${clave}`}
        className="h-11 md:h-9"
        value={datos[clave]}
        onChange={(e) => campo(clave, e.target.value)}
        aria-invalid={errorDe(clave) ? true : undefined}
        aria-describedby={describeError(`familia-${clave}`, errorDe(clave))}
        {...extra}
      />
      <ErrorDeCampo campo={`familia-${clave}`}>{errorDe(clave)}</ErrorDeCampo>
    </div>
  );

  return (
    <>
      {familia ? (
        <Button variant="ghost" size="sm" className="h-11 md:h-8" onClick={abrir} aria-label={`Editar ${familia.nombre}`}>
          <Pencil className="size-4" />
          Editar
        </Button>
      ) : (
        <Button variant="brand" className="h-11 md:h-9" onClick={abrir}>
          <Plus className="size-4" />
          Nueva familia
        </Button>
      )}

      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo={familia ? `Editar ${familia.nombre}` : "Nueva familia de material"}
        descripcion="Agrupa los insumos para saber cuánto se consume de cada material."
      >
        <form onSubmit={guardar} noValidate className="flex flex-col gap-4">
          {errorGeneral ? <Notificacion tono="error">{errorGeneral}</Notificacion> : null}
          {familia ? (
            <p className="text-sm">
              Código <span className="font-mono font-semibold">{familia.codigo}</span>
            </p>
          ) : (
            texto("codigo", "Código", { maxLength: 20, placeholder: "PL", className: "h-11 font-mono uppercase md:h-9" })
          )}
          {texto("nombre", "Nombre", { maxLength: 100, placeholder: "Plástico" })}
          {texto("unidad_consumo", "Unidad de consumo", { maxLength: 20, placeholder: "kg · m2 · m · unidad", list: "unidades-de-consumo" })}
          <datalist id="unidades-de-consumo">
            {["kg", "m2", "m", "unidad", "cartucho"].map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
          <Button type="submit" variant="brand" className="h-11 md:h-9" disabled={enviando}>
            {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
            {familia ? "Guardar" : "Dar de alta"}
          </Button>
        </form>
      </PanelResponsivo>
    </>
  );
}
