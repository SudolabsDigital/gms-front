"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Share2,
  Check,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { WhatsAppIcon, FacebookIcon } from "@/components/landing/social-icons";
import { siteConfig } from "@/config/site-config";
import type { CategoriaCatalogo } from "@/lib/catalogo/esquema";

export function TarjetaCategoria({
  categoria,
  prioridad = false,
}: {
  categoria: CategoriaCatalogo;
  prioridad?: boolean;
}) {
  const [copiado, setCopiado] = useState(false);
  const urlCategoria = `${siteConfig.url}/catalogo/${categoria.slug}`;

  const mensajeCotizar = `Hola GMS Integra, deseo solicitar asesoría y presupuesto para la línea de ${categoria.nombre}.`;
  const urlWaCotizar = `https://wa.me/${siteConfig.whatsapp.numero}?text=${encodeURIComponent(mensajeCotizar)}`;

  const mensajeCompartir = `Mira el catálogo de ${categoria.nombre} de GMS Integra: ${urlCategoria}`;
  const urlWaCompartir = `https://wa.me/?text=${encodeURIComponent(mensajeCompartir)}`;
  const urlFbCompartir = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlCategoria)}`;

  const copiarEnlace = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(urlCategoria);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
      
      {/* ── Portada con Imagen y Scrim ── */}
      <Link
        href={`/catalogo/${categoria.slug}`}
        className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950 block"
        aria-label={`Ver catálogo de ${categoria.nombre}`}
      >
        <Image
          src={categoria.portada}
          alt={categoria.nombre}
          fill
          priority={prioridad}
          className="object-cover transition-transform duration-700 group-hover:scale-106"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-300 group-hover:via-black/15" />

        {/* Badge de Conteo de Fotos y Obras */}
        <div className="absolute top-3.5 right-3.5 z-10 rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/15 shadow-sm">
          {categoria.totalItems} {categoria.totalItems === 1 ? "foto/obra" : "fotos y obras"}
        </div>
      </Link>

      {/* ── Botón Flotante Desplegable de Opciones (Compartir / Contactar) ── */}
      <div className="absolute top-3.5 left-3.5 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20 shadow-md transition-all duration-200 hover:bg-black/90 hover:scale-105 active:scale-95 focus:outline-none"
              aria-label="Opciones de compartir y contacto"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Share2 className="size-4 text-slate-100" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="w-56 rounded-xl border border-border bg-popover p-1.5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuLabel className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              {categoria.nombre}
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-1" />

            {/* Cotizar Directo por WhatsApp */}
            <DropdownMenuItem asChild>
              <a
                href={urlWaCotizar}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer transition-colors"
              >
                <WhatsAppIcon className="size-4 text-emerald-600 shrink-0" />
                <span>Cotizar por WhatsApp</span>
              </a>
            </DropdownMenuItem>

            {/* Compartir por WhatsApp */}
            <DropdownMenuItem asChild>
              <a
                href={urlWaCompartir}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <Share2 className="size-3.5 text-slate-500 shrink-0" />
                <span>Compartir en WhatsApp</span>
              </a>
            </DropdownMenuItem>

            {/* Compartir en Facebook */}
            <DropdownMenuItem asChild>
              <a
                href={urlFbCompartir}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <FacebookIcon className="size-3.5 text-[#1877F2] shrink-0" />
                <span>Compartir en Facebook</span>
              </a>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            {/* Copiar Enlace Directo */}
            <DropdownMenuItem
              onClick={copiarEnlace}
              className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {copiado ? (
                  <Check className="size-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Copy className="size-3.5 text-slate-500 shrink-0" />
                )}
                <span>{copiado ? "¡Enlace copiado!" : "Copiar enlace"}</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Contenido de la Tarjeta (Solo Título y Descripción) ── */}
      <Link
        href={`/catalogo/${categoria.slug}`}
        className="flex flex-1 flex-col p-5 pt-4 transition-colors"
      >
        <h3 className="text-lg font-black tracking-tight text-foreground transition-colors group-hover:text-primary leading-snug">
          {categoria.nombre}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {categoria.descripcion}
        </p>
      </Link>

    </div>
  );
}
