import type { OpcionDeSubruta } from "@/components/comunes/pestanas-de-subruta";
import { puede } from "@/lib/permisos";

/**
 * Las pestañas de la serie (`series/52-brief-espacio-de-la-serie` § 4): Tipos · Materiales · Parámetros, cada una con el
 * permiso de su ruta (`PER-04`). Tipos es la raíz del espacio, que ya pide `plantillas:ver`.
 */
export function subrutasDeLaSerie(codigo: string, usuario: { permisos: readonly string[] }): OpcionDeSubruta[] {
  const raiz = `/series/${encodeURIComponent(codigo)}`;

  return [
    { href: raiz, etiqueta: "Tipos", exacta: true },
    ...(puede(usuario, "catalogo:ver") ? [{ href: `${raiz}/materiales`, etiqueta: "Materiales" }] : []),
    ...(puede(usuario, "variables:ver") ? [{ href: `${raiz}/parametros`, etiqueta: "Parámetros" }] : []),
  ];
}
