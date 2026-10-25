import type { ReactNode } from "react";

/**
 * El marco de una lista del ERP (SEC.9c, decisión 76; el patrón de la tabla de usuarios de la referencia, medido:
 * herramientas arriba, cabecera de 36 px y un pie «Total: …» de 36). Dentro van las dos mitades de `ListaDeRegistros`
 * —las tarjetas del móvil y la tabla del escritorio, esta con `incrustada`— o el mensaje de vacío.
 *
 * Las herramientas (el buscador) y el pie (el total, las páginas) son **un nodo cada uno**: en el escritorio forman la
 * tarjeta de la tabla, con sus filetes; en el móvil quedan encima y debajo de las tarjetas, sin marco.
 */
export function TablaDeDatos({
  herramientas,
  pie,
  children,
}: {
  herramientas?: ReactNode;
  pie?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 md:gap-0 md:overflow-hidden md:rounded-md md:border md:bg-card md:shadow-sm">
      {herramientas ? (
        <div className="flex flex-wrap items-center gap-2 md:border-b md:px-3 md:py-2 [&>form]:w-full md:[&>form]:w-80">
          {herramientas}
        </div>
      ) : null}
      {children}
      {pie ? (
        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm md:min-h-9 md:border-t md:bg-muted/30 md:px-3 md:py-1.5 md:text-xs">
          {pie}
        </div>
      ) : null}
    </section>
  );
}
