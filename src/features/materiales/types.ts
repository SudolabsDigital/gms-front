/**
 * El repositorio de materiales (`materiales/50-api`). El dinero —precio, fecha del precio, historial, `sin_precio`—
 * es opcional A PROPÓSITO: sin `costeo:ver` no viaja (`MAT-I09`), y la pantalla lo nota por su ausencia.
 */
import type { Meta } from "@/features/proyectos/types";

export type Clase = "perfil" | "vidrio" | "accesorio" | "consumible";
export type TipoMedida = "lineal" | "area" | "unidad";

export type InsumoFila = {
  id: string;
  codigo: string;
  nombre_comercial: string;
  clase: Clase;
  tipo_medida: TipoMedida;
  material: { id: string; codigo: string; nombre: string } | null;
  serie: { id: string; codigo: string } | null;
  /** El nombre de la presentación de compra (decisión 48) */
  presentacion: string | null;
  /** Cómo se compra: su precio es el del proveedor, y sin `costeo:ver` no viaja */
  compra: { id: string; nombre: string; contenido: number; precio?: number } | null;
  activo: boolean;
  reglas_activas: number;
  precio_unitario?: number;
  precio_actualizado_at?: string | null;
};

export type InsumoFicha = InsumoFila & {
  largo_barra_cm: number | null;
  requiere_pieza_unica: boolean;
  peso_kg_por_metro: number | null;
  color_hex: string | null;
  updated_at: string;
  reglas: { id: string; codigo: string; rol: string | null; ambito: string | null; como: "insumo" | "origen"; activa: boolean }[];
  presentaciones: Presentacion[];
  historial?: { presentacion: string | null; precio_anterior: number; precio_nuevo: number; motivo: string | null; por: string | null; fecha: string }[];
};

/** Una forma de comprar el insumo, con su contenido en cm, cm² o unidades (`materiales/10-modelo` § presentaciones) */
export type Presentacion = {
  id: string;
  nombre: string;
  contenido: number;
  ancho_cm: number | null;
  alto_cm: number | null;
  es_compra: boolean;
  updated_at: string;
  precio?: number;
};

export type ListaInsumos = {
  datos: InsumoFila[];
  meta: Meta & { recuento_por_clase: Record<Clase, number>; sin_precio?: number };
};

export type Material = { id: string; codigo: string; nombre: string; unidad_consumo: string; insumos: number };
export type Serie = { id: string; codigo: string; nombre: string };
