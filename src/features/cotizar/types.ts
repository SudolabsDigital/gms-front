/**
 * Contratos del endpoint de cálculo (api-contratos.md §1).
 *
 * Estos tipos describen lo que DEVUELVE el motor. El frontend no calcula nada: solo
 * dibuja lo que el backend le manda (PC-GMS-006).
 */

/**
 * Los límites de medida, tal como los calcula el backend.
 *
 * `duro_*` lo aplica el motor: pasarse significa que el cálculo se rechaza. Salen del
 * catálogo real —la barra más corta sin empalme— y de la variable `alto_puente`.
 *
 * `sugerido_*` son los campos de la tabla `series`, que el seeder marca como deducidos y
 * que ningún código aplica todavía. Sirven para AVISAR de una medida inusual; mientras
 * `sugeridos_confirmados` sea false, no pueden impedir nada.
 */
export type Limites = {
  ancho: {
    duro_max: number | null;
    sugerido_min: number | null;
    sugerido_max: number | null;
  };
  alto: {
    duro_min: number | null;
    sugerido_min: number | null;
    sugerido_max: number | null;
  };
  sugeridos_confirmados: boolean;
};

export type Tipo = {
  id: string;
  codigo: string;
  nombre: string | null;
  composicion: ("F" | "D")[];
  n_paneles: number;
  ancho_default: number | null;
  alto_default: number | null;
  version: number;
  publicado: boolean;
  diseno?: { codigo: string; nombre: string };
  limites: Limites;
};

export type Metricas = {
  ancho: number;
  alto: number;
  alto_puente: number;
  alto_ventana: number;
  n_paneles: number;
  ancho_panel: number;
  n_fijos: number;
  n_deslizantes: number;
  n_juntas_mixtas: number;
  n_bloques: number;
  n_carriles: number;
  area_m2: number;
  area_pie2: number;
  tiempo_hi_horas: number;
};

export type LineaDespiece = {
  insumo: string;
  nombre: string;
  rol: string | null;
  clase: string;
  tipo_medida: "lineal" | "area" | "unidad";
  cantidad: number;
  regla: string | null;
  /** Color de identificación, repartido por el backend entre los insumos del catálogo. */
  color: string;
  largo_cm?: number;
  total_cm?: number;
  ancho_cm?: number;
  alto_cm?: number;
  total_m2?: number;
  precio_unitario?: number;
};

export type LineaCompra = {
  insumo: string;
  nombre: string;
  color: string;
  requerido_cm: number;
  largo_barra_cm: number | null;
  unidades: number;
  merma_cm: number;
  merma_pct: number;
};

export type Costeo = {
  material: number;
  mano_obra: number;
  transporte: number;
  subtotal: number;
  margen_pct: number;
  total: number;
  moneda: string;
};

export type Advertencia = {
  nivel: "info" | "warn";
  codigo: string;
  mensaje: string;
};

/**
 * El plano, calculado por el motor geométrico en PHP.
 *
 * Coordenadas en centímetros con origen en la esquina INFERIOR IZQUIERDA y la Y
 * creciendo hacia arriba, como un plano de taller. El SVG invierte la Y al pintar.
 */
export type PiezaPlano = {
  insumo: string;
  rol: string | null;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  largo: number;
  /** Color de identificación con el que se dibuja. */
  color: string;
  /** El `color_hex` del catálogo: el acabado real del aluminio. Otro dato, otro uso. */
  color_acabado: string | null;
  regla: string | null;
};

export type VidrioPlano = {
  insumo: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  clase: "fijo" | "corredizo" | "puente";
  area_m2: number;
  color: string;
  regla: string | null;
};

export type CotaPlano = {
  orientacion: "horizontal" | "vertical";
  desde: number;
  hasta: number;
  desplazamiento: number;
  valor: number;
  etiqueta: string;
  principal: boolean;
};

export type Geometria = {
  ejes_x: number[];
  ejes_y: number[];
  piezas: PiezaPlano[];
  vidrios: VidrioPlano[];
  cotas: CotaPlano[];
};

export type Despiece = {
  tipo: { codigo: string; composicion: ("F" | "D")[]; version: number };
  metricas: Metricas;
  /** El plano. No contiene información económica: lo ve cualquier rol. */
  geometria: Geometria | null;
  despiece: LineaDespiece[];
  compra: LineaCompra[];
  /** Ausente cuando el usuario no tiene permiso para ver dinero. */
  costeo?: Costeo;
  advertencias: Advertencia[];
};

// La forma del error no es del cotizador sino de toda la API: vive en `@/lib/api-cliente`.
