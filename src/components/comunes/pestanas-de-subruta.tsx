"use client";

import { usePathname } from "next/navigation";

import { Enlace } from "@/components/comunes/enlace";
import { InsigniaDeDato, type Dato } from "@/components/comunes/insignia-de-dato";
import { cn } from "@/lib/utils";

export type OpcionDeSubruta = {
  href: string;
  etiqueta: string;
  dato?: Dato;
  /** Activa solo en su ruta exacta: la raíz de un apartado (`/materiales`) no se marca en sus hijas */
  exacta?: boolean;
};

/**
 * Subpáginas de una sección, cada una con su URL (SEC.9b; `componentes-del-armazon`, el patrón de Storage): pestañas
 * que son enlaces, la activa por la ruta y cada una con su dato. Las usan la obra en el móvil, donde el panel no se
 * pinta, y Materiales en los dos anchos —Insumos · Familias · Cargar precios— (SEC.9c).
 *
 * En el móvil se desplazan en horizontal y miden 44 px; `prefetch` precarga cada una (la obra: pocas, acotado).
 */
export function PestanasDeSubruta({
  opciones,
  etiqueta,
  prefetch = false,
  className,
}: {
  opciones: OpcionDeSubruta[];
  /** El nombre del grupo de pestañas, para el lector de pantalla */
  etiqueta: string;
  prefetch?: boolean;
  className?: string;
}) {
  const ruta = usePathname();

  return (
    <nav aria-label={etiqueta} className={cn("-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0", className)}>
      <ul className="flex w-max gap-1 border-b md:w-auto">
        {opciones.map((opcion) => {
          const activa = ruta === opcion.href || (!opcion.exacta && ruta.startsWith(`${opcion.href}/`));

          return (
            <li key={opcion.href}>
              <Enlace
                href={opcion.href}
                prefetch={prefetch}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  "-mb-px flex h-11 items-center gap-2 border-b-2 px-3 text-sm whitespace-nowrap md:h-9",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                  activa
                    ? "border-primary text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground border-transparent",
                )}
              >
                {opcion.etiqueta}
                {opcion.dato ? <InsigniaDeDato dato={opcion.dato} /> : null}
              </Enlace>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
