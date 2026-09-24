import { cn } from "@/lib/utils";

/**
 * El error de un formulario que no pertenece a ningún campo: sin conexión, un 5xx, una regla del negocio.
 * Los de un campo van debajo de su campo, no aquí.
 *
 * Existía copiado cuatro veces —login, alta, edición y etapas del proyecto— con las mismas clases (`G-58`).
 * Es más discreto que `PanelError`, que explica el rechazo de un cálculo con su código.
 */
export function AvisoDeError({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      role="alert"
      className={cn(
        "border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-sm",
        className,
      )}
    >
      {children}
    </p>
  );
}
