import { ORIGENES } from "@/features/proyectos/textos";
import type { Origen } from "@/features/proyectos/types";
import { cn } from "@/lib/utils";

/**
 * Cómo llegó el lead: un botón por origen, uno pulsado. En el móvil cada botón mide 44 px de alto —se
 * elige con el pulgar mientras se contesta el WhatsApp—; en el escritorio, 32.
 *
 * Estaba copiado en el alta y en la edición del proyecto (`G-58`).
 */
export function SelectorDeOrigen({
  valor,
  alCambiar,
  error,
}: {
  valor: Origen;
  alCambiar: (origen: Origen) => void;
  error?: string;
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium">Cómo llegó</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(ORIGENES) as Origen[]).map((origen) => (
          <button
            key={origen}
            type="button"
            aria-pressed={valor === origen}
            onClick={() => alCambiar(origen)}
            className={cn(
              "h-11 rounded-md border px-3 text-sm transition-colors md:h-8",
              valor === origen ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted/60",
            )}
          >
            {ORIGENES[origen]}
          </button>
        ))}
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </fieldset>
  );
}
