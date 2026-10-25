import { NextResponse, type NextRequest } from "next/server";

import { RUTA_INICIO } from "@/components/erp/navegacion";
import { borrarSesion, estadoDeSesion } from "@/lib/session";

/**
 * Adonde el ERP manda una sesión muerta, porque un Server Component no puede borrar cookies.
 *
 * Sin esto, una cookie con el token caducado o revocado dejaba al usuario en un bucle: el
 * layout lo mandaba a `/login` y el proxy, al ver la cookie, lo devolvía a `/inicio`.
 *
 * Vuelve a preguntar antes de borrar nada, por dos razones: es un GET que cualquier
 * página ajena podría enlazar —y con una sesión viva no debe cerrar nada—, y con el
 * backend caído la sesión sigue siendo buena. En los dos casos se devuelve al ERP, que ya
 * sabe pintar cada uno.
 */
export async function GET(request: NextRequest) {
  const sesion = await estadoDeSesion();

  if (sesion.estado !== "invalida") {
    return NextResponse.redirect(new URL(RUTA_INICIO, request.url));
  }

  await borrarSesion();

  const login = new URL("/login", request.url);
  login.searchParams.set("motivo", "vencida");

  return NextResponse.redirect(login);
}
