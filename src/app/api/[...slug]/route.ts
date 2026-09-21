import { NextResponse } from "next/server";

import { urlDelBackend } from "@/lib/env";
import { respuestaSinBackend } from "@/lib/respuestas-bff";
import { leerToken } from "@/lib/session";

/**
 * Backend-for-Frontend: proxy autenticado hacia Laravel.
 *
 * Sustituye al `rewrite` de next.config, que no podía añadir cabeceras dinámicas. Aquí
 * se lee la cookie httpOnly y se inyecta el `Authorization: Bearer`, de modo que el
 * token nunca pasa por el JavaScript del navegador.
 *
 * Las rutas más específicas (`/api/auth/login`) tienen prioridad sobre este catch-all.
 */

const METODOS_SIN_CUERPO = new Set(["GET", "HEAD"]);

const CABECERAS_PARA_EL_CLIENTE = ["Retry-After", "Allow"];

async function reenviar(request: Request, slug: string[]): Promise<Response> {
  const token = await leerToken();

  if (!token) {
    return NextResponse.json(
      {
        error: "NO_AUTENTICADO",
        detalles: [
          { campo: null, codigo: "NO_AUTENTICADO", mensaje: "Sesión requerida." },
        ],
      },
      { status: 401 },
    );
  }

  const cabeceras = new Headers(request.headers);
  cabeceras.set("Authorization", `Bearer ${token}`);
  cabeceras.set("Accept", "application/json");
  // El Host del front confundiría a Laravel al generar URLs absolutas
  cabeceras.delete("host");
  // La cookie de sesión no tiene por qué viajar al backend: ya va el Bearer
  cabeceras.delete("cookie");

  try {
    // Dentro del `try`: sin `BACKEND_URL`, `urlDelBackend` lanza y la respuesta lo dice
    const destino = new URL(urlDelBackend(`/api/${slug.join("/")}`));
    destino.search = new URL(request.url).search;

    const respuesta = await fetch(destino, {
      method: request.method,
      headers: cabeceras,
      body: METODOS_SIN_CUERPO.has(request.method) ? undefined : await request.text(),
      cache: "no-store",
      redirect: "manual",
    });

    const salida = new Headers({
      "Content-Type": respuesta.headers.get("Content-Type") ?? "application/json",
    });

    // Las que llevan información para el cliente: cuándo reintentar tras un 429 y qué métodos
    // admite la ruta tras un 405. Sin reenviarlas, el contrato del backend no llega al navegador.
    for (const nombre of CABECERAS_PARA_EL_CLIENTE) {
      const valor = respuesta.headers.get(nombre);
      if (valor !== null) salida.set(nombre, valor);
    }

    return new Response(respuesta.body, {
      status: respuesta.status,
      statusText: respuesta.statusText,
      headers: salida,
    });
  } catch (error) {
    return respuestaSinBackend(error);
  }
}

type Contexto = { params: Promise<{ slug: string[] }> };

export async function GET(request: Request, { params }: Contexto) {
  return reenviar(request, (await params).slug);
}

export async function POST(request: Request, { params }: Contexto) {
  return reenviar(request, (await params).slug);
}

export async function PUT(request: Request, { params }: Contexto) {
  return reenviar(request, (await params).slug);
}

export async function PATCH(request: Request, { params }: Contexto) {
  return reenviar(request, (await params).slug);
}

export async function DELETE(request: Request, { params }: Contexto) {
  return reenviar(request, (await params).slug);
}
