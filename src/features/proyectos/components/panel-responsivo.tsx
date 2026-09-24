"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEsEscritorio } from "@/lib/use-es-escritorio";

/**
 * Hoja inferior en el móvil, diálogo en el escritorio (`proyectos/51-ui` § alta y diálogos de la ficha).
 *
 * En el móvil el formulario sube desde abajo, al alcance del pulgar y con el teclado sin taparlo; en el
 * escritorio se centra. Son dos componentes de Radix, no dos estilos del mismo: por eso decide un hook
 * y no una clase de CSS.
 */
export function PanelResponsivo({
  abierto,
  alCambiar,
  titulo,
  descripcion,
  children,
}: {
  abierto: boolean;
  alCambiar: (abierto: boolean) => void;
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  const escritorio = useEsEscritorio();

  if (escritorio) {
    return (
      <Dialog open={abierto} onOpenChange={alCambiar}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{titulo}</DialogTitle>
            {descripcion ? <DialogDescription>{descripcion}</DialogDescription> : null}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={abierto} onOpenChange={alCambiar}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto rounded-t-lg">
        <SheetHeader>
          <SheetTitle>{titulo}</SheetTitle>
          {descripcion ? <SheetDescription>{descripcion}</SheetDescription> : null}
        </SheetHeader>
        <div className="px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
