import type { OpcionDeSubruta } from "@/components/comunes/pestanas-de-subruta";
import { puede } from "@/lib/permisos";

/**
 * Los apartados de Materiales, como pestañas-subruta en sus tres páginas (SEC.9c): antes eran dos botones en la
 * cabecera de la lista, y desde Familias o Cargar precios solo se volvía con las migas. «Cargar precios» pide los
 * mismos permisos que su página: cambiar precios y ver dinero.
 */
export function subrutasDeMateriales(usuario: { permisos: readonly string[] }): OpcionDeSubruta[] {
  return [
    { href: "/materiales", etiqueta: "Insumos", exacta: true },
    { href: "/materiales/familias", etiqueta: "Familias" },
    ...(puede(usuario, "precios:actualizar") && puede(usuario, "costeo:ver")
      ? [{ href: "/materiales/precios", etiqueta: "Cargar precios" }]
      : []),
  ];
}
