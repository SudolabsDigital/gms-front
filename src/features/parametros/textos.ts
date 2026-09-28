import type { GrupoParametro } from "@/features/parametros/types";

/** Los tres bloques de `/parametros`, en el orden del brief (`parametros/52-brief-parametros` § 3) */
export const GRUPOS: { grupo: GrupoParametro; titulo: string; frase: string }[] = [
  { grupo: "comercial", titulo: "Comerciales", frase: "Cuentan para lo que se emita desde ahora; lo ya emitido no cambia." },
  { grupo: "mano_de_obra", titulo: "Mano de obra", frase: "Cambiarla desactualiza las cotizaciones emitidas vigentes: el cliente tiene la de entonces." },
  { grupo: "calculo", titulo: "Cálculo del diseño", frase: "Calibrado contra el cuaderno de la serie Nova. Se ajusta con Sudolabs." },
];

/**
 * Qué hace cada parámetro, en palabras del taller. La `descripcion` de la base son notas de desarrollo y no viaja
 * (`parametros/50-api` § fila); un parámetro nuevo sin ayuda aquí se muestra solo con su nombre.
 */
export const AYUDA: Record<string, string> = {
  VIGENCIA_DIAS: "Cuántos días vale una cotización desde que se emite.",
  ANTICIPO_PCT: "El anticipo que se sugiere cobrar; avisa si se pasa a producción sin él.",
  MARGEN_OMISION_PCT: "El margen con que nace la primera versión de cada proyecto.",
  MARGEN_PISO_PCT: "Por debajo de este margen, emitir avisa (y emite igual).",
  AVISO_POR_VENCER_DIAS: "Inicio avisa de una cotización cuando le quedan estos días o menos.",
  PRECIO_MO_PIE2: "Lo que se cobra de mano de obra por cada pie² de ventana.",
  factor_area_cobrable: "Qué parte del área se cobra como mano de obra: 1 es toda.",
  alto_puente: "La franja fija de arriba, sobre las hojas corredizas.",
  descuento_vidrio_fijo_vertical: "El vidrio fijo mide el alto menos esto.",
  descuento_vidrio_desl_vertical: "El vidrio corredizo mide el alto de la hoja menos esto.",
  descuento_vidrio_puente_vertical: "El vidrio del puente mide el alto del puente menos esto.",
  descuento_vidrio_horizontal: "En cero para que el maestro corte a su criterio: el despiece del vidrio es una referencia.",
  ruedas_por_hoja: "Rodamientos por cada hoja que corre.",
  pestillos_por_hoja: "Cierres por cada hoja que corre.",
  hojas_por_pieza_puente: "El vidrio del puente se parte cada tantas hojas.",
  umbral_refuerzo_paneles: "Desde cuántos paneles lleva refuerzo vertical en el centro.",
};
