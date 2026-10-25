import type { Etapa } from "@/features/proyectos/types";

/**
 * Las secciones de la obra: una por asunto, no por etapa (decisión 23, `proyectos/52-brief-ficha`). Lo que cruza
 * etapas —las versiones de la cotización, los cobros, la historia— tiene así un solo hogar. Desde SEC.9b cada una es
 * una **subruta** (`/proyectos/{id}/cobros`), agrupada en el panel por categorías (decisión 76,
 * `03-sistema-de-diseno/componentes-del-armazon` § 5). La lista de corte y la garantía son del grupo Obra y Entrega,
 * pero no secciones a las que se abra: las pinta el layout con sus condiciones.
 */
export const SECCIONES = [
  { id: "resumen", etiqueta: "Resumen", grupo: "General" },
  { id: "historia", etiqueta: "Historia", grupo: "General" },
  { id: "cotizacion", etiqueta: "Cotización", grupo: "Venta" },
  { id: "cobros", etiqueta: "Cobros", grupo: "Venta" },
  // `obra` en la URL —es lo que decían los enlaces compartidos con `?pestana=obra`—, «Medición» a la vista: es lo que hay
  { id: "obra", etiqueta: "Medición", grupo: "Obra" },
] as const;

export type Seccion = (typeof SECCIONES)[number]["id"];

/** La obra abre donde está lo siguiente que hacer (`52-brief-ficha` § 9, punto 2) */
const POR_ETAPA: Record<Etapa, Seccion> = {
  lead: "resumen",
  cotizado: "cotizacion",
  aprobado: "obra",
  produccion: "obra",
  instalacion: "obra",
  entregado: "cobros",
  perdido: "resumen",
  anulado: "resumen",
};

/** La sección que pide `?pestana=` —los enlaces de antes de SEC.9b— si existe; si no, la que pide la etapa */
export function seccionInicial(valor: string | undefined, etapa: Etapa): Seccion {
  return SECCIONES.some((s) => s.id === valor) ? (valor as Seccion) : POR_ETAPA[etapa];
}

/** Una sección de la obra, con lo que haga falta detrás (`?version=3`, `#medir`) */
export function rutaDeSeccion(id: string, seccion: Seccion | "corte", resto = ""): string {
  return `/proyectos/${id}/${seccion}${resto}`;
}

/**
 * Donde se abre una obra desde una lista: directamente en la sección de su etapa, sin pasar por la redirección de
 * `/proyectos/{id}` (un viaje de más).
 */
export function rutaDeObra(id: string, etapa: Etapa): string {
  return rutaDeSeccion(id, POR_ETAPA[etapa]);
}
