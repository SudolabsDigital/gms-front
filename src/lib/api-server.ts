import "server-only";

import { urlDelBackend } from "@/lib/env";
import { leerToken } from "@/lib/session";

/**
 * Cliente de API para Server Components.
 *
 * Los componentes de servidor no pasan por el proxy de `/api/[...slug]`: hablan con
 * Laravel directamente, inyectando el token que leen de la cookie httpOnly.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly datos: unknown,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(ruta: string): Promise<T> {
  const token = await leerToken();

  const respuesta = await fetch(urlDelBackend(`/api/v1${ruta}`), {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new ApiError(
      respuesta.status,
      datos,
      `GET ${ruta} respondió ${respuesta.status}`,
    );
  }

  return datos as T;
}
