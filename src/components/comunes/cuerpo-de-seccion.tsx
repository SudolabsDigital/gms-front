import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * El ancho del contenido de una página del ERP sale de lo que muestra, no de cada archivo (SEC.6). Había 13 envoltorios
 * con su `max-w-*` escrito a mano y cinco valores para tres usos (`INV-E11`).
 *
 *   amplio      listas, tablas y tableros: Inicio, Proyectos, Materiales, Plantillas y la obra     1152 px
 *   ficha       un registro y sus datos, y las portadas con panel: el cliente, el insumo, Clientes   1024 px
 *   formulario  ajustes y formularios: Parámetros, Familias                                          768 px
 *
 * Lleva también el ritmo vertical de la página; `className` queda para lo propio de cada una (el hueco de la barra fija
 * del móvil, la impresión).
 */
const ANCHOS = {
  amplio: "max-w-6xl",
  ficha: "max-w-5xl",
  formulario: "max-w-3xl",
} as const;

export type AnchoDeSeccion = keyof typeof ANCHOS;

export function CuerpoDeSeccion({
  ancho,
  className,
  children,
}: {
  ancho: AnchoDeSeccion;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("mx-auto flex w-full flex-col gap-4 md:gap-5", ANCHOS[ancho], className)}>{children}</div>;
}
