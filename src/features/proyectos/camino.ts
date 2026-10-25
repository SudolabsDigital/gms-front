import { CAMINO } from "@/features/proyectos/textos";
import type { Etapa, Evento } from "@/features/proyectos/types";

export type EstadoDelPaso = "hecho" | "actual" | "futuro";

/**
 * El camino Lead → Entregado de un proyecto: qué paso está hecho, cuál es el actual y cuándo se entró en cada uno. Lo
 * leen la línea de etapas y el estado de la barra (SEC.9a): una regla, un sitio (decisión 21).
 *
 * Perdido y anulado no están en el camino: se marca el paso desde el que se cerró. Las fechas salen de la historia
 * —el evento que entró en cada etapa, el primero que se encuentra, como siempre lo leyó la línea—, no se guardan.
 */
export function caminoDelProyecto({ etapa, creado, historia }: { etapa: Etapa; creado: string; historia: Evento[] }) {
  const cerrado = !CAMINO.includes(etapa);
  const desde = cerrado ? historia.find((e) => e.etapa_nueva === etapa)?.etapa_anterior : etapa;
  const posicion = Math.max(0, CAMINO.indexOf(desde ?? "lead"));

  const entrada = (paso: Etapa): string | undefined =>
    paso === "lead" ? creado : historia.find((e) => e.etapa_nueva === paso)?.created_at;

  const pasos = CAMINO.map((paso, i) => ({
    etapa: paso,
    estado: (i < posicion || (cerrado && i === posicion) ? "hecho" : i === posicion ? "actual" : "futuro") as EstadoDelPaso,
    fecha: entrada(paso),
  }));

  return { cerrado, posicion, pasos, entrada };
}
