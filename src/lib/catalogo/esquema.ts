/**
 * ESQUEMA DEL CATÁLOGO DE PRODUCTOS Y OBRAS - GMS INTEGRA
 *
 * Taxonomía de las 18 líneas y familias de carpintería de aluminio,
 * cristal templado y estructuras arquitectónicas.
 */

export const SLUGS_CATEGORIAS = [
  "ventanas",
  "mamparas",
  "puertas",
  "fachadas-muros-cortina",
  "barandas",
  "techos-policarbonato",
  "divisiones",
  "obras-ejecutadas",
  "sistema-spider",
  "espejos-biselados",
  "drywall-baldosas",
  "muebles-melamine",
  "reposteros-aluminio",
  "repisas-cristal",
  "pizarras-cristal",
  "rejas-seguridad",
  "disenos-renders",
  "catalogo-materiales",
] as const;

export type SlugCategoria = (typeof SLUGS_CATEGORIAS)[number];

export interface SubcategoriaInfo {
  slug: string;
  nombre: string;
  total: number;
}

export interface CategoriaCatalogo {
  slug: SlugCategoria;
  nombre: string;
  descripcion: string;
  icono: string;
  destacado: boolean;
  portada: string;
  totalItems: number;
  subcategorias: SubcategoriaInfo[];
}

export interface ItemCatalogo {
  id: string;
  categoria: SlugCategoria;
  subcategoria: string;
  subcategoriaNombre: string;
  titulo: string;
  src: string;
  thumb: string;
  ancho: number;
  alto: number;
  esVideo: boolean;
  destacado: boolean;
}

export interface CatalogoData {
  generadoEn: string;
  totalGeneral: number;
  categorias: CategoriaCatalogo[];
  items: ItemCatalogo[];
}
