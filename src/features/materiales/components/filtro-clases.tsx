import Link from "next/link";

import { CLASES } from "@/features/materiales/textos";
import type { Clase } from "@/features/materiales/types";
import { cn } from "@/lib/utils";

export type FiltroInsumos = { clase: Clase | null; inactivos: boolean; buscar: string };

/** La URL de la lista con un filtro cambiado */
export function urlDeInsumos(filtro: FiltroInsumos, cambios: Partial<FiltroInsumos> = {}): string {
  const f = { ...filtro, ...cambios };
  const consulta = new URLSearchParams();
  if (f.clase) consulta.set("clase", f.clase);
  if (f.inactivos) consulta.set("estado", "inactivos");
  if (f.buscar) consulta.set("buscar", f.buscar);
  const texto = consulta.toString();
  return texto ? `/materiales?${texto}` : "/materiales";
}

/**
 * Pestañas por clase con su recuento (`materiales/52-brief-materiales` § 5), con la misma forma que las etapas de
 * `/proyectos`: fichas deslizables en el móvil, pestañas en el escritorio. El recuento lo da el servidor (`G-32`).
 */
export function FiltroClases({ filtro, recuento }: { filtro: FiltroInsumos; recuento: Record<Clase, number> }) {
  const todos = Object.values(recuento).reduce((a, b) => a + b, 0);
  const opciones = [
    { clave: "todos", etiqueta: "Todos", n: todos as number | null, href: urlDeInsumos(filtro, { clase: null }), activa: !filtro.clase },
    ...(Object.keys(CLASES) as Clase[]).map((clase) => ({
      clave: clase,
      etiqueta: CLASES[clase],
      n: recuento[clase] as number | null,
      href: urlDeInsumos(filtro, { clase }),
      activa: filtro.clase === clase,
    })),
  ];

  return (
    <nav aria-label="Filtrar por clase" className="-mx-4 flex flex-wrap items-center gap-2 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0">
      <ul className="flex w-max gap-2 md:w-auto md:flex-wrap md:gap-1 md:border-b">
        {opciones.map((o) => (
          <li key={o.clave}>
            <Link
              href={o.href}
              aria-current={o.activa ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-1.5 rounded-full border px-3 text-sm whitespace-nowrap transition-colors",
                "md:-mb-px md:h-9 md:rounded-none md:border-0 md:border-b-2 md:border-transparent md:px-3",
                o.activa
                  ? "border-primary bg-primary text-primary-foreground md:border-primary md:bg-transparent md:text-foreground md:font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {o.etiqueta}
              {o.n !== null ? <span className="font-mono text-xs tabular-nums opacity-80">{o.n}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
      {/* Lo inactivo no es una clase: es otro estado, y se pide aparte (decisión 46) */}
      <Link
        href={urlDeInsumos(filtro, { inactivos: !filtro.inactivos })}
        aria-pressed={filtro.inactivos}
        className={cn(
          "flex h-11 items-center rounded-full border px-3 text-sm whitespace-nowrap md:ml-auto md:h-8",
          filtro.inactivos ? "border-primary text-foreground font-medium" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {filtro.inactivos ? "Viendo inactivos" : "Ver inactivos"}
      </Link>
    </nav>
  );
}
