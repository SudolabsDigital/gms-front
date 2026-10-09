"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { describeError, ErrorDeCampo } from "@/components/comunes/error-de-campo";
import { Notificacion } from "@/components/comunes/notificacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import type { Cotizacion, ItemCotizacion } from "@/features/proyectos/types";
import { erroresPorCampo, mensajeDeError, pedir, sinErrores } from "@/lib/api-cliente";
import { notificar, notificarConflicto } from "@/lib/notificar";

type Clave = "ancho_cm" | "alto_cm" | "cantidad" | "ubicacion";
type Campos = Record<Clave, string>;

const camposDe = (item: ItemCotizacion | null): Campos => ({
  ancho_cm: item ? String(item.ancho_cm) : "",
  alto_cm: item ? String(item.alto_cm) : "",
  cantidad: item ? String(item.cantidad) : "",
  ubicacion: item?.ubicacion ?? "",
});

/**
 * Editar una línea del borrador sin quitarla y volver a calcularla (R18, `proyectos/50-api` § editar una línea). Solo
 * viaja lo que cambió, con la versión leída del documento. El servidor recalcula la línea si cambian medidas o cantidad;
 * la ubicación sola no toca el importe. El tipo no se cambia aquí: otra ventana es quitar y agregar.
 */
export function EditarLinea({
  item,
  documento,
  alCerrar,
}: {
  /** La línea que se edita; con `null` el panel está cerrado */
  item: ItemCotizacion | null;
  /** El documento leído: su `updated_at` es el del bloqueo optimista */
  documento: Cotizacion;
  alCerrar: () => void;
}) {
  const router = useRouter();
  const [datos, setDatos] = useState<Campos>(camposDe(item));
  const [errores, setErrores] = useState<Record<string, string[]>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const campo = (clave: Clave, valor: string) => {
    setDatos((actual) => ({ ...actual, [clave]: valor }));
    setErrores((actuales) => sinErrores(actuales, [clave]));
  };

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!item) return;

    const original = camposDe(item);
    const cambios = Object.fromEntries(
      (Object.keys(datos) as Clave[]).filter((clave) => datos[clave].trim() !== original[clave]).map((clave) => [clave, datos[clave].trim()]),
    );

    if (Object.keys(cambios).length === 0) {
      alCerrar();
      return;
    }

    setEnviando(true);
    setErrorGeneral(null);
    const respuesta = await pedir<Cotizacion>(`/api/v1/cotizacion-items/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...cambios, updated_at: documento.updated_at }),
    });
    setEnviando(false);

    if (!respuesta.ok) {
      if (respuesta.error.estado === 409) {
        notificarConflicto();
        alCerrar();
        router.refresh();
        return;
      }
      // Bajo su campo lo que es de un campo; arriba lo que no lo es (el motor, el descuento)
      const porCampo = erroresPorCampo(respuesta.error);
      setErrores(porCampo);
      if (Object.keys(porCampo).length === 0) setErrorGeneral(mensajeDeError(respuesta.error));
      return;
    }

    notificar({ tono: "exito", titulo: "Línea guardada", descripcion: `${item.tipo.nombre}${datos.ubicacion.trim() ? ` · ${datos.ubicacion.trim()}` : ""}` });
    alCerrar();
    router.refresh();
  }

  const errorDe = (clave: string) => errores[clave]?.[0];
  const entrada = (clave: Clave, etiqueta: string, extra: Partial<React.ComponentProps<typeof Input>> = {}) => {
    const id = `linea-${clave}`;
    const error = errorDe(clave);
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{etiqueta}</Label>
        <Input
          id={id}
          size="control"
          value={datos[clave]}
          onChange={(e) => campo(clave, e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describeError(id, error)}
          {...extra}
        />
        <ErrorDeCampo campo={id}>{error}</ErrorDeCampo>
      </div>
    );
  };

  return (
    <PanelResponsivo
      abierto={item !== null}
      alCambiar={(abierto) => {
        if (!abierto) alCerrar();
      }}
      titulo="Editar línea"
      descripcion={
        item
          ? `${item.tipo.nombre}. Cambiar la medida o la cantidad recalcula la línea con los precios de hoy; la ubicación sola no cambia el importe.`
          : ""
      }
    >
      <form onSubmit={guardar} noValidate className="flex flex-col gap-4">
        {errorGeneral ? <Notificacion tono="error">{errorGeneral}</Notificacion> : null}
        <div className="grid grid-cols-2 gap-3">
          {entrada("ancho_cm", "Ancho (cm)", { inputMode: "decimal", className: "font-mono" })}
          {entrada("alto_cm", "Alto (cm)", { inputMode: "decimal", className: "font-mono" })}
        </div>
        {entrada("cantidad", "Cantidad", { inputMode: "numeric", className: "font-mono" })}
        {entrada("ubicacion", "Ubicación", { maxLength: 80, placeholder: "Dormitorio 2" })}
        <Button type="submit" variant="brand" size="control" disabled={enviando}>
          {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
          Guardar
        </Button>
      </form>
    </PanelResponsivo>
  );
}
