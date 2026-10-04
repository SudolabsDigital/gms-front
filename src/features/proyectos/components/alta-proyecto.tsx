"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Plus } from "lucide-react";

import { Notificacion } from "@/components/comunes/notificacion";
import { BarraFijaMovil } from "@/components/comunes/barra-fija-movil";
import { describeError, ErrorDeCampo } from "@/components/comunes/error-de-campo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BuscadorCliente, type ClienteElegido } from "@/features/proyectos/components/buscador-cliente";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import { SelectorDeOrigen } from "@/features/proyectos/components/selector-origen";
import { rutaDeSeccion } from "@/features/proyectos/pestanas";
import type { Origen, ProyectoFicha } from "@/features/proyectos/types";
import { erroresPorCampo, mensajeDeError, pedir, sinErrores } from "@/lib/api-cliente";
import { notificar } from "@/lib/notificar";
import { cn } from "@/lib/utils";

type Formulario = {
  cliente: ClienteElegido | null;
  nombre: string;
  origen: Origen;
  enlace_origen: string;
  direccion_obra: string;
  distrito: string;
  notas: string;
};

/** Los errores que el servidor puede devolver sobre el cliente, con él existente o al vuelo */
const CLAVES_DEL_CLIENTE = ["cliente_id", "cliente", "cliente.nombre", "cliente.telefono"];

const VACIO: Formulario = {
  cliente: null,
  nombre: "",
  // Preseleccionado: el portal manda los leads a WhatsApp (`51-ui` § alta, `PROJECT_CONTEXT` decisión 10)
  origen: "whatsapp",
  enlace_origen: "",
  direccion_obra: "",
  distrito: "",
  notas: "",
};

/**
 * El alta del proyecto cuando llega el lead (M1, `proyectos/51-ui` § alta): hoja inferior en el móvil,
 * diálogo en el escritorio, sobre la lista. Tres campos obligatorios y uno ya resuelto.
 *
 * Dos disparadores y un solo formulario: en el escritorio, el botón de la cabecera; en el móvil, uno
 * fijo abajo, al alcance del pulgar. Si la red falla, lo escrito se conserva (`ENT.C4`).
 */
/**
 * `variante`: el relleno del botón de escritorio. `disparador`: qué botones se pintan —`pagina`, los dos; `barra`, solo
 * el de escritorio, el de la barra de contexto (SEC.9a); `movil`, solo el fijo de abajo—. Desde el armazón, el de
 * escritorio vive en la barra y las páginas ponen solo el del móvil: «Nuevo proyecto» no sale dos veces en una pantalla.
 */
