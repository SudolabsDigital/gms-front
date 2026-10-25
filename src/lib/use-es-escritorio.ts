"use client";

import { useSyncExternalStore } from "react";

/**
 * ¿Pantalla de escritorio (≥ 768 px)? Para lo que no se puede resolver con CSS: elegir entre una hoja
 * inferior en el móvil y un diálogo en el escritorio (`proyectos/51-ui` § alta), que son dos
 * componentes distintos y no dos estilos del mismo.
 *
 * En el servidor responde `false`: los paneles solo se abren con un toque, así que el primer render
 * nunca depende de esto y no hay desajuste de hidratación.
 */
const CONSULTA = "(min-width: 768px)";

function suscribir(avisar: () => void): () => void {
  const medios = window.matchMedia(CONSULTA);
  medios.addEventListener("change", avisar);
  return () => medios.removeEventListener("change", avisar);
}

export function useEsEscritorio(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(CONSULTA).matches,
    () => false,
  );
}
