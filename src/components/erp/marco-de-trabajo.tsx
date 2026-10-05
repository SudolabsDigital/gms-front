import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * El armazón de una pantalla del ERP (SEC.9a, decisión 76): la barra de contexto arriba, un panel opcional a la
 * izquierda y el contenido. Lo compone cada página —o el layout de la obra— con lo que ya sabe; ningún componente
 * pide nada por su cuenta (`03-sistema-de-diseno/componentes-del-armazon` § 1). `INV-E06` exige que toda página lo
 * use, también la rama de `SinAcceso`.
 *
 * El desplazamiento sigue siendo el del documento: la barra y el panel se pegan (`sticky`), y lo que ya se pegaba en
 * una página —la barra del cotizador, el riel de la ficha— solo suma `--alto-barra-contexto`. En papel, solo el
 * contenido.
 */
export function MarcoDeTrabajo({
  barra,
  panel,
  panelAncho = false,
  panelEnMovil = false,
  children,
}: {
  barra: ReactNode;
  /** Las secciones de un espacio o la lista de un apartado; en el móvil no se pinta, salvo con `panelEnMovil` */
  panel?: ReactNode;
  /** Una lista con nombre e importe (`PanelDeLista`) pide 288 px; unas secciones, 240 */
  panelAncho?: boolean;
  /**
   * En el móvil, el panel va en el flujo, antes del contenido: cuando el panel **es** la acción principal de la página
   * —encontrar a un cliente en la portada de Clientes (`52-brief-clientes` § 2)— y en el móvil no habría otro sitio
   */
  panelEnMovil?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {barra}
      <div className={cn("flex min-w-0 flex-1", panelEnMovil && "flex-col md:flex-row")}>
        {panel ? (
          <aside
            className={cn(
              "bg-card shrink-0 md:sticky md:top-[var(--alto-barra-contexto)] md:block md:h-[calc(100svh-var(--alto-barra-contexto))] md:overflow-y-auto md:border-r md:border-b-0 print:hidden",
              panelEnMovil ? "border-b" : "hidden",
              panelAncho ? "md:w-72" : "md:w-60",
            )}
          >
            {panel}
          </aside>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col p-4 md:p-6 print:p-0">{children}</div>
      </div>
    </div>
  );
}
