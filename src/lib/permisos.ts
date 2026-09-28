/**
 * La única pregunta de permisos del navegador (`permisos/10-modelo` § en el navegador, PRY.1b).
 *
 * El servidor entrega en `auth/me` la lista YA RESUELTA; aquí no hay matriz ni roles (`PER-02`):
 * solo se pregunta si un permiso está en la lista. Lo que no llega, oculta (`PER-05`). Y no es la
 * autorización: el backend responde 403 igual. Sirve para no enseñar lo que daría 403.
 *
 * `PermisoDelFront` nombra solo los permisos que alguna pantalla usa. No es el catálogo —ese vive en
 * `App\Enums\Permiso`—: es la lista de preguntas que el front hace, tipada para que una errata sea un
 * error de compilación y no una entrada que desaparece sin que nadie sepa por qué.
 */
export type PermisoDelFront =
  | "calculo:ejecutar"
  | "catalogo:gestionar"
  | "catalogo:ver"
  | "cobros:anular"
  | "cobros:registrar"
  | "costeo:ver"
  | "cotizaciones:aprobar"
  | "cotizaciones:crear"
  | "cotizaciones:emitir"
  | "despiece:ver"
  | "medicion:registrar"
  | "precios:actualizar"
  | "plantillas:gestionar"
  | "proyectos:avanzar"
  | "proyectos:crear"
  | "proyectos:ver"
  | "variables:ver";

export function puede(
  usuario: { permisos: readonly string[] },
  permiso: PermisoDelFront,
): boolean {
  return usuario.permisos.includes(permiso);
}
