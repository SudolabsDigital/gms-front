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
  /** El diseño de su ámbito; `null` si vale para todos */
  diseno: string | null;
  valor: string;
  unidad: string | null;
  editable: boolean;
  updated_at: string;
  /** Los 5 últimos, del más reciente al más antiguo */
  historial: CambioDeParametro[];
};
