import { Compass } from "lucide-react";

import { EmptyState } from "@/components/comunes/empty-state";
import { Enlace } from "@/components/comunes/enlace";
import { BarraDeContexto } from "@/components/erp/barra-de-contexto";
import { MarcoDeTrabajo } from "@/components/erp/marco-de-trabajo";
import { Button } from "@/components/ui/button";
import { RUTA_INICIO } from "@/components/erp/navegacion";

export default function NotFound() {
  return (
    <MarcoDeTrabajo barra={<BarraDeContexto ruta={[{ etiqueta: "Página no encontrada" }]} />}>
      <div className="mx-auto w-full max-w-lg py-10">
        <EmptyState
          icono={Compass}
          titulo="Esta página no existe"
          descripcion="Puede que la sección todavía no esté construida o que el enlace haya cambiado."
          accion={
            <Button asChild variant="brand">
              <Enlace href={RUTA_INICIO}>Volver al inicio</Enlace>
            </Button>
          }
        />
      </div>
    </MarcoDeTrabajo>
  );
}
