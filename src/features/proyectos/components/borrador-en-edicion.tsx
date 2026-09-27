"use client";

import { createContext, useContext, useState } from "react";

/**
 * Lo que el documento del borrador tiene sin guardar, a la vista de quien vaya a emitirlo.
 *
 * La ficha tiene dos «Emitir» —el del pie del documento y el del riel— y los dos deben emitir lo que se ve
 * (recorrido UX.2, V02 y V03). El documento publica aquí si tiene cambios y cómo guardarlos; «Emitir» guarda
 * primero y después confirma con lo guardado. Sin proveedor no hay nada pendiente: se emite lo guardado.
 */
export type CambiosPendientes = {
  cotizacionId: string;
  /** Guarda sin refrescar la ficha: el documento se remonta al refrescar y cerraría el diálogo de emitir */
  guardar: () => Promise<boolean>;
};

const Contexto = createContext<{
  pendientes: CambiosPendientes | null;
  publicar: (pendientes: CambiosPendientes | null) => void;
} | null>(null);

export function BorradorEnEdicion({ children }: { children: React.ReactNode }) {
  const [pendientes, publicar] = useState<CambiosPendientes | null>(null);
  return <Contexto.Provider value={{ pendientes, publicar }}>{children}</Contexto.Provider>;
}

export function useBorradorEnEdicion() {
  return useContext(Contexto);
}
