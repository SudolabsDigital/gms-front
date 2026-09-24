/**
 * La acción principal de una pantalla del ERP en el móvil: fija abajo, al alcance del pulgar, sobre el
 * área segura del teléfono (`proyectos/51-ui`). En el escritorio no existe: la acción vive en la cabecera.
 *
 * La página que la usa deja espacio abajo (`pb-24`/`pb-28` en el móvil) para que no tape el último bloque.
 * Estaba copiada en el alta y en las etapas del proyecto (`G-58`).
 */
export function BarraFijaMovil({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      {children}
    </div>
  );
}
