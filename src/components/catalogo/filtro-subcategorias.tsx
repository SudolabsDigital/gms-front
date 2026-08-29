"use client";

import { cn } from "@/lib/utils";
import type { SubcategoriaInfo } from "@/lib/catalogo/esquema";

export function FiltroSubcategorias({
  subcategorias,
  activa,
  onSeleccionar,
  totalGeneral,
}: {
  subcategorias: SubcategoriaInfo[];
  activa: string;
  onSeleccionar: (slug: string) => void;
  totalGeneral: number;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        type="button"
        onClick={() => onSeleccionar("todos")}
        className={cn(
          "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all shrink-0",
          activa === "todos"
            ? "bg-primary text-white shadow-xs"
            : "bg-card border border-border text-slate-700 hover:border-primary/50 hover:text-primary"
        )}
      >
        <span>Todos</span>
        <span
          className={cn(
            "rounded-full px-1.5 py-0.2 text-[10px]",
            activa === "todos" ? "bg-white/20 text-white" : "bg-muted text-slate-500"
          )}
        >
          {totalGeneral}
        </span>
      </button>

      {subcategorias.map((sub) => {
        const esActiva = activa === sub.slug;

        return (
          <button
            key={sub.slug}
            type="button"
            onClick={() => onSeleccionar(sub.slug)}
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all shrink-0",
              esActiva
                ? "bg-primary text-white shadow-xs"
                : "bg-card border border-border text-slate-700 hover:border-primary/50 hover:text-primary"
            )}
          >
            <span>{sub.nombre}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                esActiva ? "bg-white/20 text-white" : "bg-muted text-slate-500"
              )}
            >
              {sub.total}
            </span>
          </button>
        );
      })}
    </div>
  );
}
