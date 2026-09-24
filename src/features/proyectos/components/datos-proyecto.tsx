import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORIGENES } from "@/features/proyectos/textos";
import type { ProyectoFicha } from "@/features/proyectos/types";
import { fechaHora } from "@/lib/formato";

/**
 * Los datos del lead y de la obra, en la pestaña Resumen de la ficha. Solo lectura: se corrigen con «Editar
 * datos», en cualquier etapa. El contacto —WhatsApp, Llamar— vive en la cabecera, a la vista desde cualquier
 * pestaña (`proyectos/52-brief-ficha`).
 */
export function DatosProyecto({ proyecto }: { proyecto: ProyectoFicha }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Datos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt className="text-muted-foreground">Cliente</dt>
          <dd>
            {proyecto.cliente.nombre}
            <span className="text-muted-foreground block text-xs">
              {[proyecto.cliente.telefono, proyecto.cliente.documento].filter(Boolean).join(" · ") ||
                "Sin teléfono ni documento"}
            </span>
          </dd>
          <dt className="text-muted-foreground">Obra</dt>
          <dd>{[proyecto.direccion_obra, proyecto.distrito].filter(Boolean).join(", ") || "—"}</dd>
          <dt className="text-muted-foreground">Llegó por</dt>
          <dd>
            {ORIGENES[proyecto.origen]}
            {proyecto.enlace_origen ? (
              <>
                {" · "}
                <a
                  href={proyecto.enlace_origen}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary break-all underline-offset-4 hover:underline"
                >
                  lo que vio
                </a>
              </>
            ) : null}
          </dd>
          <dt className="text-muted-foreground">Responsable</dt>
          <dd>{proyecto.responsable?.nombre ?? "—"}</dd>
          <dt className="text-muted-foreground">Registrado</dt>
          <dd>{fechaHora(proyecto.created_at)}</dd>
        </dl>

        {proyecto.notas ? <p className="bg-muted/40 rounded-md p-3 whitespace-pre-line">{proyecto.notas}</p> : null}
      </CardContent>
    </Card>
  );
}
