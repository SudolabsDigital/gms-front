"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { Tipo } from "@/features/cotizar/types";
import { GaleriaDeTipos, type GrupoDeTipos, recuentoDePaneles } from "@/features/plantillas/components/galeria-de-tipos";
import { TiraComposicion } from "@/features/plantillas/components/tira-composicion";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import { ALTO_DE_CONTROL } from "@/lib/interfaz";
import { cn } from "@/lib/utils";

/**
 * Qué ventana se cotiza, elegida por su dibujo (decisión 70; `series/52-brief-espacio-de-la-serie` § 4). El disparador
 * enseña el dibujo del tipo elegido y su recuento; al tocarlo se abre la galería —un diálogo en el escritorio, la hoja
 * inferior en el móvil—, la misma de la pestaña Tipos de la serie. Con más de una serie o de un diseño, por grupos.
 */
export function SelectorDeTipo({
  id,
  tipos,
  tipoId,
  alCambiar,
}: {
  id: string;
  tipos: Tipo[];
  tipoId: string;
  alCambiar: (id: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const actual = tipos.find((t) => t.id === tipoId);

  return (
    <>
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        onClick={() => setAbierto(true)}
        className={cn(
          ALTO_DE_CONTROL,
          "border-input flex w-full items-center gap-2 rounded-lg border bg-transparent pr-2 pl-2.5 text-left text-sm transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 dark:bg-input/30 dark:hover:bg-input/50",
        )}
      >
        {actual ? (
          <>
            <TiraComposicion composicion={actual.composicion} className="h-6 w-16 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{recuentoDePaneles(actual.composicion)}</span>
            <span className="text-muted-foreground shrink-0 font-mono text-xs">{actual.codigo}</span>
          </>
        ) : (
          <span className="text-muted-foreground flex-1">Elija la ventana</span>
        )}
        <ChevronDown aria-hidden className="size-4 shrink-0 opacity-50" />
      </button>

      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo="Elija la ventana"
        descripcion="Por su dibujo: F es un panel fijo y D una hoja corrediza. Las medidas escritas se conservan."
        ancho="amplio"
      >
        <GaleriaDeTipos
          grupos={gruposDe(tipos)}
          elegido={tipoId}
          alElegir={(elegido) => {
            alCambiar(elegido);
            setAbierto(false);
          }}
          densa
        />
      </PanelResponsivo>
    </>
  );
}

/**
 * Los tipos por serie y diseño, en el orden en que llegan. Con un solo grupo no hay títulos —una serie y un diseño
 * hablan por sí solos—; con varias series, el título dice las dos cosas.
 */
function gruposDe(tipos: Tipo[]): GrupoDeTipos[] {
  const grupos = new Map<string, { serie: string | null; diseno: string | null; tipos: Tipo[] }>();

  for (const tipo of tipos) {
    const clave = `${tipo.diseno?.serie?.codigo ?? ""}/${tipo.diseno?.codigo ?? ""}`;
    const grupo = grupos.get(clave) ?? { serie: tipo.diseno?.serie?.nombre ?? null, diseno: tipo.diseno?.nombre ?? null, tipos: [] };
    grupo.tipos.push(tipo);
    grupos.set(clave, grupo);
  }

  const lista = [...grupos.entries()];
  const variasSeries = new Set(lista.map(([, g]) => g.serie)).size > 1;

  return lista.map(([clave, grupo]) => ({
    clave,
    titulo:
      lista.length === 1 ? undefined : [variasSeries ? grupo.serie : null, grupo.diseno].filter(Boolean).join(" · ") || undefined,
    tipos: grupo.tipos,
  }));
}
