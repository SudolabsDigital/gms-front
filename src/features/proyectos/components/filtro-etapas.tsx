import Link from "next/link";

import { ETAPAS, ETAPAS_CERRADAS, ETAPAS_EN_CURSO } from "@/features/proyectos/textos";
import type { Etapa } from "@/features/proyectos/types";
import { cn } from "@/lib/utils";

export type FiltroLista = { vista: "vivos" | "cerrados" | "todos"; etapa: Etapa | null; buscar: string };

/** La URL de la lista con un filtro cambiado. La página se resetea: otro filtro, otra primera página. */
export function urlDeLista(filtro: FiltroLista, cambios: Partial<FiltroLista> = {}): string {
  const f = { ...filtro, ...cambios };
  const consulta = new URLSearchParams();

  if (f.etapa) consulta.set("etapa", f.etapa);
  else if (f.vista !== "vivos") consulta.set("vista", f.vista);
  if (f.buscar) consulta.set("buscar", f.buscar);

  const texto = consulta.toString();
  return texto ? `/proyectos?${texto}` : "/proyectos";
}

/**
 * Fichas por etapa con su recuento (`proyectos/51-ui` § lista): deslizables en el móvil, una fila de
 * pestañas en el escritorio. El recuento viene del servidor (`meta.recuento_por_etapa`), con la misma
 * búsqueda aplicada. «En curso» es la vista por omisión: la lista es de trabajo vivo.
 */
export function FiltroEtapas({ filtro, recuento }: { filtro: FiltroLista; recuento: Record<Etapa, number> }) {
  const suma = (etapas: Etapa[]) => etapas.reduce((total, e) => total + (recuento[e] ?? 0), 0);

  const opciones: { clave: string; etiqueta: string; n: number; href: string; activa: boolean }[] = [
    {
      clave: "vivos",
      etiqueta: "En curso",
      n: suma(ETAPAS_EN_CURSO),
      href: urlDeLista(filtro, { vista: "vivos", etapa: null }),
      activa: !filtro.etapa && filtro.vista === "vivos",
    },
    ...ETAPAS_EN_CURSO.map((etapa) => ({
      clave: etapa,
      etiqueta: ETAPAS[etapa],
      n: recuento[etapa] ?? 0,
      href: urlDeLista(filtro, { etapa }),
      activa: filtro.etapa === etapa,
    })),
    {
      clave: "cerrados",
      etiqueta: "Cerrados",
      n: suma(ETAPAS_CERRADAS),
      href: urlDeLista(filtro, { vista: "cerrados", etapa: null }),
      activa: !filtro.etapa && filtro.vista === "cerrados",
    },
  ];

  return (
    // En el escritorio las pestañas se envuelven y no hace falta desplazar: sin `overflow-visible`, el
    // `-mb-px` de la pestaña activa sobresale una fracción de píxel con zoom (112,5 %) y aparece una
    // barra vertical (medido en el recorrido de la sesión 24)
    <nav aria-label="Filtrar por etapa" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0">
      <ul className="flex w-max gap-2 md:w-auto md:flex-wrap md:gap-1 md:border-b">
        {opciones.map((opcion) => (
          <li key={opcion.clave}>
            <Link
              href={opcion.href}
              aria-current={opcion.activa ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-1.5 rounded-full border px-3 text-sm whitespace-nowrap transition-colors",
                "md:-mb-px md:h-9 md:rounded-none md:border-0 md:border-b-2 md:border-transparent md:px-3",
                opcion.activa
                  ? "border-primary bg-primary text-primary-foreground md:border-primary md:bg-transparent md:text-foreground md:font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opcion.etiqueta}
              <span className="font-mono text-xs tabular-nums opacity-80">{opcion.n}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
