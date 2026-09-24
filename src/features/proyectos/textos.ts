import type { Etapa, Evento, Origen } from "@/features/proyectos/types";

/**
 * Cómo se NOMBRA cada cosa del módulo en pantalla. Solo nombres: qué etapa sigue a cuál lo decide el
 * servidor (`transiciones` en la ficha), y aquí no hay ni una arista.
 */

export const ETAPAS: Record<Etapa, string> = {
  lead: "Lead",
  cotizado: "Cotizado",
  aprobado: "Aprobado",
  produccion: "Producción",
  instalacion: "Instalación",
  entregado: "Entregado",
  perdido: "Perdido",
  anulado: "Anulado",
};

/** El orden en que se leen: el de la vida de un proyecto */
export const ETAPAS_EN_CURSO: Etapa[] = ["lead", "cotizado", "aprobado", "produccion", "instalacion"];
export const ETAPAS_CERRADAS: Etapa[] = ["entregado", "perdido", "anulado"];

export const ORIGENES: Record<Origen, string> = {
  whatsapp: "WhatsApp",
  portal: "Portal web",
  recomendacion: "Recomendación",
  presencial: "Presencial",
  feria: "Feria",
  otro: "Otro",
};

/** Los campos que puede nombrar un evento `datos_editados` */
export const CAMPOS: Record<string, string> = {
  nombre: "Nombre",
  cliente_id: "Cliente",
  direccion_obra: "Dirección de obra",
  distrito: "Distrito",
  origen: "Origen",
  enlace_origen: "Enlace de origen",
  responsable_id: "Responsable",
  notas: "Notas",
};

const EVENTOS: Record<string, string> = {
  proyecto_creado: "Proyecto registrado",
  datos_editados: "Datos corregidos",
  etapa_cambiada: "Cambio de etapa",
  proyecto_perdido: "Marcado como perdido",
  proyecto_anulado: "Proyecto anulado",
  cotizacion_creada: "Cotización iniciada",
  cotizacion_emitida: "Cotización emitida",
  cotizacion_sustituida: "Cotización sustituida",
  cotizacion_desactualizada: "Cotización desactualizada",
  cotizacion_vencida: "Cotización vencida",
  cotizacion_aprobada: "Cotización aprobada",
  cotizacion_anulada: "Cotización anulada",
  cobro_registrado: "Cobro registrado",
  cobro_anulado: "Cobro anulado",
  medicion_confirmada: "Medición en obra confirmada",
  medicion_con_diferencias: "Medición en obra con diferencias",
};

export function tituloDeEvento(evento: Evento): string {
  if (evento.tipo === "etapa_cambiada" && evento.etapa_anterior && evento.etapa_nueva) {
    return `${ETAPAS[evento.etapa_anterior]} → ${ETAPAS[evento.etapa_nueva]}`;
  }

  return EVENTOS[evento.tipo] ?? evento.tipo;
}

export function esCerrada(etapa: Etapa): boolean {
  return ETAPAS_CERRADAS.includes(etapa);
}
