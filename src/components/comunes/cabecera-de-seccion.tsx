import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Enlace } from "@/components/comunes/enlace";
import { cn } from "@/lib/utils";

/**
 * El encabezado de una sección del ERP (SEC.9a): título, una línea que dice qué se hace aquí y las acciones. Sustituye
 * a `PageHeader`: **las migas pasaron a la barra de contexto** (`INV-E07`), así que aquí solo queda lo que es de la
 * página.
 *
 * `descripcion` no es decorativa: es la frase que le explica al que no conoce el rubro qué se hace en esta pantalla.
 * `volver` es la salida en el móvil, donde la barra de contexto no se pinta: un enlace de 44 px al nivel de arriba.
 */
export function CabeceraDeSeccion({
  titulo,
  descripcion,
  acciones,
  volver,
  className,
}: {
  titulo: string;
  descripcion?: string;
  /** Botones de la esquina derecha: crear, editar… */
  acciones?: ReactNode;
  volver?: { href: string; etiqueta: string };
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-2", className)}>
      {volver ? (
        <Enlace
          href={volver.href}
          className="text-muted-foreground -ml-1 inline-flex min-h-11 w-fit items-center gap-1 text-sm md:hidden"
        >
          <ChevronLeft className="size-4" />
          {volver.etiqueta}
        </Enlace>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          {/* Se parte en líneas, no se trunca: en el móvil el título es el nombre del proyecto y cortarlo
              escondía lo que lo identifica (sesión 24) */}
          <h1 className="text-xl font-semibold tracking-tight break-words text-balance">{titulo}</h1>
          {descripcion ? <p className="text-muted-foreground max-w-2xl text-sm">{descripcion}</p> : null}
        </div>

        {acciones ? <div className="flex shrink-0 items-center gap-2">{acciones}</div> : null}
      </div>
    </header>
  );
}
