"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CompositorTipo } from "@/features/plantillas/components/compositor-tipo";
import type { ReglaDeComposicion } from "@/features/series/types";

/**
 * Crear un tipo, fuera del camino de quien solo viene a consultar.
 *
 * El compositor ocupaba la mitad superior de la página de plantillas, de modo que la
 * primera pantalla la llenaba un formulario en blanco y los tipos que ya existían —lo
 * que casi todo el mundo viene a buscar— quedaban debajo del pliegue. Crear un tipo pasa
 * unas pocas veces al mes; consultarlos, varias veces al día. Vive junto a su diseño, en
 * la pestaña Tipos de la serie (decisiones 73 y 79).
 */
export function DialogoNuevoTipo({
  disenoId,
  disenoNombre,
  regla,
  codigoSugerido,
}: {
  disenoId: string;
  disenoNombre: string;
  regla: ReglaDeComposicion;
  codigoSugerido: string;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="brand" size="control">
          <Plus className="size-4" />
          Nuevo tipo
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo tipo en {disenoNombre}</DialogTitle>
          <DialogDescription>
            Marque qué paneles son fijos y cuáles corren. El tipo nace calculable:
            hereda las reglas del diseño y ya se puede cotizar.
          </DialogDescription>
        </DialogHeader>

        <CompositorTipo
          disenoId={disenoId}
          disenoNombre={disenoNombre}
          regla={regla}
          codigoSugerido={codigoSugerido}
          conTarjeta={false}
          alGuardar={() => setAbierto(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
