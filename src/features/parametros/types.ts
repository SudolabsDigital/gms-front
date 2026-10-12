/** `parametros/50-api` § fila (MAE.7) */
export type GrupoParametro = "comercial" | "mano_de_obra" | "calculo";

export type CambioDeParametro = {
  valor_anterior: string;
  valor_nuevo: string;
  por: string | null;
  at: string;
};

export type Parametro = {
  id: string;
  clave: string;
  nombre: string;
  grupo: GrupoParametro;
  ambito?: "global" | "serie" | "diseno" | "tipo";
  /** El diseño de su ámbito; `null` si vale para todos */
  diseno: string | null;
  valor: string;
  unidad: string | null;
  editable: boolean;
  updated_at: string;
  /** Los 5 últimos, del más reciente al más antiguo */
  historial: CambioDeParametro[];
};

/** Qué cambia en un tipo, a su medida de referencia (`series/50-api` § cambiar el cálculo) */
export type ImpactoEnTipo = {
  tipo: string;
  composicion: ("F" | "D")[];
  ancho: number;
  alto: number;
  error: string | null;
  lineas: { insumo: string; medida: string; antes: number; despues: number }[];
  sitios: { codigo: string; insumo: string; nuevas: number; quitadas: number; movidas: number }[];
};

/** `POST variables/{id}/probar` (decisión 82): lo que pasaría con un valor, sin guardar nada */
export type PruebaDeParametro = {
  valor_actual: string;
  valor_nuevo: string;
  impacto: ImpactoEnTipo[];
  cuaderno: { casos: number; no_cuadran: number } | null;
  cotizaciones_a_desactualizar: number;
};
