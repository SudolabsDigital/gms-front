"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Enlace } from "@/components/comunes/enlace";
import { InsigniaDeDato, type Dato } from "@/components/comunes/insignia-de-dato";
import { cn } from "@/lib/utils";

export type ItemDePanel = {
  href: string;
  etiqueta: string;
  /** Un elemento ya pintado (`<Ruler className="size-4" />`): de servidor a cliente no viaja un componente */
  icono?: ReactNode;
  dato?: Dato;
  /** Si la sección aún no se puede abrir, por qué: «al producir». Se ve inerte, nunca como un enlace que falla */
  inerte?: string;
};

export type GrupoDePanel = { titulo: string; items: ItemDePanel[] };

/**
 * Las secciones de un espacio, **por categorías** (SEC.9b, decisión 76; `componentes-del-armazon` § 5): cada grupo con
 * su rótulo y un filete entre grupos, cada sección con su dato. Vive en el panel del `MarcoDeTrabajo`, solo en el
 * escritorio; en el móvil las mismas secciones van en `PestanasDeSubruta`.
 *
 * Los enlaces llevan `prefetch`: Next 16 precarga la ruta dinámica entera (`02-components/link.md`), y cambiar de
 * sección no espera al servidor. Son pocos enlaces por espacio: el coste está acotado.
 */
export function PanelDeSeccion({ cabecera, grupos }: { cabecera?: ReactNode; grupos: GrupoDePanel[] }) {
  const ruta = usePathname();
  const visibles = grupos.filter((grupo) => grupo.items.length > 0);

  return (
    <nav aria-label="Secciones" className="flex flex-col">
      {cabecera ? <div className="border-b px-4 py-3">{cabecera}</div> : null}
      <div className="flex flex-col px-2 py-1">
        {visibles.map((grupo, i) => (
          <div key={grupo.titulo} className={cn("py-2", i > 0 && "border-t")}>
            <p className="text-muted-foreground px-2 pb-1.5 text-[11px] font-semibold tracking-wider uppercase">
              {grupo.titulo}
            </p>
            <ul className="flex flex-col gap-0.5">
              {grupo.items.map((item) => {
                const activo = ruta === item.href || ruta.startsWith(`${item.href}/`);
                const base = "flex h-9 items-center gap-2.5 rounded-md px-2 text-sm";
                const cuerpo = (
                  <>
                    {item.icono}
                    <span className="min-w-0 flex-1 truncate">{item.etiqueta}</span>
                    {item.inerte ? (
                      <span className="shrink-0 text-[11px]">{item.inerte}</span>
                    ) : item.dato ? (
                      <InsigniaDeDato dato={item.dato} />
                    ) : null}
                  </>
                );

                return (
                  <li key={item.href}>
                    {item.inerte ? (
                      <span aria-disabled className={cn(base, "text-muted-foreground/60 cursor-not-allowed")}>
                        {cuerpo}
                      </span>
                    ) : (
                      <Enlace
                        href={item.href}
                        prefetch
                        aria-current={activo ? "page" : undefined}
                        className={cn(
                          base,
                          "focus-visible:ring-ring overflow-hidden focus-visible:ring-2 focus-visible:outline-none",
                          activo ? "bg-primary/8 text-primary font-semibold" : "text-foreground hover:bg-muted",
                        )}
                      >
                        {cuerpo}
                      </Enlace>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
