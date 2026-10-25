import { Lock } from "lucide-react";

import { EmptyState } from "@/components/comunes/empty-state";

/**
 * Lo que ve quien entra a una pantalla del ERP sin el permiso que la abre. El menú ya no se la ofrece
 * (`puede()`), pero una URL guardada o compartida sí llega. Estaba copiada en la lista y la ficha de
 * proyectos (`G-58`).
 *
 * `que` es lo que la pantalla deja consultar, en plural y en minúscula: «proyectos».
 */
export function SinAcceso({ que }: { que: string }) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <EmptyState
        icono={Lock}
        titulo={`Sin acceso a ${que}`}
        descripcion={`Su usuario no tiene permiso para consultar ${que}. Si lo necesita, pídaselo al administrador.`}
      />
    </div>
  );
}
