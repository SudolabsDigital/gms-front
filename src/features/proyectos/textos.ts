import type { Etapa, Evento, MedioCobro, Origen, TipoCobro } from "@/features/proyectos/types";

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

/** El camino de un proyecto que llega a buen puerto: lo que dibuja la línea de etapas de la ficha */
export const CAMINO: Etapa[] = ["lead", "cotizado", "aprobado", "produccion", "instalacion", "entregado"];

/** Cómo se llega a cada etapa: lo que la línea dice de un paso que aún no se alcanzó (`51-ui` § la ficha) */
export const COMO_SE_LLEGA: Record<Etapa, string> = {
  lead: "Nace al registrar el proyecto.",
  cotizado: "Se llega al emitir la cotización.",
  aprobado: "Se llega al registrar la aprobación del cliente.",
  produccion: "Se llega con la medición en obra confirmada.",
  instalacion: "Se llega al terminar la producción.",
  entregado: "Se llega al terminar la instalación.",
  perdido: "Se marca con un motivo.",
  anulado: "Se anula con un motivo.",
};

/** Lo siguiente que hay que hacer en cada etapa: la primera línea de la pestaña Resumen */
export const QUE_FALTA: Record<Etapa, string> = {
  lead: "Armar la cotización y enviársela al cliente.",
  cotizado: "Que el cliente apruebe la cotización vigente, o recotizar.",
  aprobado: "Confirmar en obra las medidas de la cotización aprobada. Después, producción.",
  produccion: "Fabricar con la lista de corte y pasar a instalación.",
  instalacion: "Instalar y marcar el proyecto como entregado.",
  entregado: "Cobrar el saldo, si queda.",
  perdido: "Nada: el proyecto se cerró. La historia dice por qué.",
  anulado: "Nada: el proyecto se anuló. La historia dice por qué.",
};

export const ORIGENES: Record<Origen, string> = {
  whatsapp: "WhatsApp",
  portal: "Portal web",
  recomendacion: "Recomendación",
  presencial: "Presencial",
  feria: "Feria",
  otro: "Otro",
};

export const TIPOS_COBRO: Record<TipoCobro, string> = {
  anticipo: "Anticipo",
  parcial: "Parcial",
  saldo: "Saldo",
};

export const MEDIOS_COBRO: Record<MedioCobro, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  yape_plin: "Yape / Plin",
  deposito: "Depósito",
  otro: "Otro",
};

/** Las etapas en que se cobra: desde que el cliente aprueba (decisión 27). El servidor lo exige igual */
export const ETAPAS_CON_COBROS: Etapa[] = ["aprobado", "produccion", "instalacion", "entregado"];

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

  // «Cotización iniciada · v2»: la versión viaja en `datos` (`TipoEvento::clavesSinDinero`)
  const version = evento.tipo.startsWith("cotizacion_") ? evento.datos?.version : undefined;
  const titulo = EVENTOS[evento.tipo] ?? evento.tipo;

  return typeof version === "number" ? `${titulo} · v${version}` : titulo;
}

export function esCerrada(etapa: Etapa): boolean {
  return ETAPAS_CERRADAS.includes(etapa);
}
