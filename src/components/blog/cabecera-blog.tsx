/**
 * RE-EXPORT DE RETROCOMPATIBILIDAD
 *
 * El organismo transversal de cabecera ha sido promovido a:
 * `@/components/layout/subhero-cabecera`
 *
 * Mantener este archivo previene regresiones en imports legacy mientras se completa
 * la migración gradual de las páginas del portal.
 */
export {
  SubheroCabecera as CabeceraDePagina,
  type SubheroCabeceraProps as CabeceraDePaginaProps,
} from "@/components/layout/subhero-cabecera";
