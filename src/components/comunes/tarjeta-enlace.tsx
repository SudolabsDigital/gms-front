import Link from "next/link";
import type { ReactNode } from "react";

import { EnlacePendiente } from "@/components/comunes/enlace-pendiente";
import { cn } from "@/lib/utils";

/**
 * Una tarjeta cuya superficie entera es **un** enlace (sistema · `listas-y-filtros`), con el mismo iluminado, el mismo
 * `active` y el mismo anillo de foco pleno que la fila de `ListaDeRegistros`. Lo que antes era un botón pequeño dentro
 * de la tarjeta —el «Cotizar» de Plantillas, 87×28 px— pasa a ser una indicación dentro del enlace, no otro control.
 */
export function TarjetaEnlace({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  /** La disposición del contenido: `flex-wrap items-center gap-4`… */
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "hover:bg-muted/40 active:bg-muted/60 relative flex min-h-11 overflow-hidden rounded-md border p-3 transition-colors",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
    >
      {children}
      <EnlacePendiente />
    </Link>
  );
}
