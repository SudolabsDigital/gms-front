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
  children,
}: {
  barra: ReactNode;
  /** Las secciones de un espacio o la lista de un apartado; en el móvil no se pinta */
  panel?: ReactNode;
  /** Una lista con nombre e importe (`PanelDeLista`) pide 288 px; unas secciones, 240 */
  panelAncho?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {barra}
      <div className="flex min-w-0 flex-1">
        {panel ? (
          <aside
            className={cn(
              "bg-card sticky top-[var(--alto-barra-contexto)] hidden h-[calc(100svh-var(--alto-barra-contexto))] shrink-0 overflow-y-auto border-r md:block print:hidden",
              panelAncho ? "w-72" : "w-60",
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
