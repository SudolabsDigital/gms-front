"use client";

import { useState, useEffect } from "react";
import {
  ZoomIn,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import type { ItemCatalogo } from "@/lib/catalogo/esquema";
import { siteConfig } from "@/config/site-config";
import { WhatsAppIcon } from "@/components/landing/social-icons";

export function GaleriaCatalogo({
  items,
  categoriaNombre,
}: {
  items: ItemCatalogo[];
  categoriaNombre: string;
}) {
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [copiado, setCopiado] = useState(false);

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

  const copiarEnlace = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
        No se encontraron modelos o fotos en esta subcategoría.
      </div>
    );
  }

  const itemActual = seleccionado !== null ? items[seleccionado] : null;
  const urlItemActual = itemActual ? `${siteConfig.url}/catalogo/item/${itemActual.id}` : "";

  return (
    <>
      {/* ── Masonry Grid Collage ── */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {items.map((item, index) => {
          const mensajeWhatsApp = `Hola GMS Integra, vi la foto «${item.titulo}» (${item.subcategoriaNombre}) en el catálogo de ${categoriaNombre} (${siteConfig.url}/catalogo/item/${item.id}) y deseo solicitar una cotización.`;
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
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  title="Cotizar este modelo por WhatsApp"
                  aria-label="Cotizar en WhatsApp"
                >
                  <WhatsAppIcon className="size-4 text-white" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal Lightbox ── */}
      {seleccionado !== null && itemActual && (
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
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 z-10 cursor-pointer"
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
              src={itemActual.src}
              alt={itemActual.titulo}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />

            {/* Barra de Información y Acción del Modal */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 w-full rounded-2xl bg-slate-900/95 border border-white/15 p-4 sm:p-5 text-white backdrop-blur-md shadow-2xl">
              <div className="text-center sm:text-left min-w-0 flex-1">
                <span className="text-[11px] font-bold text-brand uppercase tracking-wider block">
                  {categoriaNombre} · {itemActual.subcategoriaNombre}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug truncate">
                  {itemActual.titulo}
                </h3>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
                {/* Botón Copiar Enlace Canónico */}
                <button
                  type="button"
                  onClick={() => copiarEnlace(urlItemActual)}
                  className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15 cursor-pointer"
                  title="Copiar enlace directo del modelo"
                  aria-label="Copiar enlace"
                >
                  {copiado ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                </button>

                {/* Compartir por WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Mira este modelo de ${itemActual.titulo} (${itemActual.subcategoriaNombre}) en el catálogo de GMS Integra: ${urlItemActual}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/15"
                  title="Compartir por WhatsApp"
                  aria-label="Compartir por WhatsApp"
                >
                  <Share2 className="size-4 text-slate-300" />
                </a>

                {/* Botón Cotizar este Modelo */}
                <a
                  href={`https://wa.me/${siteConfig.whatsapp.numero}?text=${encodeURIComponent(
                    `Hola GMS Integra, deseo cotizar el modelo «${itemActual.titulo}» (${categoriaNombre}) del catálogo: ${urlItemActual}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-500 transition-all shadow-md active:scale-98"
                >
                  <WhatsAppIcon className="size-4 text-white" />
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
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 z-10 cursor-pointer"
              aria-label="Siguiente"
            >
              <ChevronRight className="size-6" />
            </button>
          )}

          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={() => setSeleccionado(null)}
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-red-500/80 hover:border-red-500 border border-white/15 z-10 cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>
      )}
    </>
  );
}
