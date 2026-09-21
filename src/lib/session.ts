import "server-only";

import { cookies } from "next/headers";

import { urlDelBackend } from "@/lib/env";

/**
 * Gestión de la sesión del ERP.
 *
 * El token de Sanctum se guarda en una cookie **httpOnly**: el JavaScript del navegador
 * no puede leerlo, así que un XSS no puede robar la sesión. Solo el servidor de Next lo
 * lee para inyectarlo como `Authorization: Bearer` al hablar con Laravel.
 *
 * Módulo server-only: importarlo desde un componente de cliente es un error de compilación.
 */

export const NOMBRE_COOKIE_SESION = "gms_sesion";

/** 8 horas: una jornada de taller. Al día siguiente se vuelve a entrar. */
const DURACION_SESION_SEGUNDOS = 60 * 60 * 8;

export type Rol = "admin" | "maestro" | "almacen";

export type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  rol_etiqueta: string;
  nivel: number;
  permisos: {
    ver_dinero: boolean;
    gestionar_catalogo: boolean;
    gestionar_plantillas: boolean;
    gestionar_usuarios: boolean;
  };
};

export async function guardarSesion(token: string): Promise<void> {
  const almacen = await cookies();

  almacen.set(NOMBRE_COOKIE_SESION, token, {
    httpOnly: true,
    // En desarrollo local no hay HTTPS; en producción la cookie nunca viaja en claro
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION_SEGUNDOS,
  });
}

export async function leerToken(): Promise<string | undefined> {
  const almacen = await cookies();

  return almacen.get(NOMBRE_COOKIE_SESION)?.value;
}

export async function borrarSesion(): Promise<void> {
  const almacen = await cookies();

  almacen.delete(NOMBRE_COOKIE_SESION);
}

/**
 * Identidad REAL del usuario, resuelta contra el backend.
 *
 * El proxy solo comprueba que exista la cookie (chequeo optimista). El rol se pregunta
 * aquí, porque el token de Sanctum es opaco: no lleva el rol dentro y no se puede
 * deducir sin consultar. Devuelve `null` si la sesión ya no es válida.
 */
export async function obtenerUsuario(): Promise<Usuario | null> {
  const token = await leerToken();

  if (!token) return null;

  try {
    const respuesta = await fetch(urlDelBackend("/api/v1/auth/me"), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      // La sesión nunca se cachea: un usuario desactivado debe perder el acceso ya
      cache: "no-store",
    });

    if (!respuesta.ok) return null;

    const datos = (await respuesta.json()) as { usuario: Usuario };

    return datos.usuario;
  } catch {
    // El backend caído no debe reventar la página: se trata como sesión no válida
    return null;
  }
}
