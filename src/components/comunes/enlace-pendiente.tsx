"use client";

import { useLinkStatus } from "next/link";

/**
 * Va dentro de un `<Link>`: la línea que dice que el clic se oyó mientras llega la página siguiente (SEC.5, decisión
 * 75). Sustituye al skeleton, que se retiró: la página actual se queda a la vista hasta que la nueva está lista. La
 * forma, el retraso y el movimiento reducido viven en `.enlace-pendiente` de `globals.css`.
 *
 * Se dibuja en el borde inferior del primer antepasado posicionado: el enlace, o la fila que lo extiende, lleva
 * `relative`.
 */
export function EnlacePendiente() {
  const { pending } = useLinkStatus();

  return <span aria-hidden className="enlace-pendiente" data-pendiente={pending ? "" : undefined} />;
}
