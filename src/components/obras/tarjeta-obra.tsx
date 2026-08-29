"use client";

import { MapPin, Maximize2, Building } from "lucide-react";
import type { ObraItem } from "@/lib/obras/esquema";
import { cn } from "@/lib/utils";

export function TarjetaObra({
  obra,
  onAbrir,
}: {
  obra: ObraItem;
  onAbrir: () => void;
}) {
  const esHero = obra.nivel === 1;

  return (
    <div
      onClick={onAbrir}
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-border/80 bg-slate-950 shadow-xs transition-all duration-500 cursor-pointer select-none",
        "hover:shadow-2xl hover:border-primary/60 hover:-translate-y-1",
        esHero
          ? "md:col-span-2 md:row-span-2 min-h-[380px] md:min-h-[480px]"
          : "min-h-[280px] md:min-h-[320px]"
      )}
    >
      {/* ── Fotografía en Alta Definición ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={obra.src}
        alt={obra.titulo}
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-106"
      />

      {/* ── Scrim Oscuro Sutil (#0A1118) ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 transition-opacity duration-300 group-hover:from-black/92" />

      {/* ── Badge Superior de Ubicación ── */}
      <div className="absolute top-3.5 right-3.5 z-10">
        <div className="rounded-full bg-black/75 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/15 shadow-sm">
          📍 {obra.ubicacionDetalle}
        </div>
      </div>

      {/* ── Información Esencial en la Base (Limpia y Sin Ruido) ── */}
      <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00c9ff] block truncate">
            {obra.tipoNombre} · {obra.zonaNombre}
          </span>
          <h3 className="text-sm sm:text-base font-black text-white leading-tight mt-0.5 truncate">
            {obra.titulo}
          </h3>
        </div>

        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md border border-white/20 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#00c9ff] group-hover:text-slate-950">
          <Maximize2 className="size-4" />
        </span>
      </div>
    </div>
  );
}
