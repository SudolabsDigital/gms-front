import Link from "next/link";
import type { ReactNode } from "react";
import { CircleCheck, Info, OctagonX, TriangleAlert, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * La notificación del sistema: UNA forma de decir algo al usuario dentro de la pantalla, por props (decisión 33).
 * Los avisos flotantes usan el mismo modelo con `notificar()` (`@/lib/notificar`).
 *
 * Sustituye a `AvisoDeError`, `PanelError` y a las cuatro maneras de pintar advertencias que había (recorrido UX.0).
 * El texto va en `--foreground` sobre el tinte del tono; el icono y el filete, en el tono FUERTE (decisión 32): los
 * tokens brillantes no daban contraste —el texto rojo del aviso de error medía 3,54:1—. Siempre icono y palabra,
 * nunca solo color.
 *
 * Solo el error se anuncia como `alert` (interrumpe al lector de pantalla); una advertencia que vive en la pantalla
 * se anuncia como `status`, o se repetiría en cada pintado.
 */

export type TonoNotificacion = "error" | "advertencia" | "exito" | "info";

export type AccionNotificacion = { etiqueta: string; href?: string; onClick?: () => void };

export type DetalleNotificacion = { codigo?: string; mensaje: string };

const TONOS: Record<TonoNotificacion, { icono: LucideIcon; caja: string; color: string }> = {
  error: { icono: OctagonX, caja: "border-destructive/30 border-l-destructive-fuerte bg-destructive/10", color: "text-destructive-fuerte" },
  advertencia: { icono: TriangleAlert, caja: "border-warning/40 border-l-warning-fuerte bg-warning/10", color: "text-warning-fuerte" },
  exito: { icono: CircleCheck, caja: "border-success/30 border-l-success-fuerte bg-success/10", color: "text-success-fuerte" },
  info: { icono: Info, caja: "border-primary/20 border-l-primary bg-primary/10", color: "text-primary" },
};

export function Notificacion({
  tono,
  titulo,
  children,
  detalles,
  acciones,
  compacta = false,
  className,
}: {
  tono: TonoNotificacion;
  titulo?: ReactNode;
  /** El texto; si no hay título, es la línea principal */
  children?: ReactNode;
  /** Una lista de mensajes —advertencias del motor, detalles de un error de la API—, con su código si lo tienen */
  detalles?: DetalleNotificacion[];
  acciones?: AccionNotificacion[];
  /** Una línea discreta, sin caja: para dentro de una fila o una tarjeta */
  compacta?: boolean;
  className?: string;
}) {
  const { icono: Icono, caja, color } = TONOS[tono];
  const rol = tono === "error" ? "alert" : "status";

  if (compacta) {
    return (
      <p role={rol} className={cn("flex items-start gap-1.5 text-xs", className)}>
        <Icono aria-hidden className={cn("mt-px size-3.5 shrink-0", color)} />
        <span>{titulo ?? children}</span>
      </p>
    );
  }

  return (
    <div role={rol} className={cn("flex gap-2.5 rounded-md border border-l-4 px-3 py-2.5 text-sm", caja, className)}>
      <Icono aria-hidden className={cn("mt-0.5 size-4 shrink-0", color)} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {titulo ? <p className="font-medium">{titulo}</p> : null}
        {children ? <div>{children}</div> : null}
        {detalles && detalles.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {detalles.map((detalle, i) => (
              <li key={`${detalle.codigo ?? ""}-${i}`}>
                {detalle.codigo ? <span className="text-muted-foreground mr-1.5 font-mono text-xs">{detalle.codigo}</span> : null}
                {detalle.mensaje}
              </li>
            ))}
          </ul>
        ) : null}
        {acciones && acciones.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-2">
            {acciones.map((accion) =>
              accion.href ? (
                <Button key={accion.etiqueta} asChild variant="outline" size="sm" className="h-11 md:h-8">
                  <Link href={accion.href}>{accion.etiqueta}</Link>
                </Button>
              ) : (
                <Button key={accion.etiqueta} variant="outline" size="sm" className="h-11 md:h-8" onClick={accion.onClick}>
                  {accion.etiqueta}
                </Button>
              ),
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
