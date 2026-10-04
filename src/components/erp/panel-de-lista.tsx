"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Enlace } from "@/components/comunes/enlace";
import type { Tono } from "@/components/comunes/insignia-de-dato";
import { cn } from "@/lib/utils";

export type FilaDePanel = {
  /** Puede llevar query (la búsqueda del panel); la fila activa se decide solo por la ruta */
  href: string;
  titulo: string;
  detalle?: string;
  /** El importe de la fila: va en su columna y **nunca se recorta** (medido en la sonda A: «debe» se cortaba) */
  monto?: { texto: string; etiqueta?: string; tono?: Tono };
};

export type GrupoDeLista = { titulo: string; filas: FilaDePanel[] };

const TONOS: Record<Tono, string> = {
  neutro: "text-foreground",
  aviso: "text-warning-fuerte",
  ok: "text-success-fuerte",
  peligro: "text-destructive-fuerte",
};

/**
 * Elegir un registro sin dejar su ficha (SEC.9d, decisión 76; el panel de Table Editor): la lista en el panel del
 * `MarcoDeTrabajo`, por grupos —quien debe arriba—, y la ficha a la derecha. Cada fila es un enlace entero; el título
 * hasta dos líneas antes de recortar, porque el nombre es lo que se reconoce; el importe en su columna.
 */
export function PanelDeLista({
  titulo,
  buscador,
  grupos,
  pie,
}: {
  titulo: string;
  buscador?: ReactNode;
  grupos: GrupoDeLista[];
  pie?: ReactNode;
}) {
  const ruta = usePathname();
  const visibles = grupos.filter((grupo) => grupo.filas.length > 0);

  return (
    <nav aria-label={titulo} className="flex flex-col">
      {buscador ? <div className="border-b p-3 [&>form]:max-w-none">{buscador}</div> : null}
      <div className="flex flex-col px-2 py-1">
        {visibles.length === 0 ? <p className="text-muted-foreground px-2 py-6 text-center text-sm">Nadie coincide.</p> : null}
        {visibles.map((grupo, i) => (
          <div key={grupo.titulo} className={cn("py-2", i > 0 && "border-t")}>
            <p className="text-muted-foreground flex justify-between px-2 pb-1.5 text-[11px] font-semibold tracking-wider uppercase">
              <span>{grupo.titulo}</span>
              <span className="font-mono">{grupo.filas.length}</span>
            </p>
            <ul className="flex flex-col gap-0.5">
              {grupo.filas.map((fila) => {
                const activa = ruta === fila.href.split("?")[0];
                return (
                  <li key={fila.href}>
                    <Enlace
                      href={fila.href}
                      aria-current={activa ? "page" : undefined}
                      className={cn(
                        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 overflow-hidden rounded-md px-2 py-2",
                        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                        activa ? "bg-primary/8" : "hover:bg-muted",
                      )}
                    >
                      <span className="min-w-0">
                        <span className={cn("line-clamp-2 text-[13px] leading-snug font-semibold", activa && "text-primary")}>
                          {fila.titulo}
                        </span>
                        {fila.detalle ? (
                          <span className="text-muted-foreground block truncate text-xs">{fila.detalle}</span>
                        ) : null}
                      </span>
                      {fila.monto ? (
                        <span className={cn("text-right font-mono text-xs font-semibold whitespace-nowrap", TONOS[fila.monto.tono ?? "neutro"])}>
                          {fila.monto.etiqueta ? (
                            <span className="text-muted-foreground block font-sans text-[11px] font-medium">{fila.monto.etiqueta}</span>
                          ) : null}
                          {fila.monto.texto}
                        </span>
                      ) : null}
                    </Enlace>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {pie ? <div className="text-muted-foreground border-t px-4 py-3 text-xs">{pie}</div> : null}
    </nav>
  );
}
