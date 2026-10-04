import type { ReactNode } from "react";

import { Enlace } from "@/components/comunes/enlace";
import type { Tono } from "@/components/comunes/insignia-de-dato";
import { cn } from "@/lib/utils";

export type OpcionConCifra = {
  clave: string;
  etiqueta: string;
  /** Cuántos: lo cuenta el servidor, con la misma búsqueda aplicada (`G-32`); sin cifra, no se pinta */
  cifra?: number | string | null;
  /** Lo que acompaña a la cifra en el escritorio: un importe que da el servidor («S/ 390.87») */
  detalle?: string;
  /** Solo lo que pide atención lleva tono; el resto, ninguno */
  tono?: Tono;
  href: string;
  activa: boolean;
};

const MARCAS: Record<Tono, string> = {
  neutro: "bg-muted-foreground/50",
  aviso: "bg-warning-fuerte",
  ok: "bg-success-fuerte",
  peligro: "bg-destructive-fuerte",
};

/**
 * Filtros que dicen **cuántos y cuánto** (SEC.9c, decisión 76; el patrón de Advisors, medido: 59 px, etiqueta de
 * 13 px y cifra de 12 px, separadores). Sustituye a `FiltroConRecuento`: **un nodo por opción**, que en el móvil es la
 * ficha deslizable de 44 px de siempre y en el escritorio una pestaña con la cifra debajo, todas en una tira con
 * filetes. Cada opción es un enlace a la URL con el filtro cambiado; cómo se arma es de cada módulo.
 *
 * `extremo` va al final y no es una pestaña: «Ver inactivos» es otro estado, no otra clase (decisión 46).
 */
export function PestanasConCifra({
  etiqueta,
  opciones,
  extremo,
}: {
  /** Lo que el lector de pantalla anuncia del grupo: «Filtrar por etapa» */
  etiqueta: string;
  opciones: OpcionConCifra[];
  extremo?: ReactNode;
}) {
  return (
    <nav
      aria-label={etiqueta}
      className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:items-stretch md:gap-3 md:overflow-visible md:px-0"
    >
      <ul className="flex w-max gap-2 md:w-auto md:flex-1 md:gap-0 md:overflow-hidden md:rounded-md md:border md:bg-card md:shadow-sm">
        {opciones.map((opcion) => (
          <li key={opcion.clave} className="md:flex-1 md:border-r md:last:border-r-0">
            <Enlace
              href={opcion.href}
              aria-current={opcion.activa ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-1.5 overflow-hidden rounded-full border px-3 text-sm whitespace-nowrap transition-colors",
                "md:h-full md:min-h-14 md:flex-col md:items-start md:justify-center md:gap-0.5 md:rounded-none md:border-0 md:px-4 md:py-2.5",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                opcion.activa
                  ? "border-primary bg-primary text-primary-foreground md:bg-accent md:text-foreground md:shadow-[inset_0_-2px_0_var(--primary)]"
                  : "text-muted-foreground hover:text-foreground md:hover:bg-muted/40",
              )}
            >
              <span className="flex items-center gap-1.5 md:text-[13px]">
                {opcion.tono ? <span aria-hidden className={cn("hidden size-2 rounded-sm md:block", MARCAS[opcion.tono])} /> : null}
                {opcion.etiqueta}
              </span>
              {opcion.cifra != null ? (
                <span
                  className={cn(
                    "font-mono text-xs tabular-nums opacity-80 md:font-semibold md:opacity-100",
                    !opcion.activa && "md:text-foreground",
                    opcion.tono === "aviso" && !opcion.activa && "md:text-warning-fuerte",
                  )}
                >
                  {opcion.cifra}
                  {opcion.detalle ? <span className="hidden md:inline"> · {opcion.detalle}</span> : null}
                </span>
              ) : null}
            </Enlace>
          </li>
        ))}
      </ul>
      {extremo}
    </nav>
  );
}
