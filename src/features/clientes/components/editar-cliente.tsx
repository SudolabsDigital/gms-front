"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";

import { describeError, ErrorDeCampo } from "@/components/comunes/error-de-campo";
import { Notificacion } from "@/components/comunes/notificacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import type { Cliente } from "@/features/proyectos/types";
import { erroresPorCampo, mensajeDeError, pedir, sinErrores } from "@/lib/api-cliente";
import { notificar } from "@/lib/notificar";

type Clave = "nombre" | "telefono" | "documento" | "email" | "direccion" | "distrito" | "notas";
type Campos = Record<Clave, string>;

/** El orden del brief (§ 5): primero lo que identifica, después lo que sirve para escribirle y encontrarlo */
const CAMPOS: { clave: Exclude<Clave, "notas">; etiqueta: string; tipo: string; modo?: "tel" | "numeric" | "email"; max: number; ayuda?: string }[] = [
  { clave: "nombre", etiqueta: "Nombre o razón social", tipo: "text", max: 150 },
  { clave: "telefono", etiqueta: "Teléfono", tipo: "tel", modo: "tel", max: 30, ayuda: "El de WhatsApp: con él se le escribe y se le envía la cotización." },
  { clave: "documento", etiqueta: "DNI o RUC", tipo: "text", modo: "numeric", max: 20, ayuda: "8 dígitos (DNI) u 11 (RUC)." },
  { clave: "email", etiqueta: "Email", tipo: "email", modo: "email", max: 150 },
  { clave: "direccion", etiqueta: "Dirección del cliente", tipo: "text", max: 200, ayuda: "La suya, o la fiscal si tiene RUC. La de la obra va en cada proyecto." },
  { clave: "distrito", etiqueta: "Distrito", tipo: "text", max: 80 },
];

const NOMBRES: Record<Clave, string> = {
  nombre: "nombre", telefono: "teléfono", documento: "DNI o RUC", email: "email",
  direccion: "dirección", distrito: "distrito", notas: "notas",
};

function camposDe(c: Cliente): Campos {
  return {
    nombre: c.nombre,
    telefono: c.telefono ?? "",
    documento: c.documento ?? "",
    email: c.email ?? "",
    direccion: c.direccion ?? "",
    distrito: c.distrito ?? "",
    notas: c.notas ?? "",
  };
}

/**
 * Corregir o completar los datos del cliente (`clientes/52-brief-clientes` § 5). Solo se envía lo que cambió, con la
 * versión leída; el servidor valida el documento (decisión 52) y dice de quién es si ya existe. Lo emitido no cambia:
 * cada cotización guarda los datos con que se emitió.
 */
export function EditarCliente({ cliente }: { cliente: Cliente }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState<Campos>(camposDe(cliente));
  const [errores, setErrores] = useState<Record<string, string[]>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [conflicto, setConflicto] = useState<string[] | null>(null);
  const [enviando, setEnviando] = useState(false);

  function abrir() {
    setDatos(camposDe(cliente));
    setErrores({});
    setErrorGeneral(null);
    setConflicto(null);
    setAbierto(true);
  }

  const campo = (clave: Clave, valor: string) => {
    setDatos((actual) => ({ ...actual, [clave]: valor }));
    setErrores((actuales) => sinErrores(actuales, [clave]));
  };

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault();

    const original = camposDe(cliente);
    const cambios = Object.fromEntries(
      (Object.keys(datos) as Clave[])
        .filter((clave) => datos[clave].trim() !== original[clave].trim())
        .map((clave) => [clave, datos[clave].trim() === "" ? null : datos[clave].trim()]),
    );

    if (Object.keys(cambios).length === 0) {
      setAbierto(false);
      return;
    }

    setEnviando(true);
    setErrorGeneral(null);
    const respuesta = await pedir<Cliente, Cliente>(`/api/v1/clientes/${cliente.id}`, {
      method: "PATCH",
      body: JSON.stringify({ ...cambios, updated_at: cliente.updated_at }),
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

    notificar({ tono: "exito", titulo: "Datos del cliente guardados", descripcion: "Valen para lo que se emita desde ahora." });
    setAbierto(false);
    router.refresh();
  }

  const errorDe = (clave: string) => errores[clave]?.[0];

  return (
    <>
      <Button variant="outline" size="sm" className="h-11 md:h-8" onClick={abrir}>
        <Pencil className="size-4" />
        Editar datos
      </Button>

      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo={`Datos de ${cliente.nombre}`}
        descripcion="Las cotizaciones ya emitidas conservan los datos con que se emitieron."
      >
        {conflicto ? (
          <Notificacion
            tono="error"
            titulo="Alguien cambió este cliente mientras lo tenía abierto."
            acciones={[{ etiqueta: "Recargar", onClick: () => { setAbierto(false); router.refresh(); } }]}
          >
            {conflicto.length > 0
              ? `Cambió: ${conflicto.join(", ")}. Recargue para ver lo que hay ahora y vuelva a aplicar lo suyo.`
              : "Recargue para ver lo que hay ahora y vuelva a aplicar lo suyo."}
          </Notificacion>
        ) : (
          <form onSubmit={guardar} className="flex flex-col gap-4" noValidate>
            {errorGeneral ? <Notificacion tono="error">{errorGeneral}</Notificacion> : null}

            {CAMPOS.map(({ clave, etiqueta, tipo, modo, max, ayuda }) => {
              const id = `cliente-${clave}`;
              const error = errorDe(clave);
              return (
                <div key={clave} className="space-y-1.5">
                  <Label htmlFor={id}>{etiqueta}</Label>
                  <Input
                    id={id}
                    type={tipo}
                    inputMode={modo}
                    className="h-11 md:h-9"
                    value={datos[clave]}
                    maxLength={max}
                    onChange={(e) => campo(clave, e.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? describeError(id, error) : ayuda ? `${id}-ayuda` : undefined}
                  />
                  {error ? (
                    <ErrorDeCampo campo={id}>{error}</ErrorDeCampo>
                  ) : ayuda ? (
                    <p id={`${id}-ayuda`} className="text-muted-foreground text-xs">{ayuda}</p>
                  ) : null}
                </div>
              );
            })}

            <div className="space-y-1.5">
              <Label htmlFor="cliente-notas">Notas</Label>
              <Textarea id="cliente-notas" rows={3} value={datos.notas} onChange={(e) => campo("notas", e.target.value)} />
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
function camposQueCambiaron(leido: Campos, actual: Cliente | undefined): string[] {
  if (!actual) return [];
  const ahora = camposDe(actual);
  return (Object.keys(ahora) as Clave[]).filter((clave) => ahora[clave] !== leido[clave]).map((clave) => NOMBRES[clave]);
}
