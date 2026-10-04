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
  return pedirAlBackend<T>("GET", ruta);
}

/**
 * Un POST que no escribe nada: el cálculo en seco del cotizador, para que el plano llegue ya
 * calculado al abrir la página (`disenos/51-ui` P1). Lo que escribe va por el proxy, con su sesión.
 */
export async function apiPost<T>(ruta: string, cuerpo: unknown): Promise<T> {
  return pedirAlBackend<T>("POST", ruta, cuerpo);
}

async function pedirAlBackend<T>(metodo: "GET" | "POST", ruta: string, cuerpo?: unknown): Promise<T> {
  const token = await leerToken();

  const respuesta = await fetch(urlDelBackend(`/api/v1${ruta}`), {
    method: metodo,
    headers: {
      Accept: "application/json",
      ...(cuerpo !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    cache: "no-store",
  });

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new ApiError(
      respuesta.status,
      datos,
      `${metodo} ${ruta} respondió ${respuesta.status}`,
    );
  }

  return datos as T;
}
