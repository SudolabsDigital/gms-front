import { PestanasConCifra, type OpcionConCifra } from "@/components/comunes/pestanas-con-cifra";
import { ETAPAS, ETAPAS_EN_CURSO } from "@/features/proyectos/textos";
import type { Etapa } from "@/features/proyectos/types";
import { moneda } from "@/lib/formato";

export type FiltroLista = { vista: "vivos" | "cerrados" | "por_cobrar" | "todos"; etapa: Etapa | null; buscar: string };

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
 * Las etapas y vistas de la lista, con su recuento (`proyectos/51-ui` § lista), dibujadas por `PestanasConCifra`
 * (SEC.9c). El recuento viene del servidor (`meta.recuento_por_etapa` y `recuento_por_vista`), con la misma búsqueda
 * aplicada, y el importe de «Por cobrar» también (`por_cobrar_total`, solo a quien ve dinero): aquí no se suma nada.
 * «En curso» es la vista por omisión: la lista es de trabajo vivo.
 */
export function FiltroEtapas({
  filtro,
  recuento,
  porVista,
  porCobrarTotal,
}: {
  filtro: FiltroLista;
  recuento: Record<Etapa, number>;
  /** Las vistas las cuenta el servidor: «Cerrados» ya no es la suma de sus etapas (decisión 40) */
  porVista: Record<"vivos" | "cerrados" | "por_cobrar", number>;
  /** La suma de los saldos de «Por cobrar», del servidor. Sin `costeo:ver` no viaja (`CAL-04`) */
  porCobrarTotal?: number;
}) {
  const opciones: OpcionConCifra[] = [
    {
      clave: "vivos",
      etiqueta: "En curso",
      cifra: porVista.vivos,
      href: urlDeLista(filtro, { vista: "vivos", etapa: null }),
      activa: !filtro.etapa && filtro.vista === "vivos",
    },
    ...ETAPAS_EN_CURSO.map((etapa) => ({
      clave: etapa,
      etiqueta: ETAPAS[etapa],
      cifra: recuento[etapa] ?? 0,
      href: urlDeLista(filtro, { etapa }),
      activa: filtro.etapa === etapa,
    })),
    // El dinero pendiente, en cualquier etapa desde aprobado: antes, un entregado con saldo se iba a «Cerrados» (R14)
    {
      clave: "por_cobrar",
      etiqueta: "Por cobrar",
      cifra: porVista.por_cobrar,
      detalle: porCobrarTotal !== undefined && porVista.por_cobrar > 0 ? moneda(porCobrarTotal) : undefined,
      tono: porVista.por_cobrar > 0 ? "aviso" : undefined,
      href: urlDeLista(filtro, { vista: "por_cobrar", etapa: null }),
      activa: !filtro.etapa && filtro.vista === "por_cobrar",
    },
    {
      clave: "cerrados",
      etiqueta: "Cerrados",
      cifra: porVista.cerrados,
      href: urlDeLista(filtro, { vista: "cerrados", etapa: null }),
      activa: !filtro.etapa && filtro.vista === "cerrados",
    },
  ];

  return <PestanasConCifra etiqueta="Filtrar por etapa" opciones={opciones} />;
}
