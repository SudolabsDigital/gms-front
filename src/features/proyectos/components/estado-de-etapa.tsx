"use client";

import { ChevronDown } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { caminoDelProyecto } from "@/features/proyectos/camino";
import { COMO_SE_LLEGA, ETAPAS } from "@/features/proyectos/textos";
import type { Etapa, Evento } from "@/features/proyectos/types";
import { fechaHora, haceDias } from "@/lib/formato";
import { cn } from "@/lib/utils";

/**
 * El estado de la obra en la barra de contexto (SEC.9a, decisión 76): donde el dashboard de referencia pone su
 * «Connect», aquí va **en qué va el proyecto y desde cuándo**, con los seis tramos del camino. Al pulsarlo se despliega
 * el camino entero con la fecha de cada paso, o cómo se llega a los que faltan.
 *
 * Informa, **no mueve la etapa**: la etapa la mueve la acción principal, por su máquina en el servidor. Cerrado
 * (perdido, anulado) se dice en el tono de peligro, y entregado en el de hecho; nunca solo con color: lo dice la palabra.
 */
export function EstadoDeEtapa({
  etapa,
  etapaDesde,
  creado,
  historia,
}: {
  etapa: Etapa;
  etapaDesde: string;
  creado: string;
  historia: Evento[];
}) {
  const { cerrado, pasos } = caminoDelProyecto({ etapa, creado, historia });
  const tono = cerrado
    ? "border-destructive/30 bg-destructive/5 text-destructive-fuerte"
    : etapa === "entregado"
      ? "border-success/30 bg-success/5 text-success-fuerte"
      : "border-primary/20 bg-accent text-brand";

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "focus-visible:ring-ring inline-flex h-8 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-semibold whitespace-nowrap focus-visible:ring-2 focus-visible:outline-none",
          tono,
        )}
      >
        <span aria-hidden className="size-2 rounded-full bg-current" />
        {ETAPAS[etapa]}
        <span className="font-medium opacity-80">· {haceDias(etapaDesde)}</span>
        <span aria-hidden className="flex gap-0.5">
          {pasos.map((paso) => (
            <span
              key={paso.etapa}
              className={cn("h-1 w-2.5 rounded-full", paso.estado === "futuro" ? "bg-current opacity-20" : "bg-current")}
            />
          ))}
        </span>
        <ChevronDown className="size-3.5" />
        <span className="sr-only">: ver las etapas del proyecto</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3">
        <p className="mb-2 text-xs font-semibold">
          {ETAPAS[etapa]} · desde el {fechaHora(etapaDesde).slice(0, 10)}, {haceDias(etapaDesde)}
        </p>
        <ol className="flex flex-col gap-1">
          {pasos.map((paso) => (
            <li
              key={paso.etapa}
              aria-current={paso.estado === "actual" ? "step" : undefined}
              className={cn(
                "grid grid-cols-[14px_minmax(0,1fr)] items-start gap-2 text-xs",
                paso.estado === "futuro" && "text-muted-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 size-2.5 rounded-full border-2",
                  paso.estado === "hecho" && "border-brand bg-brand",
                  paso.estado === "actual" && "border-primary bg-card ring-accent ring-2",
                  paso.estado === "futuro" && "border-border",
                )}
              />
              <span>
                <span className={cn(paso.estado === "actual" && "text-brand font-semibold")}>{ETAPAS[paso.etapa]}</span>
                <span className="text-muted-foreground block">
                  {paso.estado === "futuro" || !paso.fecha ? COMO_SE_LLEGA[paso.etapa] : fechaHora(paso.fecha)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </PopoverContent>
    </Popover>
  );
}