export function AltaProyecto({
  variante = "brand",
  disparador = "pagina",
}: { variante?: "brand" | "outline"; disparador?: "pagina" | "barra" | "movil" } = {}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState<Formulario>(VACIO);
  const [masDatos, setMasDatos] = useState(false);
  const [errores, setErrores] = useState<Record<string, string[]>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Tocar un campo retira su error: el rojo es de lo que se envió, no de lo que se está corrigiendo
  const campo = <K extends keyof Formulario>(clave: K, valor: Formulario[K]) => {
    setDatos((actual) => ({ ...actual, [clave]: valor }));
    setErrores((actuales) => sinErrores(actuales, clave === "cliente" ? CLAVES_DEL_CLIENTE : [clave]));
  };

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErrorGeneral(null);

    const opcional = (texto: string) => (texto.trim() === "" ? undefined : texto.trim());
    const cliente = datos.cliente;

    const respuesta = await pedir<ProyectoFicha>("/api/v1/proyectos", {
      method: "POST",
      body: JSON.stringify({
        ...(cliente?.modo === "existente" ? { cliente_id: cliente.cliente.id } : {}),
        ...(cliente?.modo === "nuevo"
          ? { cliente: { nombre: cliente.nombre.trim(), telefono: opcional(cliente.telefono) } }
          : {}),
        nombre: datos.nombre.trim(),
        origen: datos.origen,
        enlace_origen: opcional(datos.enlace_origen),
        direccion_obra: opcional(datos.direccion_obra),
        distrito: opcional(datos.distrito),
        notas: opcional(datos.notas),
      }),
    });

    setEnviando(false);

    if (!respuesta.ok) {
      const porCampo = erroresPorCampo(respuesta.error);
      setErrores(porCampo);
      // Lo que no tiene campo —sin conexión, un 5xx— va arriba, con el mensaje real
      if (Object.keys(porCampo).length === 0) setErrorGeneral(mensajeDeError(respuesta.error));
      if (porCampo.direccion_obra || porCampo.distrito || porCampo.notas) setMasDatos(true);
      return;
    }

    // Se vuelve a la lista con el nuevo arriba (`51-ui`); lo siguiente es cotizar, así que el aviso lleva a la ficha
    // sin buscar la fila (recorrido UX.0, R32)
    const creado = respuesta.datos;
    notificar({
      tono: "exito",
      titulo: `${creado.codigo} registrado`,
      descripcion: creado.nombre,
      accion: { etiqueta: "Abrir", onClick: () => router.push(rutaDeSeccion(creado.id, "resumen")) },
    });
    setDatos(VACIO);
    setErrores({});
    setMasDatos(false);
    setAbierto(false);
    // Vuelve a la lista con el proyecto nuevo arriba: la lista se ordena por actividad reciente
    router.refresh();
  }

  const errorDe = (...claves: string[]) => claves.flatMap((c) => errores[c] ?? [])[0];

  return (
    <>
      {disparador !== "movil" ? (
        <Button variant={variante} className="hidden md:inline-flex" onClick={() => setAbierto(true)}>
          <Plus className="size-4" />
          Nuevo proyecto
        </Button>
      ) : null}

      {disparador !== "barra" ? (
        <BarraFijaMovil>
          <Button variant="brand" className="h-11 w-full" onClick={() => setAbierto(true)}>
            <Plus className="size-4" />
            Nuevo proyecto
          </Button>
        </BarraFijaMovil>
      ) : null}

      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo="Nuevo proyecto"
        descripcion="Lo mínimo para no perder el lead. El resto se completa después, en la ficha."
      >
        <form onSubmit={guardar} className="flex flex-col gap-4" noValidate>
          {errorGeneral ? <Notificacion tono="error">{errorGeneral}</Notificacion> : null}

          <BuscadorCliente
            valor={datos.cliente}
            alCambiar={(valor) => campo("cliente", valor)}
            error={errorDe(...CLAVES_DEL_CLIENTE)}
          />

          <div className="space-y-1.5">
            <Label htmlFor="proyecto-nombre">Qué quiere</Label>
            <Input
              id="proyecto-nombre"
              className="h-11 md:h-9"
              placeholder="Mampara de ducha — Jr. Ancash 450"
              value={datos.nombre}
              maxLength={150}
              onChange={(e) => campo("nombre", e.target.value)}
              aria-invalid={Boolean(errorDe("nombre"))}
              aria-describedby={describeError("proyecto-nombre", errorDe("nombre"))}
            />
            <ErrorDeCampo campo="proyecto-nombre">{errorDe("nombre")}</ErrorDeCampo>
          </div>

          <SelectorDeOrigen valor={datos.origen} alCambiar={(origen) => campo("origen", origen)} error={errorDe("origen")} />

          <div className="space-y-1.5">
            <Label htmlFor="proyecto-enlace">Enlace de lo que vio (opcional)</Label>
            <Input
              id="proyecto-enlace"
              type="url"
              inputMode="url"
              className="h-11 md:h-9"
              placeholder="Pegue el enlace que llegó por WhatsApp"
              value={datos.enlace_origen}
              onChange={(e) => campo("enlace_origen", e.target.value)}
              aria-invalid={Boolean(errorDe("enlace_origen"))}
              aria-describedby={describeError("proyecto-enlace", errorDe("enlace_origen"))}
            />
            <ErrorDeCampo campo="proyecto-enlace">{errorDe("enlace_origen")}</ErrorDeCampo>
          </div>

          <div>
            <button
              type="button"
              className="text-muted-foreground flex min-h-11 items-center gap-1 text-sm md:min-h-8"
              aria-expanded={masDatos}
              onClick={() => setMasDatos((v) => !v)}
            >
              <ChevronDown className={cn("size-4 transition-transform", masDatos && "rotate-180")} />
              Más datos: dirección de obra, distrito, notas
            </button>

            {masDatos ? (
              <div className="mt-2 flex flex-col gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="proyecto-direccion">Dirección de obra</Label>
                  <Input
                    id="proyecto-direccion"
                    className="h-11 md:h-9"
                    value={datos.direccion_obra}
                    maxLength={200}
                    onChange={(e) => campo("direccion_obra", e.target.value)}
                    aria-invalid={errorDe("direccion_obra") ? true : undefined}
                    aria-describedby={describeError("proyecto-direccion", errorDe("direccion_obra"))}
                  />
                  <ErrorDeCampo campo="proyecto-direccion">{errorDe("direccion_obra")}</ErrorDeCampo>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proyecto-distrito">Distrito</Label>
                  <Input
                    id="proyecto-distrito"
                    className="h-11 md:h-9"
                    value={datos.distrito}
                    maxLength={80}
                    onChange={(e) => campo("distrito", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proyecto-notas">Notas</Label>
                  <Textarea
                    id="proyecto-notas"
                    rows={3}
                    value={datos.notas}
                    onChange={(e) => campo("notas", e.target.value)}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Pegado al pie mientras se desplaza: con «Más datos» abierto quedaba 146 px fuera de la vista (UX.0, R31) */}
          <div className="bg-background sticky bottom-0 -mb-1 pt-2 pb-1">
            <Button type="submit" variant="brand" className="h-11 w-full md:h-9" disabled={enviando}>
              {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
              Registrar proyecto
            </Button>
          </div>
        </form>
      </PanelResponsivo>
    </>
  );
}
