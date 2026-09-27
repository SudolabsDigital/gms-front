"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";

import { Notificacion } from "@/components/comunes/notificacion";
import { describeError, ErrorDeCampo } from "@/components/comunes/error-de-campo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BuscadorCliente, type ClienteElegido } from "@/features/proyectos/components/buscador-cliente";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import { SelectorDeOrigen } from "@/features/proyectos/components/selector-origen";
import { CAMPOS } from "@/features/proyectos/textos";
import type { Cliente, Origen, ProyectoFicha } from "@/features/proyectos/types";
import { erroresPorCampo, mensajeDeError, pedir, sinErrores } from "@/lib/api-cliente";
import { notificar } from "@/lib/notificar";

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
  const [telefono, setTelefono] = useState(proyecto.cliente.telefono ?? "");
  const [errores, setErrores] = useState<Record<string, string[]>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [conflicto, setConflicto] = useState<string[] | null>(null);
  const [enviando, setEnviando] = useState(false);

  function abrir() {
    setDatos(camposDe(proyecto));
    setCliente({ modo: "existente", cliente: proyecto.cliente });
    setTelefono(proyecto.cliente.telefono ?? "");
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

    const nuevoTelefono = telefono.trim();
    const cambiaTelefono = mismoCliente && nuevoTelefono !== (proyecto.cliente.telefono ?? "").trim();

    if (Object.keys(cambios).length === 0 && !cambiaTelefono) {
      setAbierto(false);
      return;
    }

    setEnviando(true);
    setErrorGeneral(null);

    // El teléfono es del cliente, no del proyecto: va a su ruta y con su versión (decisión 39)
    if (cambiaTelefono) {
      const delCliente = await pedir<Cliente>(`/api/v1/clientes/${proyecto.cliente.id}`, {
        method: "PATCH",
        body: JSON.stringify({ telefono: nuevoTelefono === "" ? null : nuevoTelefono, updated_at: proyecto.cliente.updated_at }),
      });
      if (!delCliente.ok) {
        setEnviando(false);
        if (delCliente.error.estado === 409) {
          setConflicto(["teléfono del cliente"]);
          return;
        }
        const porCampo = erroresPorCampo(delCliente.error);
        setErrores(porCampo);
        if (Object.keys(porCampo).length === 0) setErrorGeneral(mensajeDeError(delCliente.error));
        return;
      }
    }

    if (Object.keys(cambios).length === 0) {
      setEnviando(false);
      notificar({ tono: "exito", titulo: "Teléfono guardado", descripcion: `Vale para todos los proyectos de ${proyecto.cliente.nombre}.` });
      setAbierto(false);
      router.refresh();
      return;
    }

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

    notificar({ tono: "exito", titulo: "Datos guardados", descripcion: "El cambio quedó en la historia del proyecto." });
    setAbierto(false);
    router.refresh();
  }

  const errorDe = (clave: string) => errores[clave]?.[0];
  // El teléfono se corrige solo del cliente del proyecto: si se elige otro, el suyo es el que ya tiene
  const mismoCliente = cliente?.modo === "existente" && cliente.cliente.id === proyecto.cliente.id;

  return (
    <>
      {/* 44 px en el móvil, como el resto de la cabecera de la ficha (`52-brief-ficha`) */}
      <Button variant="outline" size="sm" className="h-11 md:h-8" onClick={abrir}>
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
          <Notificacion
            tono="error"
            titulo="Alguien cambió este proyecto mientras lo tenía abierto."
            acciones={[
              {
                etiqueta: "Recargar",
                onClick: () => {
                  setAbierto(false);
                  router.refresh();
                },
              },
            ]}
          >
            {conflicto.length > 0
              ? `Cambió: ${conflicto.join(", ")}. Recargue para ver lo que hay ahora y vuelva a aplicar lo suyo.`
              : "Recargue para ver lo que hay ahora y vuelva a aplicar lo suyo."}
          </Notificacion>
        ) : (
          <form onSubmit={guardar} className="flex flex-col gap-4" noValidate>
            {errorGeneral ? <Notificacion tono="error">{errorGeneral}</Notificacion> : null}

            <div className="space-y-1.5">
              <Label htmlFor="editar-nombre">Nombre</Label>
              <Input
                id="editar-nombre"
                className="h-11 md:h-9"
                value={datos.nombre}
                maxLength={150}
                onChange={(e) => campo("nombre", e.target.value)}
                aria-invalid={errorDe("nombre") ? true : undefined}
                aria-describedby={describeError("editar-nombre", errorDe("nombre"))}
              />
              <ErrorDeCampo campo="editar-nombre">{errorDe("nombre")}</ErrorDeCampo>
            </div>

            <BuscadorCliente valor={cliente} alCambiar={elegirCliente} permitirNuevo={false} error={errorDe("cliente_id")} />

            {mismoCliente ? (
              <div className="space-y-1.5">
                <Label htmlFor="editar-telefono">Teléfono del cliente</Label>
                <Input
                  id="editar-telefono"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="h-11 md:h-9"
                  placeholder="964 123 456"
                  value={telefono}
                  maxLength={30}
                  aria-invalid={errorDe("telefono") ? true : undefined}
                  aria-describedby="editar-telefono-ayuda"
                  onChange={(e) => {
                    setTelefono(e.target.value);
                    setErrores((actuales) => sinErrores(actuales, ["telefono"]));
                  }}
                />
                {errorDe("telefono") ? (
                  <p id="editar-telefono-ayuda" className="text-destructive-fuerte text-sm">{errorDe("telefono")}</p>
                ) : (
                  <p id="editar-telefono-ayuda" className="text-muted-foreground text-xs">
                    Es el de {proyecto.cliente.nombre}: cambia en todos sus proyectos. Con él se envía la cotización por WhatsApp.
                  </p>
                )}
              </div>
            ) : null}

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
                  aria-invalid={errorDe(clave) ? true : undefined}
                  aria-describedby={describeError(`editar-${clave}`, errorDe(clave))}
                />
                <ErrorDeCampo campo={`editar-${clave}`}>{errorDe(clave)}</ErrorDeCampo>
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
