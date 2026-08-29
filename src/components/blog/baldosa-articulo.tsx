import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Articulo } from "@/lib/blog/esquema";
import { CLASES_DE_NIVEL, type Nivel } from "@/lib/blog/ranking";

/**
 * Baldosa del mosaico del blog.
 * Muestra la imagen de portada con un degradado sutil, tiempo de lectura y título.
 */
export function BaldosaDeArticulo({
  articulo,
  nivel,
  prioridad = false,
}: {
  articulo: Articulo;
  nivel: Nivel;
  prioridad?: boolean;
}) {
  return (
    <Link
      href={`/blog/${articulo.slug}`}
      className={cn(
        "group relative flex min-h-[14rem] flex-col overflow-hidden rounded-3xl",
        "border border-white/10 bg-slate-900/30 transition-all duration-300 hover:border-[#00C9FF]/50 shadow-md",
        CLASES_DE_NIVEL[nivel],
        nivel === 1 && "md:min-h-[28rem]",
        (nivel === 2 || nivel === 3) && "md:min-h-[15rem]",
      )}
    >
      {/* Imagen de portada */}
      <Image
        src={articulo.portada}
        alt={articulo.portadaAlt}
        fill
        priority={prioridad}
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes={nivel === 1 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
      />

      {/* Degradado sutil de menor intensidad para apreciar la fotografía nítida */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-300 group-hover:from-black/85"
      />

      {/* Contenido: solo tiempo de lectura y título */}
      <div
        className={cn(
          "relative mt-auto flex flex-col gap-2 z-10",
          nivel === 1 ? "p-6 sm:p-8" : "p-5 sm:p-6",
        )}
      >
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#00C9FF]">
          <Clock className="size-3.5 shrink-0" />
          <span>{articulo.minutosDeLectura} min de lectura</span>
        </div>

        <h3
          className={cn(
            "text-balance font-black leading-[1.2] tracking-tight text-white transition-colors group-hover:text-[#00C9FF]",
            nivel === 1 ? "text-xl sm:text-2xl md:text-3xl" : "text-base sm:text-lg md:text-xl",
          )}
        >
          {articulo.titulo}
        </h3>
      </div>
    </Link>
  );
}
