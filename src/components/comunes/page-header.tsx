import Link from "next/link";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

/**
 * Encabezado de página del ERP.
 *
 * Antes cada página se escribía el suyo a mano y ya divergían en tamaño y tono. Más
 * importante: ninguna decía DÓNDE estaba el usuario. En un sistema de cinco secciones
 * con subpáginas, quien entra por un enlace directo necesita las migas para orientarse.
 *
 * `descripcion` no es decorativa: es la frase que le explica al que no conoce el rubro
 * qué se hace en esta pantalla. No debe omitirse.
 */

export type Miga = {
  etiqueta: string;
  /** Sin `href` la miga es la página actual: se pinta como texto, no como enlace. */
  href?: string;
};

export function PageHeader({
  titulo,
  descripcion,
  migas,
  acciones,
  className,
}: {
  titulo: string;
  descripcion?: string;
  migas?: Miga[];
  /** Botones de la esquina derecha: crear, exportar, etc. */
  acciones?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-3", className)}>
      {migas && migas.length > 0 ? (
        <Breadcrumb>
          <BreadcrumbList>
            {migas.map((miga, indice) => (
              <Fragment key={`${miga.etiqueta}-${indice}`}>
                {indice > 0 ? <BreadcrumbSeparator /> : null}
                <BreadcrumbItem>
                  {miga.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={miga.href}>{miga.etiqueta}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{miga.etiqueta}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          {/* Se parte en líneas, no se trunca: en el móvil el título es el nombre del proyecto y cortarlo
              escondía lo que lo identifica (sesión 24) */}
          <h1 className="text-2xl font-semibold tracking-tight break-words text-balance">{titulo}</h1>
          {descripcion ? (
            <p className="text-muted-foreground max-w-2xl text-sm">{descripcion}</p>
          ) : null}
        </div>

        {acciones ? (
          <div className="flex shrink-0 items-center gap-2">{acciones}</div>
        ) : null}
      </div>
    </header>
  );
}
