import Link from "next/link";
import type { ComponentProps } from "react";

import { EnlacePendiente } from "@/components/comunes/enlace-pendiente";
import { cn } from "@/lib/utils";

/**
 * El enlace del ERP: un `Link` que dice que está abriendo mientras llega la página siguiente (SEC.5, decisión 75).
 * Sin skeleton, la página actual se queda a la vista y es esta línea la que confirma el clic. Sirve suelto, como hijo
 * de `Button asChild` y desde un componente de servidor. Las filas, tarjetas y menús comunes ya la llevan dentro
 * (`INV-E05`).
 */
export function Enlace({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={cn("relative", className)}>
      {children}
      <EnlacePendiente />
    </Link>
  );
}
