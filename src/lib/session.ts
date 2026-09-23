import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

/** Adonde se manda una sesión muerta: borra la cookie y lleva al login (route handler). */
export const RUTA_SESION_VENCIDA = "/api/auth/sesion-vencida";

/**
 * Tres respuestas, no dos. Hasta el 2026-09-23 «Laravel caído» y «token muerto» salían
 * las dos como `null`, y las dos acababan en un bucle `/inicio ↔ /login`: el layout
 * mandaba al login y el proxy, que ve la cookie, devolvía a `/inicio`. Se distinguen
 * porque se resuelven al revés: el token muerto se borra; con el backend caído la
 * sesión sigue siendo buena y borrarla echaría al usuario por un corte ajeno.
 */
export type EstadoSesion =
  | { estado: "valida"; usuario: Usuario }
  | { estado: "invalida" }
  | { estado: "sin_backend" };

/**
 * Identidad REAL del usuario, resuelta contra el backend.
 *
 * El proxy solo comprueba que exista la cookie (chequeo optimista). El rol se pregunta
 * aquí, porque el token de Sanctum es opaco: no lleva el rol dentro y no se puede
 * deducir sin consultar.
 *
 * `cache()` de React: una sola consulta a `auth/me` por petición, aunque la pidan el
 * layout y la página, que Next renderiza EN PARALELO.
 */
export const estadoDeSesion = cache(async (): Promise<EstadoSesion> => {
  const token = await leerToken();

  if (!token) return { estado: "invalida" };

  try {
    const respuesta = await fetch(urlDelBackend("/api/v1/auth/me"), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      // La sesión nunca se cachea: un usuario desactivado debe perder el acceso ya
      cache: "no-store",
    });

    // 401 token caducado o revocado · 403 cuenta desactivada: la sesión no vale
    if (respuesta.status === 401 || respuesta.status === 403) return { estado: "invalida" };
    // Cualquier otro fallo es del servidor, no de la sesión
    if (!respuesta.ok) return { estado: "sin_backend" };

    const datos = (await respuesta.json()) as { usuario: Usuario };

    return { estado: "valida", usuario: datos.usuario };
  } catch {
    // Red caída o `BACKEND_URL` sin definir: no se sabe nada de la sesión
    return { estado: "sin_backend" };
  }
});

/**
 * El usuario de una página del ERP, NUNCA `null`.
 *
 * La usan el layout y cada página que necesite al usuario: como se renderizan en
 * paralelo, que el layout redirija no impide que la página se ejecute, y una página que
 * asumía «el layout ya lo comprobó» reventaba con `usuario!` sobre `null`. Aquí cada
 * una sale por su cuenta:
 *   - sesión muerta → a `RUTA_SESION_VENCIDA`, que borra la cookie (un Server Component
 *     no puede) y lleva al login;
 *   - backend caído → error, que pinta `(erp)/error.tsx` con «Reintentar».
 */
export async function exigirUsuario(): Promise<Usuario> {
  const sesion = await estadoDeSesion();

  if (sesion.estado === "valida") return sesion.usuario;

  if (sesion.estado === "invalida") redirect(RUTA_SESION_VENCIDA);

  throw new Error("El servidor no respondió al comprobar la sesión.");
}
