"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ListaClientesConRecuento } from "@/features/clientes/types";
import { rutaDeObra } from "@/features/proyectos/pestanas";
import type { ListaProyectos } from "@/features/proyectos/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";

type Opcion = { id: string; titulo: string; detalle: string; codigo?: string; href: string };

const POR_APERTURA = 8;

/**
 * Cambiar de obra o de cliente desde la barra de contexto (SEC.9d, decisión 76; el selector de proyecto del dashboard
 * de referencia): el último tramo de la ruta se abre como un buscador. Pide la lista **al abrirse** y busca en el
 * servidor mientras se escribe, a 250 ms de la última tecla.
 *
 * Es la primera lectura de verdad del navegador, donde la decisión 75 dejaba decidir SWR: **no hace falta**. Son 8
 * filas por apertura, una petición de unos 100 ms y nada que compartir con otro componente; un `fetch` al abrir basta.
 * Sin búsqueda, las obras en curso; con búsqueda, todas (`vista=todos`).
 */
export function SelectorDeContexto({
  tipo,
  etiqueta,
  codigo,
}: {
  tipo: "proyectos" | "clientes";
  etiqueta: string;
  codigo?: string;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [opciones, setOpciones] = useState<Opcion[] | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    let vigente = true;
    const texto = buscar.trim();

    const espera = setTimeout(
      async () => {
        const consulta = new URLSearchParams({ por_pagina: String(POR_APERTURA) });
        if (texto) consulta.set("buscar", texto);
        if (texto && tipo === "proyectos") consulta.set("vista", "todos");

        if (tipo === "proyectos") {
          const respuesta = await pedir<ListaProyectos>(`/api/v1/proyectos?${consulta}`);
          if (!vigente) return;
          if (!respuesta.ok) return setFallo(mensajeDeError(respuesta.error));
          setFallo(null);
          setOpciones(
            respuesta.datos.datos.map((p) => ({
              id: p.id,
              codigo: p.codigo,
              titulo: p.nombre,
              detalle: p.cliente.nombre,
              href: rutaDeObra(p.id, p.etapa),
            })),
          );
        } else {
          const respuesta = await pedir<ListaClientesConRecuento>(`/api/v1/clientes?${consulta}`);
          if (!vigente) return;
          if (!respuesta.ok) return setFallo(mensajeDeError(respuesta.error));
          setFallo(null);
          setOpciones(
            respuesta.datos.datos.map((c) => ({
              id: c.id,
              titulo: c.nombre,
              detalle: c.telefono ?? `${c.proyectos_count} proyecto${c.proyectos_count === 1 ? "" : "s"}`,
              href: `/clientes/${c.id}`,
            })),
          );
        }
      },
      texto ? 250 : 0,
    );

    return () => {
      vigente = false;
      clearTimeout(espera);
    };
  }, [abierto, buscar, tipo]);

  function elegir(opcion: Opcion) {
    setAbierto(false);
    router.push(opcion.href);
  }

  return (
    <Popover
      open={abierto}
      onOpenChange={(valor) => {
        setAbierto(valor);
        if (valor) return;
        // Lo buscado no se reabre como «en curso»; la lista sin búsqueda sí se conserva, y reabrir no parpadea
        if (buscar.trim()) setOpciones(null);
        setBuscar("");
      }}
    >
      <PopoverTrigger className="hover:bg-muted focus-visible:ring-ring inline-flex h-8 min-w-0 items-center gap-1.5 rounded-md border px-2 font-semibold focus-visible:ring-2 focus-visible:outline-none">
        {codigo ? <span className="text-muted-foreground font-mono text-xs font-normal">{codigo}</span> : null}
        <span className="max-w-72 truncate">{etiqueta}</span>
        <ChevronsUpDown aria-hidden className="text-muted-foreground size-3.5 shrink-0" />
        <span className="sr-only">: cambiar de {tipo === "proyectos" ? "obra" : "cliente"}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96 p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={buscar}
            onValueChange={setBuscar}
            placeholder={tipo === "proyectos" ? "Obra, cliente o código" : "Nombre, teléfono o DNI"}
          />
          <CommandList>
            {fallo ? (
              <p className="text-destructive-fuerte px-3 py-4 text-sm">{fallo}</p>
            ) : opciones === null ? (
              <p className="text-muted-foreground px-3 py-4 text-sm">Buscando…</p>
            ) : (
              <>
                <CommandEmpty>Nada coincide.</CommandEmpty>
                <CommandGroup
                  heading={tipo === "proyectos" ? (buscar.trim() ? "Obras" : "Obras en curso") : "Clientes"}
                >
                  {opciones.map((opcion) => (
                    <CommandItem key={opcion.id} value={opcion.id} onSelect={() => elegir(opcion)} className="flex-col items-start gap-0">
                      <span className="flex w-full items-baseline gap-2">
                        {opcion.codigo ? (
                          <span className="text-muted-foreground font-mono text-xs">{opcion.codigo}</span>
                        ) : null}
                        <span className="truncate font-medium">{opcion.titulo}</span>
                      </span>
                      <span className="text-muted-foreground text-xs">{opcion.detalle}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
