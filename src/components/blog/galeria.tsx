"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ImagenDeGaleria {
  src: string;
  alt: string;
}

/**
 * GALERÍA COLLAGE — acomoda imágenes automáticamente según su proporción.
 *
 * Usa CSS `columns` para un layout tipo masonry natural: las imágenes fluyen de
 * arriba a abajo, de izquierda a derecha, y cada una ocupa el alto que necesita
 * sin recorte ni cálculo de JavaScript. `break-inside-avoid` impide que una
 * imagen se parta entre dos columnas.
 *
 * Incluye lightbox con navegación por teclado (← → Esc).
 *
 * Uso en MDX:
 * ```mdx
 * <Galeria imagenes={[
 *   { src: "/blog/mi-post/foto1.webp", alt: "Descripción 1" },
 *   { src: "/blog/mi-post/foto2.webp", alt: "Descripción 2" },
 * ]} />
 * ```
 */
export function Galeria({
  imagenes: imagenesProp,
  children,
  columnas = 3,
  className,
}: {
  imagenes?: ImagenDeGaleria[];
  children?: React.ReactNode;
  columnas?: 2 | 3 | 4;
  className?: string;
}) {
  const [ampliada, setAmpliada] = React.useState<number | null>(null);

  // Extraer imágenes de props o de children (ej: múltiples <img /> o markdown embebido)
  const imagenes = React.useMemo<ImagenDeGaleria[]>(() => {
    if (imagenesProp && imagenesProp.length > 0) return imagenesProp;
    if (!children) return [];

    const extraidas: ImagenDeGaleria[] = [];
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      const props = child.props as { src?: string; alt?: string; children?: React.ReactNode };
      if (props?.src) {
        extraidas.push({ src: props.src, alt: props.alt ?? "" });
      } else if (props?.children) {
        React.Children.forEach(props.children, (nested) => {
          if (React.isValidElement(nested)) {
            const nestedProps = nested.props as { src?: string; alt?: string };
            if (nestedProps?.src) {
              extraidas.push({ src: nestedProps.src, alt: nestedProps.alt ?? "" });
            }
          }
        });
      }
    });
    return extraidas;
  }, [imagenesProp, children]);

  React.useEffect(() => {
    if (ampliada === null) return;

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAmpliada(null);
      if (e.key === "ArrowRight")
        setAmpliada((i) => (i !== null ? Math.min(i + 1, imagenes.length - 1) : null));
      if (e.key === "ArrowLeft")
        setAmpliada((i) => (i !== null ? Math.max(i - 1, 0) : null));
    };

    document.addEventListener("keydown", alPulsar);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.body.style.overflow = "";
    };
  }, [ampliada, imagenes.length]);

  const clasesColumnas = {
    2: "columns-1 sm:columns-2",
    3: "columns-1 sm:columns-2 lg:columns-3",
    4: "columns-1 sm:columns-2 md:columns-3 xl:columns-4",
  };

  return (
    <>
      <div className={cn("my-8", clasesColumnas[columnas], "gap-3", className)}>
        {imagenes.map((img, i) => (
          <button
            key={`${img.src}-${i}`}
            type="button"
            onClick={() => setAmpliada(i)}
            className={cn(
              "mb-3 block w-full overflow-hidden rounded-xl",
              "border border-border bg-card shadow-sm",
              "break-inside-avoid cursor-zoom-in",
              "transition-all duration-300 hover:shadow-lg hover:border-primary/30",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="w-full object-cover"
            />
            {img.alt && (
              <span className="block px-3 py-2 text-xs font-medium text-muted-foreground text-center">
                {img.alt}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {ampliada !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setAmpliada(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imagen ampliada"
        >
          {/* Anterior */}
          {ampliada > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAmpliada(ampliada - 1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Imagen anterior"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagenes[ampliada].src}
            alt={imagenes[ampliada].alt}
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Siguiente */}
          {ampliada < imagenes.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAmpliada(ampliada + 1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Imagen siguiente"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Cerrar */}
          <button
            type="button"
            onClick={() => setAmpliada(null)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Cerrar visor"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Pie de imagen */}
          {imagenes[ampliada].alt && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-lg text-center text-sm font-medium text-white/80 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
              {imagenes[ampliada].alt}
            </p>
          )}

          {/* Contador */}
          <span className="absolute top-4 left-4 text-sm font-bold text-white/60">
            {ampliada + 1} / {imagenes.length}
          </span>
        </div>
      )}
    </>
  );
}
