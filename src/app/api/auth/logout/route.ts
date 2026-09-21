import { NextResponse } from "next/server";

import { urlDelBackend } from "@/lib/env";
import { borrarSesion, leerToken } from "@/lib/session";

/**
 * Cierre de sesión.
 *
 * Revoca el token en Laravel y borra la cookie. Si la revocación falla (backend caído,
 * token ya expirado), la cookie se borra igualmente: nunca se deja al usuario atrapado
 * en una sesión que no puede cerrar.
 */
export async function POST() {
  const token = await leerToken();

  if (token) {
    try {
      await fetch(urlDelBackend("/api/v1/auth/logout"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
    } catch {
      // Silencio deliberado: el cierre local es lo que el usuario espera que ocurra
    }
  }

  await borrarSesion();

  return NextResponse.json({ ok: true });
}
