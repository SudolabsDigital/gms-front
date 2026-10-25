import type { Clase, TipoMedida } from "@/features/materiales/types";

/** Las clases en el orden del taller, que es el de las pestañas (`materiales/52-brief-materiales` § 5) */
export const CLASES: Record<Clase, string> = {
  perfil: "Perfiles",
  vidrio: "Vidrios",
  accesorio: "Accesorios",
  consumible: "Consumibles",
};

/** En singular, para el formulario */
export const CLASE: Record<Clase, string> = {
  perfil: "Perfil",
  vidrio: "Vidrio",
  accesorio: "Accesorio",
  consumible: "Consumible",
};

/** Cómo lo calcula el motor, dicho como lo dice el taller */
export const MEDIDAS: Record<TipoMedida, string> = {
  lineal: "Por largo (barras o rollos)",
  area: "Por área (m²)",
  unidad: "Por unidad",
};

/** Un cambio de más de esto se marca en «Cargar precios» sin bloquear: es el error de tecla más caro (decisión 47) */
export const CAMBIO_GRANDE = 0.5;
