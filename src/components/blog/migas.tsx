/**
 * RE-EXPORT DE RETROCOMPATIBILIDAD
 *
 * El componente visual de migas ha sido promovido a:
 * `@/components/layout/migas-visual`
 *
 * Se eliminó la inyección embebida de JSON-LD BreadcrumbList para evitar duplicidad
 * con el componente canónico `@/components/seo/breadcrumb-schema`.
 */
export {
  MigasVisual as Migas,
  type Miga,
  type MigasVisualProps,
} from "@/components/layout/migas-visual";
