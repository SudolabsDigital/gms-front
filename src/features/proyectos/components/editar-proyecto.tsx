"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { AvisoDeError } from "@/components/comunes/aviso-de-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BuscadorCliente, type ClienteElegido } from "@/features/proyectos/components/buscador-cliente";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import { SelectorDeOrigen } from "@/features/proyectos/components/selector-origen";
import { CAMPOS } from "@/features/proyectos/textos";
import type { Origen, ProyectoFicha } from "@/features/proyectos/types";
import { erroresPorCampo, mensajeDeError, pedir, sinErrores } from "@/lib/api-cliente";

type Campos = {
  nombre: string;
  cliente_id: string;
  origen: Origen;
  enlace_origen: string;
  direccion_obra: string;
  distrito: string;
  notas: string;
};

function camposDe(p: ProyectoFicha): Campos {
  return {
    nombre: p.nombre,
    cliente_id: p.cliente.id,
    origen: p.origen,
    enlace_origen: p.enlace_origen ?? "",
    direccion_obra: p.direccion_obra ?? "",
    distrito: p.distrito ?? "",
    notas: p.notas ?? "",
  };
}

/**
 * Corregir los datos del proyecto, en cualquier etapa (decisión del usuario, 2026-09-23: «todo debería
 * ser guardable y editable en cada flujo»). Solo se envía lo que cambió, con la versión leída; el
 * servidor deja el antes y el después en la historia.
 *
 * Si alguien lo cambió entretanto (409), la pantalla dice QUÉ cambió —comparando lo que se leyó con
 * el `actual` que devuelve el servidor— y ofrece recargar. No reintenta sola (`P9`).
 */
