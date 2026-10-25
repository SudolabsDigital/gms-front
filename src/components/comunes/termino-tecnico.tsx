import { cn } from "@/lib/utils";

/**
 * Un insumo, nombrado para las dos personas que lo leen.
 *
 * El maestro trabaja por código: pide «un 8463» y el proveedor entiende. Quien lleva un
 * mes en la empresa lee 8463 y no ve nada. Ocultar el código lo volvería lento para el
 * primero; mostrar solo el código deja fuera al segundo.
 *
 * La solución es no elegir: término llano como texto principal, código en monoespaciada
 * al lado, nombre comercial debajo. Los tres a la vez, sin hover, sin desplegar nada.
 *
 * El punto de color es lo que enlaza esta fila con su pieza en el plano: mismo color en
 * la tabla y en el dibujo, para poder señalar «esta pieza es esta línea».
 */
export function TerminoTecnico({
  etiqueta,
  codigo,
  nombreComercial,
  color,
  className,
}: {
  /** El nombre llano. «Riel inferior», no «8463». */
  etiqueta: string;
  /** El código del catálogo, tal como se le pide al proveedor. */
  codigo?: string;
  /** Cómo lo llama el proveedor en la factura. */
  nombreComercial?: string;
  /** Color del rol funcional; debe coincidir con el del plano. */
  color?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-start gap-2", className)}>
      {color ? (
        <span
          aria-hidden
          className="mt-1.5 size-2.5 shrink-0 rounded-[2px] ring-1 ring-black/10"
          style={{ backgroundColor: color }}
        />
      ) : null}

      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-x-1.5 leading-tight">
          <span className="font-medium">{etiqueta}</span>
          {codigo ? (
            <span className="text-muted-foreground font-mono text-xs">{codigo}</span>
          ) : null}
        </p>

        {nombreComercial && nombreComercial !== etiqueta ? (
          <p className="text-muted-foreground/80 text-xs leading-tight">
            {nombreComercial}
          </p>
        ) : null}
      </div>
    </div>
  );
}
