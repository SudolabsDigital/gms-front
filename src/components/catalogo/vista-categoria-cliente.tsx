"use client";

import { Suspense, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CategoriaCatalogo, ItemCatalogo } from "@/lib/catalogo/esquema";
import { FiltroSubcategorias } from "./filtro-subcategorias";
import { GaleriaCatalogo } from "./galeria-catalogo";

interface PropsVista {
  categoria: CategoriaCatalogo;
  items: ItemCatalogo[];
}

/**
 * EL FILTRO VIVE EN LA URL: `/catalogo/ventanas?serie=serie-20`.
 *
 * Hasta el 2026-09-12 vivía en un `useState`, así que ningún enlace podía llegar a una vista ya
 * filtrada, y el megamenú del header necesita abrir «Ventanas · Serie 20» con el filtro puesto. El
 * parámetro lleva el slug PÚBLICO de la serie (`taxonomia-publica.json`), nunca el de la carpeta.
 *
 * La página es estática, y `useSearchParams` obliga a un límite de `Suspense`: sin él, el build de
 * producción falla. Su `fallback` —la galería completa— es lo que va en el HTML prerenderado, así
 * que el HTML sigue teniendo todas las fotos. Quien entra en frío con `?serie=` ve la galería
 * completa hasta que hidrata; quien llega navegando dentro del sitio la recibe ya filtrada.
 *
 * La canónica de la página no lleva parámetros: las vistas filtradas no compiten con ella.
 */
export function VistaCategoriaCliente(props: PropsVista) {
  return (
    <Suspense fallback={<Vista {...props} serieActiva="todos" />}>
      <VistaConUrl {...props} />
    </Suspense>
  );
}

function VistaConUrl({ categoria, items }: PropsVista) {
  const router = useRouter();
  const pathname = usePathname();
  const parametros = useSearchParams();

  const pedida = parametros.get("serie");
  // Un slug que no existe en esta categoría no deja la galería vacía: muestra todas las fotos.
  const serieActiva =
    pedida && categoria.subcategorias.some((s) => s.slug === pedida) ? pedida : "todos";

  const seleccionar = useCallback(
    (slug: string) => {
      const nuevos = new URLSearchParams(parametros.toString());
      if (slug === "todos") nuevos.delete("serie");
      else nuevos.set("serie", slug);
      const consulta = nuevos.toString();
      // `replace` y no `push`: cambiar de serie no es navegar, y «atrás» debe volver a la página anterior.
      router.replace(consulta ? `${pathname}?${consulta}` : pathname, { scroll: false });
    },
    [parametros, pathname, router],
  );

  return (
    <Vista categoria={categoria} items={items} serieActiva={serieActiva} onSeleccionar={seleccionar} />
  );
}

function Vista({
  categoria,
  items,
  serieActiva,
  onSeleccionar,
}: PropsVista & { serieActiva: string; onSeleccionar?: (slug: string) => void }) {
  const itemsFiltrados = useMemo(() => {
    if (serieActiva === "todos") return items;
    return items.filter((i) => i.subcategoria === serieActiva);
  }, [items, serieActiva]);

  return (
    <div className="flex flex-col gap-8">
      {/* Filtro de series */}
      {categoria.subcategorias && categoria.subcategorias.length > 1 && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2.5">
            Filtrar por Línea / Serie
          </span>
          <FiltroSubcategorias
            subcategorias={categoria.subcategorias}
            activa={serieActiva}
            onSeleccionar={onSeleccionar ?? (() => {})}
            totalGeneral={items.length}
          />
        </div>
      )}

      {/* Galería Collage con Lightbox y Cotización */}
      <GaleriaCatalogo items={itemsFiltrados} categoriaNombre={categoria.nombre} />
    </div>
  );
}
