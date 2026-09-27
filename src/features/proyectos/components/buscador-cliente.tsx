"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Cliente, ListaClientes } from "@/features/proyectos/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";

/** El cliente elegido: uno que ya existe, o uno nuevo que se crea junto con el proyecto */
export type ClienteElegido =
  | { modo: "existente"; cliente: Pick<Cliente, "id" | "nombre" | "telefono"> }
  | { modo: "nuevo"; nombre: string; telefono: string };

/**
 * Buscar al cliente mientras se escribe y, si no está, darlo de alta ahí mismo (`proyectos/51-ui` §
 * alta: «Nuevo: *lo escrito*» abre nombre y teléfono en la misma hoja). Obligar a crearlo en otra
 * pantalla es la fricción que manda el lead a un cuaderno.
 *
 * `permitirNuevo` en falso sirve para corregir el cliente de un proyecto, donde solo se elige uno que
 * existe (el `PATCH` recibe `cliente_id`).
 */
export function BuscadorCliente({
  valor,
  alCambiar,
  error,
  permitirNuevo = true,
}: {
  valor: ClienteElegido | null;
  alCambiar: (valor: ClienteElegido | null) => void;
  error?: string;
  permitirNuevo?: boolean;
}) {
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<Cliente[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);

  // Espera a que se deje de escribir: una petición por pausa, no una por tecla
  useEffect(() => {
    const termino = texto.trim();
    if (termino.length < 2 || valor !== null) return;

    const temporizador = setTimeout(async () => {
      setBuscando(true);
      const respuesta = await pedir<ListaClientes>(
        `/api/v1/clientes?buscar=${encodeURIComponent(termino)}&por_pagina=6`,
      );
      setBuscando(false);

      if (respuesta.ok) {
        setResultados(respuesta.datos.datos);
        setFallo(null);
      } else {
        setFallo(mensajeDeError(respuesta.error));
      }
    }, 250);

    return () => clearTimeout(temporizador);
  }, [texto, valor]);

  if (valor?.modo === "existente") {
    return (
      <div className="space-y-1.5">
        <Label>Cliente</Label>
        <div className="bg-muted/50 flex min-h-11 items-center justify-between gap-2 rounded-md border px-3 py-2 md:min-h-9">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{valor.cliente.nombre}</p>
            {valor.cliente.telefono ? (
              <p className="text-muted-foreground text-xs">{valor.cliente.telefono}</p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => alCambiar(null)}>
            Cambiar
          </Button>
        </div>
      </div>
    );
  }

  if (valor?.modo === "nuevo") {
    return (
      <fieldset className="space-y-3 rounded-md border p-3">
        <div className="flex items-center justify-between gap-2">
          <legend className="text-sm font-medium">Cliente nuevo</legend>
          <Button type="button" variant="ghost" size="sm" onClick={() => alCambiar(null)}>
            <X className="size-4" />
            Buscar otro
          </Button>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cliente-nombre">Nombre o razón social</Label>
          <Input
            id="cliente-nombre"
            className="h-11 md:h-9"
            value={valor.nombre}
            maxLength={150}
            onChange={(e) => alCambiar({ ...valor, nombre: e.target.value })}
            aria-invalid={Boolean(error)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cliente-telefono">Teléfono (opcional)</Label>
          <Input
            id="cliente-telefono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            // El nombre ya viene de lo buscado: lo siguiente es el teléfono (recorrido UX.0, R30)
            autoFocus
            className="h-11 md:h-9"
            placeholder="964 123 456"
            value={valor.telefono}
            maxLength={30}
            onChange={(e) => alCambiar({ ...valor, telefono: e.target.value })}
          />
        </div>
        {error ? <p className="text-destructive-fuerte text-sm">{error}</p> : null}
      </fieldset>
    );
  }

  const termino = texto.trim();

  return (
    <div className="space-y-1.5">
      <Label htmlFor="cliente-buscar">Cliente</Label>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          id="cliente-buscar"
          className="h-11 pl-9 md:h-9"
          placeholder="Nombre, teléfono o DNI/RUC"
          value={texto}
          autoComplete="off"
          onChange={(e) => {
            setTexto(e.target.value);
            if (e.target.value.trim().length < 2) setResultados([]);
          }}
          aria-invalid={Boolean(error)}
        />
        {buscando ? (
          <Loader2 className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin" />
        ) : null}
      </div>

      {termino.length >= 2 ? (
        <ul className="divide-y rounded-md border">
          {resultados.map((cliente) => (
            <li key={cliente.id}>
              <button
                type="button"
                className="hover:bg-muted/60 flex min-h-11 w-full flex-col items-start px-3 py-2 text-left md:min-h-9"
                onClick={() => alCambiar({ modo: "existente", cliente })}
              >
                <span className="text-sm font-medium">{cliente.nombre}</span>
                <span className="text-muted-foreground text-xs">
                  {[cliente.telefono, cliente.documento].filter(Boolean).join(" · ") || "Sin datos de contacto"}
                </span>
              </button>
            </li>
          ))}
          {permitirNuevo ? (
            <li>
              <button
                type="button"
                className="hover:bg-muted/60 text-primary flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-sm md:min-h-9"
                onClick={() => alCambiar({ modo: "nuevo", nombre: termino, telefono: "" })}
              >
                <UserPlus className="size-4" />
                Nuevo: «{termino}»
              </button>
            </li>
          ) : null}
          {!permitirNuevo && !buscando && resultados.length === 0 ? (
            <li className="text-muted-foreground px-3 py-2 text-sm">Ningún cliente coincide.</li>
          ) : null}
        </ul>
      ) : null}

      {fallo ? <p className="text-destructive-fuerte text-sm">{fallo}</p> : null}
      {error ? <p className="text-destructive-fuerte text-sm">{error}</p> : null}
    </div>
  );
}
