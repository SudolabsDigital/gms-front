"use client";

import { useEffect, useRef } from "react";

/** La altura de la barra, publicada para que los avisos se pongan encima (`components/ui/sonner.tsx`) */
const VARIABLE = "--alto-barra-fija";

/**
 * La acción principal de una pantalla del ERP en el móvil: fija abajo, al alcance del pulgar, sobre el
 * área segura del teléfono (`proyectos/51-ui`). En el escritorio no existe: la acción vive en la cabecera.
 *
 * La página que la usa deja espacio abajo (`pb-24`/`pb-28` en el móvil) para que no tape el último bloque.
 * Estaba copiada en el alta y en las etapas del proyecto (`G-58`).
 *
 * **Publica su altura real** en `--alto-barra-fija`: no mide siempre lo mismo —en `aprobado` lleva el rótulo de lo
 * que llega bajo el botón—, y un desplazamiento fijo de los avisos la tapaba 9 px (recorrido de B.3, B2-D3). En el
 * escritorio está oculta y mide 0.
 */
export function BarraFijaMovil({ children }: { children: React.ReactNode }) {
  const barra = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodo = barra.current;
    if (!nodo) return;

    const raiz = document.documentElement;
    const observador = new ResizeObserver(() => raiz.style.setProperty(VARIABLE, `${nodo.offsetHeight}px`));
    observador.observe(nodo);

    return () => {
      observador.disconnect();
      raiz.style.removeProperty(VARIABLE);
    };
  }, []);

  return (
    <div
      ref={barra}
      className="bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
    >
      {children}
    </div>
  );
}
