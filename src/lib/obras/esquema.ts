/**
 * UNA FOTO DE OBRA.
 *
 * Hasta el 2026-09-12 cada foto llevaba zona, subzona, tipo y materiales deducidos del nombre de su
 * carpeta con una cadena de `if`: una errata («WAYYCHA») o un doble espacio («H  JAUJA») bastaban para
 * cambiarla de obra, y los materiales estaban escritos a mano por zona. Ahora la obra, el lugar y el año
 * salen de `src/config/taxonomia-publica.json`, y solo existen si la carpeta los dice. Tipo y
 * materiales no se afirman: no hay dato que los sostenga.
 */
export interface ObraItem {
  id: string;
  /** «Foto N» dentro de su obra. El título del JSON era el nombre del archivo. */
  titulo: string;
  obraSlug: string;
  obraNombre: string;
  /** Solo si la ruta de la carpeta lo dice. */
  lugar?: string;
  /** `otros` cuando la carpeta no declara lugar. */
  lugarSlug: string;
  anio?: string;
  src: string;
  thumb: string;
  ancho: number;
  alto: number;
  destacado: boolean;
  nivel: 1 | 2 | 3; // 1: Panorámica 2 cols, 2: Estándar, 3: Compacta
}

/** Una obra de la tabla, con sus fotos contadas. */
export interface ObraResumen {
  slug: string;
  nombre: string;
  lugar?: string;
  lugarSlug: string;
  anio?: string;
  fotos: number;
  portada: string;
}

/** Un lugar declarado por las carpetas, con cuántas obras y fotos tiene. */
export interface LugarResumen {
  slug: string;
  nombre: string;
  obras: number;
  fotos: number;
}
