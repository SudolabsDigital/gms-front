import type { Etapa } from "@/features/proyectos/types";

/**
 * Las pestañas de la ficha: una por asunto, no por etapa (decisión 23, `proyectos/52-brief-ficha`). Lo que
 * cruza etapas —las versiones de la cotización, los cobros, la historia— tiene así un solo hogar.
 */
export const PESTANAS = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "cotizacion", etiqueta: "Cotización" },
  { id: "obra", etiqueta: "Obra" },
  { id: "cobros", etiqueta: "Cobros" },
  { id: "historia", etiqueta: "Historia" },
] as const;

export type Pestana = (typeof PESTANAS)[number]["id"];

/** La ficha abre donde está lo siguiente que hacer (`52-brief-ficha` § 9, punto 2) */
const POR_ETAPA: Record<Etapa, Pestana> = {
  lead: "resumen",
  cotizado: "cotizacion",
  aprobado: "obra",
  produccion: "obra",
  instalacion: "obra",
  entregado: "cobros",
  perdido: "resumen",
  anulado: "resumen",
};

/** La pestaña de la URL (`?pestana=`) si es una que existe; si no, la que pide la etapa */
export function pestanaInicial(valor: string | undefined, etapa: Etapa): Pestana {
  return PESTANAS.some((p) => p.id === valor) ? (valor as Pestana) : POR_ETAPA[etapa];
}
