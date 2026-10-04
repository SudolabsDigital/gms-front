import { Enlace } from "@/components/comunes/enlace";
import { FiltroConRecuento, type OpcionDeFiltro } from "@/components/comunes/filtro-con-recuento";
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
 * Las clases de la lista, con su recuento (`materiales/52-brief-materiales` § 5), dibujadas por `FiltroConRecuento`
 * como las etapas de `/proyectos`. El recuento lo da el servidor (`G-32`).
 */
export function FiltroClases({ filtro, recuento }: { filtro: FiltroInsumos; recuento: Record<Clase, number> }) {
  const todos = Object.values(recuento).reduce((a, b) => a + b, 0);
  const opciones: OpcionDeFiltro[] = [
    { clave: "todos", etiqueta: "Todos", recuento: todos, href: urlDeInsumos(filtro, { clase: null }), activa: !filtro.clase },
    ...(Object.keys(CLASES) as Clase[]).map((clase) => ({
      clave: clase,
      etiqueta: CLASES[clase],
      recuento: recuento[clase],
      href: urlDeInsumos(filtro, { clase }),
      activa: filtro.clase === clase,
    })),
  ];

  return (
    <FiltroConRecuento
      etiqueta="Filtrar por clase"
      opciones={opciones}
      extremo={
        // Lo inactivo no es una clase: es otro estado, y se pide aparte (decisión 46)
        <Enlace
          href={urlDeInsumos(filtro, { inactivos: !filtro.inactivos })}
          aria-pressed={filtro.inactivos}
          className={cn(
            "flex h-11 items-center rounded-full border px-3 text-sm whitespace-nowrap md:ml-auto md:h-8",
            filtro.inactivos ? "border-primary text-foreground font-medium" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {filtro.inactivos ? "Viendo inactivos" : "Ver inactivos"}
        </Enlace>
      }
    />
  );
}
