/**
 * El único camino del navegador a la API (`G-10`, `G-11`).
 *
 * Hasta el 2026-09-21 cada pantalla hacía su propio `fetch` y leía el error a su manera: el
 * cotizador esperaba `detalles`, el compositor `errors` y el login tenía su copia del tipo. El
 * mismo defecto aparecía tres veces con tres formas, y el cotizador no tenía `try`: una caída de
 * red reemplazaba la página entera por la del error y se perdían las medidas escritas (medido en
 * navegador).
 *
 * Dos garantías, y son las que justifican que exista:
 *
 * 1. **No lanza nunca.** Devuelve un resultado; la pantalla decide qué pintar. Un fallo de red es
 *    un dato más, no una excepción que suba hasta el error boundary.
 * 2. **Todo error llega con la forma del contrato** `{ error, detalles[] }` (`api-contratos.md`
 *    §7), aunque lo que respondió no la tuviera: un 502 en HTML de un balanceador, un cuerpo vacío.
 *
 * Solo para el navegador y rutas relativas (`/api/...`): el BFF añade el token. Los componentes de
 * servidor usan `api-server.ts`.
 */

export type DetalleError = {
  campo: string | null;
  codigo: string;
  mensaje: string;
};

export type RespuestaError = {
  error: string;
  detalles: DetalleError[];
};

/** El error tal como lo recibe la pantalla: el contrato más el estado HTTP (0 = sin conexión). */
export type ErrorApi = RespuestaError & { estado: number };

export type ResultadoApi<T> = { ok: true; datos: T } | { ok: false; error: ErrorApi };

const MENSAJE_POR_ESTADO: Record<number, string> = {
  0: "No hay conexión con el servidor. Verifique su red e inténtelo de nuevo.",
  401: "Sesión requerida.",
  502: "El servidor no respondió como se esperaba. Inténtelo en unos segundos.",
  503: "El servidor no está disponible en este momento. Inténtelo en unos segundos.",
};

/**
 * Las cabeceras van como objeto plano: se mezclan con `...`, y un `Headers` extendido así se
 * pierde entero y en silencio. El tipo lo impide en vez de confiar en que nadie lo pase.
 */
type OpcionesDePeticion = Omit<RequestInit, "headers"> & { headers?: Record<string, string> };

export async function pedir<T>(
  ruta: string,
  init?: OpcionesDePeticion,
): Promise<ResultadoApi<T>> {
  let respuesta: Response;

  try {
    respuesta = await fetch(ruta, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    return { ok: false, error: errorGenerico(0, "SIN_CONEXION") };
  }

  const cuerpo: unknown = await respuesta.json().catch(() => null);

  if (respuesta.ok) {
    return { ok: true, datos: cuerpo as T };
  }

  return {
    ok: false,
    error: cumpleElContrato(cuerpo)
      ? { ...cuerpo, estado: respuesta.status }
      : errorGenerico(respuesta.status, `ERROR_HTTP_${respuesta.status}`),
  };
}

/**
 * Los mensajes de validación agrupados por campo, para pintarlos debajo de cada uno. Los detalles
 * sin campo no entran: son del formulario entero, no de un input.
 */
export function erroresPorCampo(error: RespuestaError): Record<string, string[]> {
  const porCampo: Record<string, string[]> = {};

  for (const { campo, mensaje } of error.detalles) {
    if (campo !== null) {
      (porCampo[campo] ??= []).push(mensaje);
    }
  }

  return porCampo;
}

function cumpleElContrato(cuerpo: unknown): cuerpo is RespuestaError {
  if (typeof cuerpo !== "object" || cuerpo === null) return false;

  const { error, detalles } = cuerpo as Record<string, unknown>;

  return typeof error === "string" && Array.isArray(detalles) && detalles.length > 0;
}

function errorGenerico(estado: number, codigo: string): ErrorApi {
  const mensaje =
    MENSAJE_POR_ESTADO[estado] ?? `La petición falló (${estado}). Inténtelo de nuevo.`;

  return { error: codigo, estado, detalles: [{ campo: null, codigo, mensaje }] };
}
