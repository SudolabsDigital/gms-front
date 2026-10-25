"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Abre el diálogo de impresión del navegador; en papel sale solo la hoja (`print:hidden` en todo lo demás) */
export function BotonImprimir() {
  return (
    <Button variant="brand" size="control" onClick={() => window.print()}>
      <Printer className="size-4" />
      Imprimir
    </Button>
  );
}
