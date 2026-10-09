import { cn } from "@/lib/utils";

/**
 * Una cifra del cálculo, con su significado al lado.
 *
 * La versión anterior mostraba «Tiempo H+I · 2.5 h» y daba por supuesto que el lector
 * sabe que H+I es «habilitado más instalación». Quien entra nuevo al rubro no lo sabe, y
 * un dato que no se entiende es ruido que estorba a los que sí importan.
 *
 * `ayuda` es texto VISIBLE, no un tooltip: en la tablet del taller no hay hover, y una
 * explicación que exige un ratón para aparecer no existe para media plantilla.
 */
export function StatTile({
  etiqueta,
  valor,
  ayuda,
  destacado = false,
  className,
}: {
  /** El nombre llano. «Tiempo de armado», no «tiempo_hi_horas». */
  etiqueta: string;
  valor: string | number;
  /** Qué significa o de dónde sale. Una línea corta. */
  ayuda?: string;
  destacado?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5",
        destacado && "bg-muted/50 rounded-md px-3 py-2",
        className,
      )}
    >
      <span className="text-muted-foreground text-xs">{etiqueta}</span>

      <span
        className={cn(
          "font-medium tabular-nums",
          destacado ? "text-lg" : "text-base",
        )}
      >
        {valor}
      </span>

      {ayuda ? (
        <span className="text-muted-foreground/80 text-xs leading-tight text-pretty">
          {ayuda}
        </span>
      ) : null}
    </div>
  );
}
