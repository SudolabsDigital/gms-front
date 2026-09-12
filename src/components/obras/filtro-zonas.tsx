"use client";

import { cn } from "@/lib/utils";
import type { ZonaInfo, ZonaSlug } from "@/lib/obras/esquema";
import { MapPin, Navigation, Home, Building2, GraduationCap } from "lucide-react";

export function FiltroZonas({
  zonas,
  zonaActiva,
  subzonaActiva,
  tipoActivo,
  onSeleccionarZona,
  onSeleccionarSubzona,
  onSeleccionarTipo,
}: {
  zonas: ZonaInfo[];
  zonaActiva: ZonaSlug;
  subzonaActiva: string;
  tipoActivo: string;
  onSeleccionarZona: (slug: ZonaSlug) => void;
  onSeleccionarSubzona: (slug: string) => void;
  onSeleccionarTipo: (tipo: string) => void;
}) {
  const zonaActual = zonas.find((z) => z.slug === zonaActiva) || zonas[0];
  const subzonas = zonaActual.subzonas || [];

  const TIPOS = [
    { slug: "todos", label: "Todos los Tipos", icon: null },
    { slug: "residencial", label: "Residencial", icon: Home },
    { slug: "comercial", label: "Comercial & Edificios", icon: Building2 },
    { slug: "institucional", label: "Institucional & Campus", icon: GraduationCap },
  ];

  return (
    <div className="flex flex-col gap-4">
      
      {/* ── Nivel 1: Macro-Zonas Geográficas (Filtro Padre) ── */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-2">
          1. Región / Zona Principal
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {zonas.map((z) => {
            const esActiva = zonaActiva === z.slug;

            return (
              <button
                key={z.slug}
                type="button"
                onClick={() => {
                  onSeleccionarZona(z.slug);
                  onSeleccionarSubzona("todas");
                }}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition-all shrink-0 cursor-pointer",
                  esActiva
                    ? "bg-primary text-white shadow-md shadow-primary/25 scale-102"
                    : "bg-card border border-border text-slate-700 hover:border-primary/50 hover:text-primary hover:bg-muted"
                )}
              >
                {z.slug !== "todas" ? (
                  <MapPin className={cn("size-3.5", esActiva ? "text-brand" : "text-slate-400")} />
                ) : (
                  <Navigation className={cn("size-3.5", esActiva ? "text-brand" : "text-slate-400")} />
                )}
                <span>{z.nombre}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    esActiva ? "bg-white/20 text-white" : "bg-muted text-slate-500"
                  )}
                >
                  {z.total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Nivel 2: Subzonas & Ubicaciones Específicas (Filtro Hijo) ── */}
      {subzonas.length > 1 && (
        <div className="pt-2 border-t border-border/50">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-2">
            2. Ubicación Específica en {zonaActual.nombre}
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {subzonas.map((sub) => {
              const esActiva = subzonaActiva === sub.slug;

              return (
                <button
                  key={sub.slug}
                  type="button"
                  onClick={() => onSeleccionarSubzona(sub.slug)}
                  className={cn(
                    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all shrink-0 cursor-pointer",
                    esActiva
                      ? "bg-[#1A2B45] text-white shadow-xs scale-102 border border-brand-linea/40"
                      : "bg-muted/60 border border-border/60 text-slate-600 hover:text-foreground hover:bg-muted"
                  )}
                >
                  <span>{sub.nombre}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[9px] font-bold",
                      esActiva ? "bg-brand text-slate-950 font-black" : "bg-slate-200 text-slate-600"
                    )}
                  >
                    {sub.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Nivel 3: Tipología de Obra ── */}
      <div className="pt-2 border-t border-border/50">
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-2">
          3. Tipo de Proyecto
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TIPOS.map((tipo) => {
            const esActivo = tipoActivo === tipo.slug;
            const Icono = tipo.icon;

            return (
              <button
                key={tipo.slug}
                type="button"
                onClick={() => onSeleccionarTipo(tipo.slug)}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all shrink-0 cursor-pointer",
                  esActivo
                    ? "bg-slate-900 text-white shadow-xs border border-slate-700"
                    : "bg-muted/40 border border-border/40 text-slate-600 hover:text-foreground hover:bg-muted"
                )}
              >
                {Icono && <Icono className={cn("size-3", esActivo ? "text-brand" : "text-slate-400")} />}
                <span>{tipo.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
