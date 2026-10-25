import "server-only";

import { notFound } from "next/navigation";
import { cache } from "react";

import type { Cotizacion, ProyectoFicha } from "@/features/proyectos/types";
import { ApiError, apiGet } from "@/lib/api-server";

/**
 * Las lecturas de la obra, compartidas en una petición (SEC.9b). El layout de la obra y la sección que se abre se
 * renderizan a la vez y piden lo mismo: con `cache` de React es **una** llamada por petición, no una por componente.
 * Entre peticiones no guarda nada: cada navegación lee de nuevo (`no-store` en `apiGet`).
 */
export const leerProyecto = cache((id: string) => apiGet<ProyectoFicha>(`/proyectos/${encodeURIComponent(id)}`));

export const leerDocumento = cache((id: string) => apiGet<Cotizacion>(`/cotizaciones/${encodeURIComponent(id)}`));

/** La obra, o la página de «no existe» si el servidor no la conoce: lo mismo para el layout y para cada sección */
export async function leerObra(id: string): Promise<ProyectoFicha> {
  try {
    return await leerProyecto(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
