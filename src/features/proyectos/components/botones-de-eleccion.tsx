import { cn } from "@/lib/utils";

/**
 * Elegir una opción entre pocas: un botón por opción, uno pulsado. En el móvil cada botón mide 44 px de alto —se
 * elige con el pulgar—; en el escritorio, 32. Lo usan el origen del lead y el tipo y el medio de un cobro (C.1):
 * era el cuerpo de `SelectorDeOrigen`, y una tercera copia es la que `G-58` quitó.
 */
export function BotonesDeEleccion<T extends string>({
  leyenda,
  opciones,
  valor,
  alCambiar,
  error,
}: {
  leyenda: string;
  opciones: Record<T, string>;
  valor: T;
  alCambiar: (valor: T) => void;
  error?: string;
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium">{leyenda}</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(opciones) as T[]).map((opcion) => (
          <button
            key={opcion}
            type="button"
            aria-pressed={valor === opcion}
            onClick={() => alCambiar(opcion)}
            className={cn(
              "h-11 rounded-md border px-3 text-sm transition-colors md:h-8",
              valor === opcion ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted/60",
            )}
          >
            {opciones[opcion]}
          </button>
        ))}
      </div>
      {error ? <p className="text-destructive-fuerte text-sm">{error}</p> : null}
    </fieldset>
  );
}
