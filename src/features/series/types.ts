/**
 * La serie como espacio (`series/50-api`, SEC.2). El precio de un material es opcional A PROPÓSITO: sin `costeo:ver` no
 * viaja (`MAT-I09`).
 */
import type { Clase } from "@/features/materiales/types";
import type { Parametro } from "@/features/parametros/types";

/** La regla de composición del diseño (decisión 80): el compositor de «Nuevo tipo» la aplica antes de enviar */
export type ReglaDeComposicion = { min_paneles: number; min_corredizas: number };

export type DisenoDeSerie = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  /** También los borradores */
  tipos: number;
  /** La versión publicada de su red, o `null` si aún no tiene */
  version: { numero: number; publicada_at: string | null } | null;
  composicion: ReglaDeComposicion;
};

export type Serie = {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  /** Sus insumos vivos */
  perfiles: number;
  disenos: DisenoDeSerie[];
};

/** La certeza de una pieza en el plano, o `sin_ubicar` si su línea sale de una regla vigente (decisión 60) */
export type Certeza = "confirmada" | "deducida" | "hipotesis" | "sin_ubicar";

export type UsoDeInsumo = {
  serie: { codigo: string; nombre: string };
  diseno: string;
  pieza: string;
  rol: string | null;
  certeza: Certeza;
};

export type MaterialDeSerie = {
  id: string;
  codigo: string;
  nombre_comercial: string;
  clase: Clase;
  activo: boolean;
  /** De la serie; si no, uno común que usa su diseño publicado */
  propio: boolean;
  compra: { nombre: string; precio?: number } | null;
  usos: UsoDeInsumo[];
};

export type ParametrosDeSerie = {
  limites: {
    ancho_min_cm: number | null;
    ancho_max_cm: number | null;
    /** El perfil sin empalme que fija el ancho máximo */
    ancho_max_por: string | null;
    alto_min_cm: number | null;
    alto_max_cm: number | null;
  };
  parametros: (Parametro & { ambito: "serie" | "diseno" | "tipo"; de: string | null })[];
};
