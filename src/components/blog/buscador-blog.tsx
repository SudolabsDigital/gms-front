"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X, Clock, Tag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EntradaDeBusqueda {
  slug: string;
  titulo: string;
  descripcion: string;
  etiquetas: string[];
  /** Nombres legibles, que es como los escribe quien busca. */
  temas: string[];
  encabezados: string[];
  autor: string;
  serie?: string;
  fecha: string;
  minutos: number;
}

export interface AccesoRapido {
  etiqueta: string;
  nombre: string;
  total: number;
}

/** Sin acentos y en minúsculas: quien escribe «catalogo» debe encontrar «catálogo». */
function normalizar(texto: string): string {
  return texto
    .replace(/ñ/g, "n")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

interface Puntuada {
  entrada: EntradaDeBusqueda;
  puntos: number;
  motivo: string;
}

/**
 * Puntúa por DÓNDE aparece el término para priorizar coincidencias en el título y temas.
 */
function puntuar(entrada: EntradaDeBusqueda, terminos: string[]): Puntuada | null {
  const campos: [string, number, string][] = [
    [entrada.titulo, 12, "título"],
    [entrada.temas.join(" "), 8, "categoría"],
    [entrada.etiquetas.join(" "), 8, "etiqueta"],
    [entrada.descripcion, 5, "resumen"],
    [entrada.encabezados.join(" "), 4, "apartado"],
    [entrada.serie ?? "", 3, "serie"],
    [entrada.autor, 1, "autor"],
  ];

  let puntos = 0;
  let motivo = "";

  for (const termino of terminos) {
    let encontradoAqui = false;

    for (const [texto, peso, nombre] of campos) {
      if (normalizar(texto).includes(termino)) {
        puntos += peso;
        encontradoAqui = true;
        if (!motivo) motivo = nombre;
      }
    }

    if (!encontradoAqui) return null;
  }

  return { entrada, puntos, motivo };
}

export function BuscadorDeBlog({
  indice,
  accesos,
}: {
  indice: EntradaDeBusqueda[];
  accesos: AccesoRapido[];
}) {
  const [consulta, setConsulta] = React.useState("");
  const campo = React.useRef<HTMLInputElement>(null);

  // Atajo de teclado «/» para enfocar el buscador
  React.useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      const activo = document.activeElement;
      const escribiendo =
        activo instanceof HTMLInputElement || activo instanceof HTMLTextAreaElement;
      if (e.key === "/" && !escribiendo) {
        e.preventDefault();
        campo.current?.focus();
      }
      if (e.key === "Escape") setConsulta("");
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, []);

  const terminos = React.useMemo(
    () => normalizar(consulta).split(/\s+/).filter((t) => t.length > 1),
    [consulta],
  );

  const resultados = React.useMemo(() => {
    if (terminos.length === 0) return [];
    return indice
      .map((entrada) => puntuar(entrada, terminos))
      .filter((r): r is Puntuada => r !== null)
      .sort((a, b) => b.puntos - a.puntos || b.entrada.fecha.localeCompare(a.entrada.fecha))
      .slice(0, 8);
  }, [indice, terminos]);

  const buscando = terminos.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de Búsqueda Principal */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />

        <input
          ref={campo}
          type="search"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Busca por serie, material o proyecto — prueba «Serie 80», «DVH», «UNCP» o «Templado»..."
          aria-label="Buscar en el blog técnico"
          className={cn(
            "h-14 w-full rounded-2xl border border-border bg-card pl-13 pr-14",
            "text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground",
            "outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20",
            "[&::-webkit-search-cancel-button]:appearance-none shadow-xs",
          )}
        />

        {consulta ? (
          <button
            type="button"
            onClick={() => setConsulta("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] font-mono font-bold text-muted-foreground md:block">
            /
          </kbd>
        )}
      </div>

      {/* Filtros de Acceso Rápido por Categorías Temáticas */}
      {!buscando && accesos.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <Tag className="size-3.5 text-primary" />
            <span>Filtrar por Tema de Especialidad</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {accesos.map((acceso) => (
              <Link
                key={acceso.etiqueta}
                href={`/blog/etiqueta/${acceso.etiqueta}`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border border-border/80 bg-secondary/40 px-3.5 py-2",
                  "text-xs font-semibold text-foreground/85 transition-all hover:border-primary hover:bg-primary/10 hover:text-primary shadow-2xs",
                )}
              >
                <span>{acceso.nombre}</span>
                <span className="flex size-5 items-center justify-center rounded-md bg-secondary text-[10px] font-mono font-bold text-muted-foreground">
                  {acceso.total}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Resultados de Búsqueda Instantánea */}
      {buscando && (
        <div
          role="status"
          aria-live="polite"
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
        >
          {resultados.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              No se encontraron artículos que coincidan con «<strong>{consulta.trim()}</strong>». Prueba con términos como «Serie 80», «Acústica», «Fachada» o «Garantía».
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {resultados.map(({ entrada, motivo }) => (
                <li key={entrada.slug}>
                  <Link
                    href={`/blog/${entrada.slug}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-secondary/60"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[15px] font-bold leading-snug text-foreground hover:text-primary">
                        {entrada.titulo}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1 text-primary">
                          <Clock className="size-3" />
                          <span>{entrada.minutos} min</span>
                        </span>
                        <span>·</span>
                        <span>Coincidencia en {motivo}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-primary shrink-0">
                      <span>Leer artículo</span>
                      <ArrowRight className="size-3.5" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
