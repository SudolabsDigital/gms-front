import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (lo que hasta Next 15 se llamaba Middleware).
 *
 * [AVISO] ESTO NO ES LA AUTORIZACIÓN DEL SISTEMA. Es un chequeo *optimista*: mira si existe
 * la cookie de sesión y redirige en consecuencia, para que el usuario no vea el
 * esqueleto de una página protegida antes de rebotar. Nada más.
 *
 * La autorización real vive en Laravel: quien llame a la API con curl no pasa por aquí.
 * Y el ROL tampoco se puede comprobar en este punto, porque el token de Sanctum es
 * opaco y la documentación de Next desaconseja consultar la base de datos en el proxy
 * (se ejecuta en cada ruta, incluidas las prefetched). El rol se resuelve en el layout
 * del ERP, que sí pregunta al backend.
 */

const RUTA_LOGIN = "/login";
const RUTA_INICIO_ERP = "/inicio";
const COOKIE_SESION = "gms_sesion";

/** Zonas privadas del ERP. Las páginas públicas (landing, /catalogo, /blog) quedan fuera. */
const PREFIJOS_PROTEGIDOS = [
  "/inicio",
  "/parametros",
  "/plantillas",
  "/cotizar",
  "/produccion",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const haySesion = request.cookies.has(COOKIE_SESION);

  const esRutaProtegida = PREFIJOS_PROTEGIDOS.some(
    (prefijo) => pathname === prefijo || pathname.startsWith(`${prefijo}/`),
  );

  if (esRutaProtegida && !haySesion) {
    const destino = new URL(RUTA_LOGIN, request.url);
    // Se recuerda a dónde iba para devolverlo ahí tras identificarse
    destino.searchParams.set("continuar", pathname);

    return NextResponse.redirect(destino);
  }

  // Con sesión abierta, el formulario de acceso no tiene sentido
  if (pathname === RUTA_LOGIN && haySesion) {
    return NextResponse.redirect(new URL(RUTA_INICIO_ERP, request.url));
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Se excluyen las rutas de API (se protegen solas en el servidor), los estáticos de
   * Next y los archivos con extensión. Ejecutar el proxy sobre imágenes solo gasta CPU.
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
