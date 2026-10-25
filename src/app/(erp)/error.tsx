"use client";

import { useEffect } from "react";

import { AvisoSinServidor } from "@/components/erp/aviso-sin-servidor";

/**
 * Cuando el ERP no puede pintar la página.
 *
 * En la práctica casi siempre significa lo mismo: Laravel no respondió. Antes eso
 * llegaba al usuario como el overlay de errores de Next, que muestra una traza de
 * JavaScript y ninguna indicación de qué hacer.
 *
 * No se muestra `error.message` en pantalla. Puede contener rutas internas o detalles
 * del backend, y a quien está delante no le sirven: lo que necesita es saber si debe
 * reintentar o llamar a alguien. El detalle va a la consola, donde lo lee quien depura.
 *
 * [AVISO] Next 16: el segundo parámetro es `unstable_retry`, no el `reset` de versiones
 * anteriores (ver `node_modules/next/dist/docs/.../file-conventions/error.md`).
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[ERP] fallo al renderizar la página:", error);
  }, [error]);

  // Sin marco: la barra de contexto es de servidor y aquí se está en un límite de error del cliente
  return (
    <div className="p-4 md:p-6">
      <AvisoSinServidor onReintentar={() => unstable_retry()} referencia={error.digest} />
    </div>
  );
}
