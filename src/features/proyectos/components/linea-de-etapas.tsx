"use client";

import { useState } from "react";

import { caminoDelProyecto } from "@/features/proyectos/camino";
import { CAMINO, COMO_SE_LLEGA, ETAPAS } from "@/features/proyectos/textos";
import type { Etapa, Evento } from "@/features/proyectos/types";
import { fechaHora, haceDias, moneda } from "@/lib/formato";
import { cn } from "@/lib/utils";

type Props = {
  etapa: Etapa;
  etapaDesde: string;
  creado: string;
  historia: Evento[];
  /** `undefined`: quien mira no ve dinero y la clave no viajó (`CAL-04`); `null`: aún no hay cotización */
  total?: number | null;
  saldo?: number | null;
  /** La versión en borrador, si la hay: sin vigente, el proyecto no está «sin cotización» (B.1) */
  borrador?: number | null;
};

/**
 * En qué va el proyecto, de un vistazo: el camino Lead → Entregado con la etapa actual marcada, desde cuándo, y
 * el dinero (decisión 23, `proyectos/52-brief-ficha`). Un toque en un paso dice cuándo se entró en él, o cómo se
 * llega si aún no se alcanzó.
 *
 * **No mueve la etapa**: la etapa la mueve la acción principal, por su máquina en el servidor. Las fechas salen
 * de la historia —el último evento que entró en cada etapa, porque recotizar puede volver atrás—, no se guardan.
 */
export function LineaDeEtapas({ etapa, etapaDesde, creado, historia, total, saldo, borrador = null }: Props) {
  const [elegida, setElegida] = useState<Etapa | null>(null);

  // Perdido y anulado no están en el camino: la línea marca el paso desde el que se cerró (`caminoDelProyecto`)
  const { cerrado, posicion, entrada } = caminoDelProyecto({ etapa, creado, historia });

  const detalle = (paso: Etapa): string => {
    const i = CAMINO.indexOf(paso);
    if (i > posicion || (cerrado && i === posicion && !entrada(paso))) return `${ETAPAS[paso]} · ${COMO_SE_LLEGA[paso]}`;
    return `${ETAPAS[paso]} · desde el ${fechaHora(entrada(paso))}`;
  };

  return (
    <section aria-label="Etapas del proyecto" className="bg-card rounded-md border p-3 shadow-sm md:p-4">
      <ol className="flex">
        {CAMINO.map((paso, i) => {
          const estado = i < posicion || (cerrado && i === posicion) ? "hecho" : i === posicion ? "actual" : "futuro";
          return (
            <li key={paso} className="relative flex flex-1 justify-center">
              {/* El tramo que une este paso con el anterior */}
              {i > 0 ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-[9px] right-1/2 h-0.5 w-full",
                    i <= posicion ? "bg-brand" : "bg-border",
                  )}
                />
              ) : null}
              <button
                type="button"
                onClick={() => setElegida(elegida === paso ? null : paso)}
                aria-current={estado === "actual" ? "step" : undefined}
                aria-expanded={elegida === paso}
                className="relative z-10 flex min-h-11 min-w-11 flex-col items-center gap-1 text-xs"
              >
                <span
                  aria-hidden
                  className={cn(
                    "block size-5 rounded-full border-2",
                    estado === "hecho" && "border-brand bg-brand",
                    estado === "actual" && "border-primary bg-card ring-accent ring-4",
                    estado === "futuro" && "border-border bg-card",
                  )}
                />
                <span
                  className={cn(
                    // En el móvil solo se nombra el paso actual: seis nombres no caben en 390 px
                    "hidden whitespace-nowrap md:block",
                    estado === "actual" ? "text-foreground block font-semibold" : "text-muted-foreground",
                  )}
                >
                  {ETAPAS[paso]}
                  <span className="sr-only">{estado === "hecho" ? " (hecha)" : estado === "futuro" ? " (pendiente)" : " (actual)"}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <p>
          <span className={cn("font-semibold", cerrado && "text-destructive-fuerte")}>{ETAPAS[etapa]}</span>
          <span className="text-muted-foreground">
            {" "}
            · desde el {fechaHora(etapaDesde).slice(0, 10)}, {haceDias(etapaDesde)}
          </span>
        </p>
        {total !== undefined ? (
          <p className="text-muted-foreground flex gap-4">
            {total === null && borrador !== null ? (
              // El borrador no tiene total que enseñar: el cliente aún no lo vio
              <span>Cotización v{borrador} en borrador</span>
            ) : total === null ? (
              // «todavía» promete algo que en un proyecto cerrado ya no pasará
              <span>{cerrado ? "Sin cotización" : "Sin cotización todavía"}</span>
            ) : (
              <span>
                Total <b className="text-foreground font-mono tabular-nums">{moneda(total)}</b>
              </span>
            )}
            {saldo !== undefined && saldo !== null ? (
              <span>
                Saldo <b className="text-foreground font-mono tabular-nums">{moneda(saldo)}</b>
              </span>
            ) : null}
          </p>
        ) : null}
      </div>

      {elegida ? <p className="bg-muted mt-2 rounded-md px-3 py-2 text-sm">{detalle(elegida)}</p> : null}
    </section>
  );
}
