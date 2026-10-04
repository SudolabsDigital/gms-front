import Link from "next/link";
import type { ReactNode } from "react";

import { EnlacePendiente } from "@/components/comunes/enlace-pendiente";
import { cn } from "@/lib/utils";

export type OpcionDeFiltro = {
  clave: string;
  etiqueta: string;
  /** Lo cuenta el servidor, con la misma búsqueda aplicada (`G-32`); sin recuento, no se pinta */
  recuento?: number | null;
  href: string;
  activa: boolean;
};

/**
 * Pestañas que filtran una lista, con su recuento (sistema · `listas-y-filtros`): fichas deslizables de 44 px en el
 * móvil, pestañas de 36 px en el escritorio. Cada opción es un enlace a la URL con el filtro cambiado; cómo se arma esa
 * URL es de cada módulo (`urlDeLista`, `urlDeInsumos`). Eran dos componentes idénticos, `filtro-etapas` y
 * `filtro-clases`.
 *
 * `extremo` va al final y no es una pestaña: «Ver inactivos» es otro estado, no otra clase (decisión 46).
 */
export function FiltroConRecuento({
  etiqueta,
  opciones,
  extremo,
}: {
  /** Lo que el lector de pantalla anuncia del grupo: «Filtrar por etapa» */
  etiqueta: string;
  opciones: OpcionDeFiltro[];
  extremo?: ReactNode;
}) {
  return (
    // En el escritorio las pestañas se envuelven y no hace falta desplazar: sin `overflow-visible`, el
    // `-mb-px` de la pestaña activa sobresale una fracción de píxel con zoom (112,5 %) y aparece una
    // barra vertical (medido en el recorrido de la sesión 24)
    <nav
      aria-label={etiqueta}
      className="-mx-4 flex flex-wrap items-center gap-2 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0"
    >
      <ul className="flex w-max gap-2 md:w-auto md:flex-wrap md:gap-1 md:border-b">
        {opciones.map((opcion) => (
          <li key={opcion.clave}>
            <Link
              href={opcion.href}
              aria-current={opcion.activa ? "page" : undefined}
              className={cn(
                "relative flex h-11 items-center gap-1.5 overflow-hidden rounded-full border px-3 text-sm whitespace-nowrap transition-colors",
                "md:-mb-px md:h-9 md:rounded-none md:border-0 md:border-b-2 md:border-transparent md:px-3",
                opcion.activa
                  ? "border-primary bg-primary text-primary-foreground md:border-primary md:bg-transparent md:text-foreground md:font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opcion.etiqueta}
              {opcion.recuento != null ? (
                <span className="font-mono text-xs tabular-nums opacity-80">{opcion.recuento}</span>
              ) : null}
              <EnlacePendiente />
            </Link>
          </li>
        ))}
      </ul>
      {extremo}
    </nav>
  );
}
