export const ZONAS_OBRAS = [
  "todas",
  "huancayo",
  "la-huaycha",
  "lima",
  "jauja",
  "huallhuas",
] as const;

export type ZonaSlug = (typeof ZONAS_OBRAS)[number];

export interface SubzonaInfo {
  slug: string;
  nombre: string;
  total: number;
}

export interface ZonaInfo {
  slug: ZonaSlug;
  nombre: string;
  descripcion: string;
  total: number;
  subzonas: SubzonaInfo[];
}

export interface ObraItem {
  id: string;
  titulo: string;
  zona: ZonaSlug;
  zonaNombre: string;
  subzonaSlug: string;
  subzonaNombre: string;
  ubicacionDetalle: string;
  tipo: "residencial" | "comercial" | "institucional";
  tipoNombre: string;
  materiales: string[];
  src: string;
  thumb: string;
  ancho: number;
  alto: number;
  destacado: boolean;
  nivel: 1 | 2 | 3; // 1: Panorámica 2 cols, 2: Estándar, 3: Compacta
}
