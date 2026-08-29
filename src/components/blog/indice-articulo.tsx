"use client";

import * as React from "react";
import type { Encabezado } from "@/lib/blog/esquema";
import { cn } from "@/lib/utils";

/**
 * El índice del artículo, con resaltado del apartado en el que estás.
 *
 * El resaltado usa `IntersectionObserver` con un `rootMargin` que recorta la
 * ventana a una franja alta: sin eso, el apartado «activo» sería el que está en
 * el centro de la pantalla y saltaría hacia atrás al llegar al final del
 * documento, que es el defecto clásico de estos índices.
 *
 * `scroll-mt-28` en los encabezados —lo pone `mdx-components.tsx`— es lo que
 * evita que la barra fija tape el título al saltar a un ancla.
 */
export function IndiceDeArticulo({
  encabezados,
  className,
}: {
  encabezados: Encabezado[];
  className?: string;
}) {
  const [activo, setActivo] = React.useState<string>("");

  React.useEffect(() => {
    if (encabezados.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        const visibles = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibles.length > 0) setActivo(visibles[0].target.id);
      },
      // Franja entre el 15 % y el 55 % de la altura: el apartado activo es el
      // que está entrando por arriba, no el que ocupa el centro.
      { rootMargin: "-15% 0px -45% 0px", threshold: 0 },
    );

    for (const h of encabezados) {
      const nodo = document.getElementById(h.id);
      if (nodo) observador.observe(nodo);
    }

    return () => observador.disconnect();
  }, [encabezados]);

  if (encabezados.length === 0) return null;

  return (
    <nav aria-label="Índice del artículo" className={className}>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
        En este artículo
      </p>

      <ul className="mt-4 flex flex-col gap-0.5 border-l border-border">
        {encabezados.map((h) => {
          const esActivo = activo === h.id;

          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={esActivo ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l-2 py-1.5 text-[13px] leading-snug transition-colors",
                  h.nivel === 3 ? "pl-7" : "pl-4",
                  esActivo
                    ? "border-primary font-semibold text-foreground"
                    : "border-transparent font-medium text-muted-foreground hover:text-primary",
                )}
              >
                {h.texto}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
