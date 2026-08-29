"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ZoomIn, MessageSquare, Play, X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { ItemCatalogo } from "@/lib/catalogo/esquema";
import { siteConfig } from "@/config/site-config";
import { cn } from "@/lib/utils";

export function GaleriaCatalogo({
  items,
  categoriaNombre,
}: {
  items: ItemCatalogo[];
  categoriaNombre: string;
}) {
  const [seleccionado, setSeleccionado] = useState<number | null>(null);

  useEffect(() => {
    if (seleccionado === null) return;

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSeleccionado(null);
      if (e.key === "ArrowRight")
        setSeleccionado((i) => (i !== null ? Math.min(i + 1, items.length - 1) : null));
      if (e.key === "ArrowLeft")
        setSeleccionado((i) => (i !== null ? Math.max(i - 1, 0) : null));
    };

    document.addEventListener("keydown", alPulsar);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.body.style.overflow = "";
    };
  }, [seleccionado, items.length]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
        No se encontraron modelos o fotos en esta subcategoría.
      </div>
    );
  }

  return (
    <>
      {/* ── Masonry Grid Collage ── */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {items.map((item, index) => {
          const mensajeWhatsApp = `Hola GMS Integra, vi la foto «${item.titulo}» (${item.subcategoriaNombre}) en el catálogo de ${categoriaNombre} y deseo solicitar una cotización.`;
          const urlWhatsApp = `https://wa.me/${siteConfig.whatsapp.numero}?text=${encodeURIComponent(mensajeWhatsApp)}`;

          return (
            <div
              key={item.id}
              className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/40"
            >
              {/* Imagen / Miniatura */}
              <div
                className="relative cursor-zoom-in overflow-hidden bg-slate-100"
                onClick={() => setSeleccionado(index)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumb || item.src}
                  alt={item.titulo}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-103"
                />

                {/* Badge de Video si aplica */}
                {item.esVideo && (
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                    <Play className="size-3 fill-white" />
                    <span>Video</span>
                  </div>
                )}

                {/* Badge de Subcategoría */}
                <div className="absolute top-2.5 right-2.5 rounded bg-[#1A2B45]/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                  {item.subcategoriaNombre}
                </div>

                {/* Overlay en Hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="flex size-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-md">
                    <ZoomIn className="size-5" />
                  </span>
                </div>
              </div>

              {/* Pie de Foto con Botón de Cotización */}
              <div className="flex items-center justify-between gap-2 p-3 bg-card border-t border-border/50">
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-xs font-bold text-foreground" title={item.titulo}>
                    {item.titulo}
                  </h4>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {item.subcategoriaNombre}
                  </span>
                </div>

                <a
                  href={urlWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  title="Cotizar este modelo por WhatsApp"
                  aria-label="Cotizar en WhatsApp"
                >
                  <MessageSquare className="size-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal Lightbox ── */}
      {seleccionado !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-6"
          onClick={() => setSeleccionado(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imagen de catálogo"
        >
          {/* Botón Anterior */}
          {seleccionado > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSeleccionado(seleccionado - 1);
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}

          {/* Contenedor Central */}
          <div
            className="relative flex flex-col items-center max-h-[92vh] max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagen Principal */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={items[seleccionado].src}
              alt={items[seleccionado].titulo}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />

            {/* Barra de Información y Acción del Modal */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 w-full rounded-xl bg-slate-900/90 border border-white/10 p-4 text-white backdrop-blur-md">
              <div className="text-center sm:text-left min-w-0">
                <span className="text-[11px] font-bold text-[#00c9ff] uppercase tracking-wider block">
                  {categoriaNombre} · {items[seleccionado].subcategoriaNombre}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {items[seleccionado].titulo}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-white/50 hidden sm:inline">
                  {seleccionado + 1} / {items.length}
                </span>

                <a
                  href={`https://wa.me/${siteConfig.whatsapp.numero}?text=${encodeURIComponent(
                    `Hola GMS Integra, deseo cotizar el modelo «${items[seleccionado].titulo}» (${categoriaNombre}) del catálogo web.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm"
                >
                  <MessageSquare className="size-4" />
                  <span>Cotizar este Modelo</span>
                </a>
              </div>
            </div>
          </div>

          {/* Botón Siguiente */}
          {seleccionado < items.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSeleccionado(seleccionado + 1);
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 z-10"
              aria-label="Siguiente"
            >
              <ChevronRight className="size-6" />
            </button>
          )}

          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={() => setSeleccionado(null)}
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 z-10"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>
      )}
    </>
  );
}
