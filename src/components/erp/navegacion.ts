import {
  Boxes,
  Calculator,
  FolderKanban,
  Home,
  LayoutTemplate,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";

import { puede, type PermisoDelFront } from "@/lib/permisos";

/**
 * Mapa de páginas del ERP (08-propuestas-cambio/README.md §5), por grupos (`03-sistema-de-diseno/arquitectura-del-erp`
 * § 2): lo de hoy, la operación del día, el catálogo y la empresa. El grupo ordena el menú por lo que la persona va a
 * hacer, no por cómo está hecho el sistema, y un grupo sin ninguna entrada visible para quien entra no se pinta.
 *
 * `permiso` decide qué entrada se ve (`null`: basta la sesión). Esto es SOLO presentación: evita
 * mostrar enlaces que devolverían 403, y se pregunta por permiso, nunca por rol (`PER-01`).
 * La autorización de verdad está en Laravel, y escribir la URL a mano no sirve de nada si el
 * backend dice que no.
 *
 * `disponible` distingue lo construido de lo planificado: lo que aún no existe se ve inerte y rotulado, nunca como
 * un enlace que lleva a un 404. «Producción · Pronto» salió del menú (decisión 71): volverá en el grupo Taller cuando
 * el maestro tenga `despiece:ver`, como su puerta a las órdenes.
 */

export type GrupoNavegacion = "Hoy" | "Operación" | "Catálogo" | "Empresa";

export type EntradaNavegacion = {
  titulo: string;
  href: string;
  icono: LucideIcon;
  permiso: PermisoDelFront | null;
  descripcion: string;
  disponible: boolean;
  grupo: GrupoNavegacion;
};

/** El orden en que se leen los grupos */
const GRUPOS: GrupoNavegacion[] = ["Hoy", "Operación", "Catálogo", "Empresa"];

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
    grupo: "Hoy",
  },
  {
    titulo: "Proyectos",
    href: "/proyectos",
    icono: FolderKanban,
    permiso: "proyectos:ver",
    descripcion: "Del lead al proyecto entregado",
    disponible: true,
    grupo: "Operación",
  },
  {
    // MAE.9: con el mismo permiso que los proyectos —todo dato del cliente ya viaja en su ficha— (decisión 54)
    titulo: "Clientes",
    href: "/clientes",
    icono: Users,
    permiso: "proyectos:ver",
    descripcion: "Sus datos, sus proyectos y lo que deben",
    disponible: true,
    grupo: "Operación",
  },
  {
    titulo: "Cotizar",
    href: "/cotizar/nueva",
    icono: Calculator,
    permiso: "calculo:ejecutar",
    descripcion: "Calcular despiece y costeo por medidas",
    disponible: true,
    grupo: "Operación",
  },
  {
    titulo: "Plantillas",
    href: "/plantillas",
    icono: LayoutTemplate,
    permiso: "plantillas:gestionar",
    descripcion: "Diseños, tipos y reglas de cálculo",
    disponible: true,
    grupo: "Catálogo",
  },
  {
    // `/materiales` y no `/catalogo`, que es el catálogo público del portal (MAE.4). Se ve con `catalogo:ver`: el
    // maestro y el almacén consultan insumos, sin precios
    titulo: "Materiales",
    href: "/materiales",
    icono: Boxes,
    permiso: "catalogo:ver",
    descripcion: "Insumos, precios y dónde se usa cada uno",
    disponible: true,
    grupo: "Catálogo",
  },
  {
    // MAE.7: se ve con `variables:ver` —el maestro consulta el cálculo del diseño—; cambiar pide `variables:gestionar`
    titulo: "Parámetros",
    href: "/parametros",
    icono: SlidersHorizontal,
    permiso: "variables:ver",
    descripcion: "Margen, vigencia, mano de obra y cálculo",
    disponible: true,
    grupo: "Empresa",
  },
];

export function navegacionPara(usuario: { permisos: readonly string[] }): EntradaNavegacion[] {
  return NAVEGACION.filter((entrada) => entrada.permiso === null || puede(usuario, entrada.permiso));
}

/** Las entradas que ve quien entra, por grupo y en orden; sin los grupos que se quedan vacíos */
export function navegacionPorGrupos(usuario: { permisos: readonly string[] }) {
  const entradas = navegacionPara(usuario);

  return GRUPOS.map((grupo) => ({ grupo, entradas: entradas.filter((e) => e.grupo === grupo) })).filter(
    (g) => g.entradas.length > 0,
  );
}
