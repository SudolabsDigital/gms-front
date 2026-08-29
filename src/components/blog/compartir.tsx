"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * COMPARTIR — WhatsApp primero, y no por orden alfabético.
 *
 * Es el canal por el que llega y circula todo aquí: los cinco botones del sitio
 * abren WhatsApp, y un tutorial útil se reenvía al grupo antes que
 * a ninguna red. El resto acompaña.
 *
 * El enlace se copia con la API del portapapeles, que **solo existe en contexto
 * seguro**; si falla —http, permiso denegado, navegador antiguo— se selecciona
 * el texto para que se pueda copiar a mano en vez de no hacer nada.
 */

export function Compartir({
  url,
  titulo,
  className,
  orientacion = "vertical",
}: {
  url: string;
  titulo: string;
  className?: string;
  orientacion?: "vertical" | "horizontal";
}) {
  const [copiado, setCopiado] = React.useState(false);
  const respaldo = React.useRef<HTMLInputElement>(null);

  const texto = encodeURIComponent(`${titulo} — ${url}`);
  const enlace = encodeURIComponent(url);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      // Sin portapapeles: se selecciona para que el usuario copie con Ctrl+C.
      respaldo.current?.select();
    }
  }

  const claseBoton =
    "flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card shadow-sm transition-haptic hover:scale-105 hover:border-primary/30 hover:shadow-md";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Compartir</p>

      <div
        className={cn(
          "flex gap-2.5",
          orientacion === "vertical" ? "flex-row lg:flex-col" : "flex-row flex-wrap",
        )}
      >
        <a
          href={`https://wa.me/?text=${texto}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir por WhatsApp"
          className={claseBoton}
          style={{ boxShadow: "0 6px 18px -8px rgba(37,211,102,0.3)" }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${enlace}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en Facebook"
          className={claseBoton}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>

        <a
          href={`https://x.com/intent/tweet?text=${texto}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir en X"
          className={claseBoton}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#090d16"
              d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.81-5.96 6.81H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64Z"
            />
          </svg>
        </a>

        <button
          type="button"
          onClick={copiar}
          aria-label="Copiar el enlace del artículo"
          className={cn(claseBoton, copiado && "border-success/50 bg-success/10")}
        >
          {copiado ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M20 6L9 17l-5-5"
                stroke="#10b981"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="9" y="9" width="12" height="12" rx="2.4" stroke="#090d16" strokeWidth="1.9" />
              <path
                d="M5 15V5a2 2 0 0 1 2-2h10"
                stroke="#090d16"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {copiado && <span className="text-[11px] font-bold text-success">Enlace copiado</span>}

      {/* Solo se usa cuando el portapapeles no está disponible. */}
      <input ref={respaldo} readOnly value={url} className="sr-only" tabIndex={-1} aria-hidden />
    </div>
  );
}
