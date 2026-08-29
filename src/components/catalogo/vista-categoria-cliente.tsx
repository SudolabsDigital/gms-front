"use client";

import { useState, useMemo } from "react";
import type { CategoriaCatalogo, ItemCatalogo } from "@/lib/catalogo/esquema";
import { FiltroSubcategorias } from "./filtro-subcategorias";
import { GaleriaCatalogo } from "./galeria-catalogo";

export function VistaCategoriaCliente({
  categoria,
  items,
}: {
  categoria: CategoriaCatalogo;
  items: ItemCatalogo[];
}) {
  const [subcategoriaActiva, setSubcategoriaActiva] = useState<string>("todos");

  const itemsFiltrados = useMemo(() => {
    if (subcategoriaActiva === "todos") return items;
    return items.filter((i) => i.subcategoria === subcategoriaActiva);
  }, [items, subcategoriaActiva]);

  return (
    <div className="flex flex-col gap-8">
      {/* Filtro de Subcategorías / Series */}
      {categoria.subcategorias && categoria.subcategorias.length > 1 && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2.5">
            Filtrar por Línea / Serie
          </span>
          <FiltroSubcategorias
            subcategorias={categoria.subcategorias}
            activa={subcategoriaActiva}
            onSeleccionar={setSubcategoriaActiva}
            totalGeneral={items.length}
          />
        </div>
      )}

      {/* Galería Collage con Lightbox y Cotización */}
      <GaleriaCatalogo
        items={itemsFiltrados}
        categoriaNombre={categoria.nombre}
      />
    </div>
  );
}
