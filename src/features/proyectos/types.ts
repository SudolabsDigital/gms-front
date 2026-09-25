import type { Geometria } from "@/features/cotizar/types";

/**
 * Las formas que devuelve la API de proyectos (`proyectos/50-api`).
 *
 * Las claves de dinero (`total_vigente`, `total`, `saldo`, `monto`) son opcionales A PROPÓSITO: sin
 * `costeo:ver` no viajan en el JSON (`CAL-04`), y el tipo obliga a la pantalla a contemplarlo.
 */

export type Etapa =
  | "lead"
  | "cotizado"
  | "aprobado"
  | "produccion"
  | "instalacion"
  | "entregado"
  | "perdido"
  | "anulado";

export type Origen = "portal" | "whatsapp" | "recomendacion" | "presencial" | "feria" | "otro";

export type Persona = { id: number; nombre: string };

export type ProyectoFila = {
  id: string;
  codigo: string;
  nombre: string;
  etapa: Etapa;
  etapa_desde: string;
  cliente: { id: string; nombre: string; telefono: string | null };
  responsable: Persona | null;
  total_vigente?: number | null;
  updated_at: string;
};

export type Meta = {
  pagina: number;
  por_pagina: number;
  total: number;
  ultima_pagina: number;
};

export type ListaProyectos = {
  datos: ProyectoFila[];
  meta: Meta & { recuento_por_etapa: Record<Etapa, number> };
};

export type Cliente = {
  id: string;
  nombre: string;
  documento: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  distrito: string | null;
  notas: string | null;
  updated_at: string;
};

export type ListaClientes = { datos: Cliente[]; meta: Meta };

export type Evento = {
  id: string;
  tipo: string;
  etapa_anterior: Etapa | null;
  etapa_nueva: Etapa | null;
  motivo: string | null;
  datos: Record<string, unknown> | null;
  actor: Persona;
  created_at: string;
};

export type DocumentoResumen = {
  id: string;
  version: number;
  numero: string | null;
  estado: string;
  vigente: boolean;
  emitida_at: string | null;
  vence_at: string | null;
  total?: number | null;
};

export type ProyectoFicha = {
  id: string;
  codigo: string;
  nombre: string;
  etapa: Etapa;
  etapa_desde: string;
  /** Lo que `POST /etapa` aceptaría desde aquí: lo calcula el servidor, la pantalla no replica el grafo */
  transiciones: Etapa[];
  origen: Origen;
  enlace_origen: string | null;
  direccion_obra: string | null;
  distrito: string | null;
  notas: string | null;
  cliente: Cliente;
  responsable: Persona | null;
  vigente: DocumentoResumen | null;
  versiones: DocumentoResumen[];
  cobros: unknown[];
  saldo?: number | null;
  historia: Evento[];
  created_at: string;
  updated_at: string;
};

export type Advertencia = { codigo: string; mensaje: string };

/** Una línea del documento (`proyectos/50-api` § el borrador). `subtotal` es costo de línea, sin margen */
export type ItemCotizacion = {
  id: string;
  tipo: { id: string; codigo: string; nombre: string };
  ancho_cm: number;
  alto_cm: number;
  cantidad: number;
  ubicacion: string | null;
  geometria: Geometria | null;
  advertencias: Advertencia[];
  subtotal?: number;
};

/**
 * El documento entero: la misma forma al leer y en cada escritura. Las claves de dinero no viajan sin
 * `costeo:ver` (`PRY-I15`), por eso son opcionales.
 */
export type Cotizacion = {
  id: string;
  proyecto_id: string;
  version: number;
  estado: "borrador" | "emitida" | "aprobada" | "anulada";
  vigente: boolean;
  numero: string | null;
  vence_at: string | null;
  validez_dias: number | null;
  validez_por_omision: number;
  updated_at: string;
  items: ItemCotizacion[];
  margen_pct?: number;
  transporte?: number;
  descuento?: number;
  descuento_motivo?: string | null;
  subtotal?: number;
  igv?: number;
  total?: number;
  igv_pct: number;
  avisos: Advertencia[];
};
