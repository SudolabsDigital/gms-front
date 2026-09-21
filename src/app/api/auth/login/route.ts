import { NextResponse } from "next/server";

import { urlDelBackend } from "@/lib/env";
import { respuestaSinBackend } from "@/lib/respuestas-bff";
import { guardarSesion } from "@/lib/session";

/**
 * Inicio de sesión (Backend-for-Frontend).
 *
 * El navegador nunca habla directamente con Laravel ni ve el token: envía credenciales
 * aquí, este handler las reenvía, recibe el token de Sanctum y lo guarda en una cookie
 * httpOnly. Al cliente solo le vuelven los datos del usuario.
 */
export async function POST(request: Request) {
  let credenciales: unknown;

  try {
    credenciales = await request.json();
  } catch {
    return NextResponse.json(
      { error: "PETICION_INVALIDA", detalles: [] },
      { status: 400 },
    );
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(urlDelBackend("/api/v1/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credenciales),
      cache: "no-store",
    });
  } catch (error) {
    return respuestaSinBackend(error);
  }

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok || !datos?.token) {
    // Se propaga el error de Laravel tal cual: ya trae { error, detalles[] }. Y su `Retry-After`,
    // que es lo único que permite decir cuánto esperar tras el límite de 5 intentos por minuto
    const reintentar = respuesta.headers.get("Retry-After");

    return NextResponse.json(datos ?? { error: "ERROR_DESCONOCIDO", detalles: [] }, {
      status: respuesta.status,
      headers: reintentar !== null ? { "Retry-After": reintentar } : undefined,
    });
  }

  await guardarSesion(datos.token);

  // El token se queda en el servidor: la respuesta al navegador NO lo incluye
  return NextResponse.json({ usuario: datos.usuario });
}
