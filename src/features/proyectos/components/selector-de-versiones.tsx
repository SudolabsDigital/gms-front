import { Enlace } from "@/components/comunes/enlace";
import { cn } from "@/lib/utils";
import type { DocumentoResumen } from "@/features/proyectos/types";

/**
 * «v1 · v2 · v3 vigente» (`proyectos/51-ui` § versiones, tajada B.3): cada versión es un enlace a la misma pestaña
 * con `?version=`, así que la que se ve la decide la URL y se puede compartir. Solo aparece con más de una.
 */
export function SelectorDeVersiones({
  proyectoId,
  versiones,
  elegida,
}: {
  proyectoId: string;
  versiones: DocumentoResumen[];
  elegida: number;
}) {
  if (versiones.length < 2) return null;

  // La API las da de la más nueva a la más vieja; se leen en el orden en que nacieron
  const enOrden = [...versiones].sort((a, b) => a.version - b.version);

  return (
    <nav aria-label="Versiones de la cotización" className="flex flex-wrap gap-2">
      {enOrden.map((v) => {
        const actual = v.version === elegida;
        return (
          <Enlace
            key={v.id}
            href={`/proyectos/${proyectoId}?pestana=cotizacion&version=${v.version}`}
            aria-current={actual ? "page" : undefined}
            scroll={false}
            className={cn(
              // 44 px de alto y de ancho: «v1» sola medía 39 de ancho en el móvil (recorrido de B.3)
              "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm md:min-h-9 md:min-w-9",
              actual ? "border-primary bg-accent text-foreground font-semibold" : "text-muted-foreground hover:bg-muted",
            )}
          >
            v{v.version}
            {v.vigente ? " vigente" : v.estado === "borrador" ? " borrador" : ""}
          </Enlace>
        );
      })}
    </nav>
  );
}