export function EditarProyecto({ proyecto }: { proyecto: ProyectoFicha }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState<Campos>(camposDe(proyecto));
  const [cliente, setCliente] = useState<ClienteElegido | null>({ modo: "existente", cliente: proyecto.cliente });
  const [errores, setErrores] = useState<Record<string, string[]>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [conflicto, setConflicto] = useState<string[] | null>(null);
  const [enviando, setEnviando] = useState(false);

  function abrir() {
    setDatos(camposDe(proyecto));
    setCliente({ modo: "existente", cliente: proyecto.cliente });
    setErrores({});
    setErrorGeneral(null);
    setConflicto(null);
    setAbierto(true);
  }

  // Tocar un campo retira su error: el rojo es de lo que se envió, no de lo que se está corrigiendo
  const campo = <K extends keyof Campos>(clave: K, valor: Campos[K]) => {
    setDatos((actual) => ({ ...actual, [clave]: valor }));
    setErrores((actuales) => sinErrores(actuales, [clave]));
  };

  const elegirCliente = (valor: ClienteElegido | null) => {
    setCliente(valor);
    setErrores((actuales) => sinErrores(actuales, ["cliente_id"]));
  };

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();

    const original = camposDe(proyecto);
    const actuales: Campos = {
      ...datos,
      cliente_id: cliente?.modo === "existente" ? cliente.cliente.id : "",
    };
    const cambios = Object.fromEntries(
      (Object.keys(actuales) as (keyof Campos)[])
        .filter((clave) => actuales[clave].trim() !== original[clave].trim())
        .map((clave) => [clave, actuales[clave].trim() === "" ? null : actuales[clave].trim()]),
    );

    if (Object.keys(cambios).length === 0) {
      setAbierto(false);
      return;
    }

    setEnviando(true);
    setErrorGeneral(null);
    // Un 409 trae en `actual` la ficha como está ahora: con ella se dice QUÉ cambió
    const respuesta = await pedir<ProyectoFicha, ProyectoFicha>(`/api/v1/proyectos/${proyecto.id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...cambios, updated_at: proyecto.updated_at }),
    });
    setEnviando(false);

    if (!respuesta.ok) {
      if (respuesta.error.estado === 409) {
        setConflicto(camposQueCambiaron(original, respuesta.error.actual));
        return;
      }
      const porCampo = erroresPorCampo(respuesta.error);
      setErrores(porCampo);
      if (Object.keys(porCampo).length === 0) setErrorGeneral(mensajeDeError(respuesta.error));
      return;
    }

    toast.success("Datos guardados", { description: "El cambio quedó en la historia del proyecto." });
    setAbierto(false);
    router.refresh();
  }

  const errorDe = (clave: string) => errores[clave]?.[0];

  return (
    <>
      <Button variant="outline" size="sm" onClick={abrir}>
        <Pencil className="size-4" />
        Editar datos
      </Button>

      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo={`Datos de ${proyecto.codigo}`}
        descripcion="Se pueden corregir en cualquier etapa. Cada cambio queda en la historia con lo que había antes."
      >
        {conflicto ? (
          <div role="alert" className="flex flex-col gap-3">
            <p className="text-sm font-medium">Alguien cambió este proyecto mientras lo tenía abierto.</p>
            <p className="text-muted-foreground text-sm">
              {conflicto.length > 0
                ? `Cambió: ${conflicto.join(", ")}. Recargue para ver lo que hay ahora y vuelva a aplicar lo suyo.`
                : "Recargue para ver lo que hay ahora y vuelva a aplicar lo suyo."}
            </p>
            <Button
              variant="brand"
              className="h-11 md:h-9"
              onClick={() => {
                setAbierto(false);
                router.refresh();
              }}
            >
              Recargar
            </Button>
          </div>
        ) : (
          <form onSubmit={guardar} className="flex flex-col gap-4" noValidate>
            {errorGeneral ? <AvisoDeError>{errorGeneral}</AvisoDeError> : null}

            <div className="space-y-1.5">
              <Label htmlFor="editar-nombre">Nombre</Label>
              <Input
                id="editar-nombre"
                className="h-11 md:h-9"
                value={datos.nombre}
                maxLength={150}
                onChange={(e) => campo("nombre", e.target.value)}
              />
              {errorDe("nombre") ? <p className="text-destructive text-sm">{errorDe("nombre")}</p> : null}
            </div>

            <BuscadorCliente valor={cliente} alCambiar={elegirCliente} permitirNuevo={false} error={errorDe("cliente_id")} />

            <SelectorDeOrigen valor={datos.origen} alCambiar={(origen) => campo("origen", origen)} error={errorDe("origen")} />

            {(
              [
                ["enlace_origen", "Enlace de origen", "url"],
                ["direccion_obra", "Dirección de obra", "text"],
                ["distrito", "Distrito", "text"],
              ] as const
            ).map(([clave, etiqueta, tipo]) => (
              <div key={clave} className="space-y-1.5">
                <Label htmlFor={`editar-${clave}`}>{etiqueta}</Label>
                <Input
                  id={`editar-${clave}`}
                  type={tipo}
                  className="h-11 md:h-9"
                  value={datos[clave]}
                  onChange={(e) => campo(clave, e.target.value)}
                />
                {errorDe(clave) ? <p className="text-destructive text-sm">{errorDe(clave)}</p> : null}
              </div>
            ))}

            <div className="space-y-1.5">
              <Label htmlFor="editar-notas">Notas</Label>
              <Textarea id="editar-notas" rows={3} value={datos.notas} onChange={(e) => campo("notas", e.target.value)} />
            </div>

            <Button type="submit" variant="brand" className="h-11 md:h-9" disabled={enviando}>
              {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
              Guardar
            </Button>
          </form>
        )}
      </PanelResponsivo>
    </>
  );
}

/** Qué campos difieren entre lo que se leyó y lo que el servidor tiene ahora (`actual` del 409) */
function camposQueCambiaron(leido: Campos, actual: ProyectoFicha | undefined): string[] {
  if (!actual) return [];

  const ahora = camposDe(actual);
  return (Object.keys(ahora) as (keyof Campos)[])
    .filter((clave) => ahora[clave] !== leido[clave])
    .map((clave) => CAMPOS[clave] ?? clave);
}
