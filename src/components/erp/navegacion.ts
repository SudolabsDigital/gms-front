import {
  Boxes,
  Calculator,
  Factory,
  FolderKanban,
  Home,
  LayoutTemplate,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

import { puede, type PermisoDelFront } from "@/lib/permisos";

/**
 * Mapa de páginas del ERP (08-propuestas-cambio/README.md §5).
 *
 * `permiso` decide qué entrada se ve (`null`: basta la sesión). Esto es SOLO presentación: evita
 * mostrar enlaces que devolverían 403, y se pregunta por permiso, nunca por rol (`PER-01`).
 * La autorización de verdad está en Laravel, y escribir la URL a mano no sirve de nada si el
 * backend dice que no.
 *
 * `disponible` distingue lo construido de lo planificado. El mapa de páginas completo se
 * muestra desde el primer día —un ERP que revela sus secciones de a una deja al usuario
 * sin saber qué esperar— pero lo que aún no existe se ve inerte y rotulado, nunca como
 * un enlace que lleva a un 404. Prometer una pantalla y devolver un error cuesta más
 * confianza que admitir que todavía no está.
 */

export type EntradaNavegacion = {
  titulo: string;
  href: string;
  icono: LucideIcon;
  permiso: PermisoDelFront | null;
  descripcion: string;
  disponible: boolean;
};

/** Donde aterriza el usuario tras iniciar sesión. */
export const RUTA_INICIO = "/inicio";

export const NAVEGACION: EntradaNavegacion[] = [
  {
    titulo: "Inicio",
    href: RUTA_INICIO,
    icono: Home,
    permiso: null,
    descripcion: "Resumen y accesos del sistema",
    disponible: true,
  },
  {
    titulo: "Proyectos",
    href: "/proyectos",
    icono: FolderKanban,
    permiso: "proyectos:ver",
    descripcion: "Del lead al proyecto entregado",
    disponible: true,
  },
  {
    titulo: "Cotizar",
    href: "/cotizar/nueva",
    icono: Calculator,
    permiso: "calculo:ejecutar",
    descripcion: "Calcular despiece y costeo por medidas",
    disponible: true,
  },
  {
    titulo: "Plantillas",
    href: "/plantillas",
    icono: LayoutTemplate,
    permiso: "plantillas:gestionar",
    descripcion: "Diseños, tipos y reglas de cálculo",
    disponible: true,
  },
  {
    titulo: "Catálogo",
    href: "/catalogo",
    icono: Boxes,
    permiso: "catalogo:gestionar",
    descripcion: "Materiales, insumos y precios",
    disponible: false,
  },
  {
    titulo: "Parámetros",
    href: "/parametros",
    icono: SlidersHorizontal,
    permiso: "variables:gestionar",
    descripcion: "Variables y estándares de mano de obra",
    disponible: false,
  },
  {
    titulo: "Producción",
    href: "/produccion",
    icono: Factory,
    permiso: "despiece:ver",
    // La lista de corte ya existe, en la ficha de cada proyecto (tajada D); lo que falta aquí es la vista del taller
    // con todas las órdenes. Decía «Órdenes y listas de corte» con «Pronto» (recorrido UX.0, R25)
    descripcion: "Órdenes de todos los proyectos",
    disponible: false,
  },
];

export function navegacionPara(usuario: { permisos: readonly string[] }): EntradaNavegacion[] {
  return NAVEGACION.filter((entrada) => entrada.permiso === null || puede(usuario, entrada.permiso));
}
