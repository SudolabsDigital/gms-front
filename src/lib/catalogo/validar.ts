import catalogoRaw from "@/config/catalogo-data.json";
import type { CatalogoData } from "./esquema";

/**
 * Validador en build-time para asegurar que el catálogo tenga estructura íntegra.
 */
export function exigirCatalogoValido(): void {
  const catalogo = catalogoRaw as CatalogoData;

  if (!catalogo || !Array.isArray(catalogo.categorias) || catalogo.categorias.length === 0) {
    throw new Error("El catálogo no tiene categorías cargadas en src/config/catalogo-data.json");
  }

  if (!Array.isArray(catalogo.items) || catalogo.items.length === 0) {
    throw new Error("El catálogo no tiene ítems de imágenes cargados.");
  }
}
