"use client";

import { useEffect } from "react";

/**
 * Pone el foco en un campo al abrir la página, **solo en escritorio** (`51-ui`: «foco inicial en el buscador»). En el
 * móvil no: abriría el teclado encima de la lista que se vino a mirar (recorrido UX.0, R33).
 */
export function FocoEnEscritorio({ id }: { id: string }) {
  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) document.getElementById(id)?.focus();
  }, [id]);

  return null;
}
