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
  /** El día en que el cliente dijo que sí, `AAAA-MM-DD` (B.3) */
  aprobada_el: string | null;
  /** La versión que la sustituyó: «Sustituida por v3». La calcula el servidor (B.3) */
  sustituida_por?: number | null;
  total?: number | null;
};

export type TipoCobro = "anticipo" | "parcial" | "saldo";
export type MedioCobro = "efectivo" | "transferencia" | "yape_plin" | "deposito" | "otro";

/** Un cobro (C.1). Anulado, se sigue viendo con quién y por qué (`PRY-08`). `monto` no viaja sin `costeo:ver` */
export type Cobro = {
  id: string;
  tipo: TipoCobro;
  /** El día del cobro real, `AAAA-MM-DD` */
  fecha: string;
  medio: MedioCobro;
  referencia: string | null;
  anulado_at: string | null;
  anulado_motivo: string | null;
  anulado_por: Persona | null;
  updated_at: string;
  monto?: number;
};

/** Un ítem de la medición en obra: la cota cotizada y la medida, comparadas por el servidor al milímetro (C.2) */
export type ItemMedido = {
  cotizacion_item_id: string;
  tipo: string | null;
  ubicacion: string | null;
  cantidad: number;
  ancho_cotizado: number;
  alto_cotizado: number;
  ancho_medido: number;
  alto_medido: number;
  coincide: boolean;
};

/** La última medición de la vigente, la que manda para pasar a producción (`PRY-I25`) */
export type Medicion = {
  estado: "confirmada" | "con_diferencias";
  version: number | null;
  registrada_at: string;
  nota: string | null;
  items: ItemMedido[];
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
  /** `null` si la vigente no se midió todavía (C.2) */
  medicion: Medicion | null;
  cobros: Cobro[];
  /** Puede ser negativo: una recotización que bajó el total después de cobrar deja saldo a favor del cliente */
  saldo?: number | null;
  /** `ANTICIPO_PCT` × total vigente, redondeado por el servidor (C.1): el front no compone importes */
  anticipo_sugerido?: number | null;
  historia: Evento[];
  created_at: string;
  updated_at: string;
};

export type Advertencia = { codigo: string; mensaje: string };

/** A qué versión sustituirá el borrador al emitirse, y si estaba aprobada: entonces el proyecto vuelve a Cotizado (B.3) */
export type Sustitucion = { version: number; aprobada: boolean };

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
  /** El día en que el cliente dijo que sí, `AAAA-MM-DD`, y cómo llegó (B.3) */
  aprobada_el: string | null;
  aprobacion_nota: string | null;
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
  /** Cómo se llega al total, compuesto por el servidor (B.2). Sin `costeo:ver` no viaja */
  desglose?: Desglose | null;
  avisos: Advertencia[];
};

export type Desglose = {
  costo_lineas: number;
  transporte: number;
  margen_pct: number;
  margen_monto: number;
  subtotal: number;
  descuento: number;
  base: number;
  igv_pct: number;
  igv: number;
  total: number;
};
