import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RespuestaError } from "@/lib/api-cliente";

/**
 * Un error de la API, explicado: el rechazo del motor o que la petición no llegó a hacerse.
 *
 * Todo error llega como `{ error, detalles[] }` con un código por detalle (N01…N06 del motor,
 * `SIN_CONEXION`, `NO_AUTENTICADO`…). El código importa —es lo que se cita al reportar el
 * problema— pero no es lo que resuelve la situación: el mensaje sí. Por eso el código va como
 * distintivo discreto y el mensaje ocupa la línea.
 *
 * Un rechazo NO es un fallo del sistema: es el motor protegiendo al taller de cortar aluminio con
 * una medida imposible. El tono del panel lo refleja: advierte, no alarma. **El título lo decide
 * quien lo usa** según el caso, porque solo un 422 es un rechazo (ver el cotizador).
 */
export function PanelError({
  error,
  titulo = "El cálculo fue rechazado",
  className,
}: {
  error: RespuestaError;
  titulo?: string;
  className?: string;
}) {
  return (
    <Card className={cn("border-destructive/40", className)} role="alert">
      <CardHeader className="pb-3">
        <CardTitle className="text-destructive flex items-center gap-2 text-base">
          <AlertTriangle className="size-4 shrink-0" />
          {titulo}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {error.detalles.map((detalle, indice) => (
          <p key={`${detalle.codigo}-${indice}`} className="text-sm">
            <Badge variant="outline" className="mr-2 font-mono text-xs">
              {detalle.codigo}
            </Badge>
            {detalle.mensaje}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
