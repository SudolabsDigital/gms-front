import "server-only";

import { notFound } from "next/navigation";
import { cache } from "react";

import type { Serie } from "@/features/series/types";
import { ApiError, apiGet } from "@/lib/api-server";

/**
 * La cabecera de la serie, compartida en una petición (como la obra, SEC.9b): el layout del espacio y la pestaña Tipos
 * la piden a la vez, y con `cache` de React es una llamada, no dos. Entre peticiones no guarda nada.
 */
export const leerSerie = cache((codigo: string) => apiGet<Serie>(`/series/${encodeURIComponent(codigo)}`));

/** La serie, o la página de «no existe» si el servidor no la conoce: lo mismo para el layout y para cada pestaña */
export async function leerEspacio(codigo: string): Promise<Serie> {
  return conNoExiste(() => leerSerie(codigo));
}

/** Lo de una pestaña (`materiales`, `parametros`), con el mismo «no existe» que el layout */
export async function leerDeLaSerie<T>(codigo: string, apartado: "materiales" | "parametros"): Promise<T> {
  return conNoExiste(() => apiGet<T>(`/series/${encodeURIComponent(codigo)}/${apartado}`));
}

async function conNoExiste<T>(leer: () => Promise<T>): Promise<T> {
  try {
    return await leer();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
