import { BotonesDeEleccion } from "@/features/proyectos/components/botones-de-eleccion";
import { ORIGENES } from "@/features/proyectos/textos";
import type { Origen } from "@/features/proyectos/types";

/**
 * Cómo llegó el lead: un botón por origen, uno pulsado —se elige con el pulgar mientras se contesta el WhatsApp—.
 *
 * Estaba copiado en el alta y en la edición del proyecto (`G-58`); su cuerpo es `BotonesDeEleccion` desde C.1.
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
  return <BotonesDeEleccion leyenda="Cómo llegó" opciones={ORIGENES} valor={valor} alCambiar={alCambiar} error={error} />;
}
