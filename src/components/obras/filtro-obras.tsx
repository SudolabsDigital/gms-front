"use client";

import { cn } from "@/lib/utils";
import type { LugarResumen, ObraResumen } from "@/lib/obras/esquema";
import { MapPin, Navigation } from "lucide-react";

/**
 * Filtro de /obras en dos niveles: LUGAR y OBRA.
 *
 * Sustituye a `filtro-zonas` (2026-09-12), que filtraba por zona, subzona y tipo deducidos del nombre
 * de carpeta. El tipo desaparece porque no hay dato que lo sostenga; el lugar solo existe si la carpeta
 * lo declara, y las obras sin lugar se agrupan en «Otras obras» en vez de asignarles uno.
 */
export function FiltroObras({
  lugares,
  obras,
  lugarActivo,
  obraActiva,
  totalFotos,
  onSeleccionarLugar,
  onSeleccionarObra,
}: {
  lugares: LugarResumen[];
  obras: ObraResumen[];
  lugarActivo: string;
  obraActiva: string;
  totalFotos: number;
  onSeleccionarLugar: (slug: string) => void;
  onSeleccionarObra: (slug: string) => void;
}) {
  const lugarActual = lugares.find((l) => l.slug === lugarActivo);
  const obrasVisibles = lugarActivo === "todas" ? obras : obras.filter((o) => o.lugarSlug === lugarActivo);
  const opcionesLugar = [{ slug: "todas", nombre: "Todos los lugares", fotos: totalFotos }, ...lugares];

  return (
    <div className="flex flex-col gap-4">
      {/* ── Nivel 1: lugar declarado por las carpetas ── */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-2">
          1. Lugar
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {opcionesLugar.map((lugar) => {
            const activo = lugarActivo === lugar.slug;
            const Icono = lugar.slug === "todas" ? Navigation : MapPin;

            return (
              <button
                key={lugar.slug}
                type="button"
                onClick={() => onSeleccionarLugar(lugar.slug)}
                aria-pressed={activo}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition-all shrink-0 cursor-pointer",
                  activo
                    ? "bg-primary text-white shadow-md shadow-primary/25 scale-102"
                    : "bg-card border border-border text-slate-700 hover:border-primary/50 hover:text-primary hover:bg-muted"
                )}
              >
                <Icono className={cn("size-3.5", activo ? "text-white" : "text-slate-400")} />
                <span>{lugar.nombre}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    activo ? "bg-white/20 text-white" : "bg-muted text-slate-500"
                  )}
                >
                  {lugar.fotos}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Nivel 2: la obra ── */}
      <div className="pt-2 border-t border-border/50">
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-2">
          2. Obra{lugarActual ? ` en ${lugarActual.nombre}` : ""}
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {obrasVisibles.map((obra) => {
            const activa = obraActiva === obra.slug;

            return (
              <button
                key={obra.slug}
                type="button"
                onClick={() => onSeleccionarObra(activa ? "todas" : obra.slug)}
                aria-pressed={activa}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all shrink-0 cursor-pointer",
                  activa
                    ? "bg-superficie-profunda text-white shadow-xs scale-102"
                    : "bg-muted/60 border border-border/60 text-slate-600 hover:text-foreground hover:bg-muted"
                )}
              >
                <span>{obra.nombre}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                    activa ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  )}
                >
                  {obra.fotos}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
