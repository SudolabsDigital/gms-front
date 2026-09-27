import type { Metadata } from "next";
import { FolderKanban, Search } from "lucide-react";

import { EmptyState } from "@/components/comunes/empty-state";
import { FocoEnEscritorio } from "@/components/comunes/foco-en-escritorio";
import { PageHeader } from "@/components/comunes/page-header";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { RUTA_INICIO } from "@/components/erp/navegacion";
import { Input } from "@/components/ui/input";
import { AltaProyecto } from "@/features/proyectos/components/alta-proyecto";
import { FiltroEtapas, type FiltroLista, urlDeLista } from "@/features/proyectos/components/filtro-etapas";
import { ListaProyectos } from "@/features/proyectos/components/lista-proyectos";
import { ETAPAS } from "@/features/proyectos/textos";
import type { Etapa, ListaProyectos as Lista } from "@/features/proyectos/types";
import { apiGet } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Proyectos · GMS Integra",
};

type Parametros = Promise<{ [clave: string]: string | string[] | undefined }>;

/** Los filtros tal como llegan en la URL, reducidos a lo que la API acepta: lo demás se ignora */
function leerFiltro(crudo: Awaited<Parametros>): FiltroLista & { pagina: number } {
  const texto = (clave: string) => (typeof crudo[clave] === "string" ? (crudo[clave] as string) : "");
  const etapa = texto("etapa");
  const vista = texto("vista");

  return {
    etapa: etapa in ETAPAS ? (etapa as Etapa) : null,
    vista: vista === "cerrados" || vista === "todos" ? vista : "vivos",
    buscar: texto("buscar").trim().slice(0, 100),
    pagina: Math.max(1, Number.parseInt(texto("pagina"), 10) || 1),
  };
}

/**
 * En qué va cada trabajo (M5, `proyectos/51-ui` § `/proyectos`). Los filtros viven en la URL: se
 * pueden compartir, recargar y volver atrás sin perderlos, como en `/obras`.
 */
export default async function ProyectosPage({ searchParams }: { searchParams: Parametros }) {
  const usuario = await exigirUsuario();

  if (!puede(usuario, "proyectos:ver")) return <SinAcceso que="proyectos" />;

  const filtro = leerFiltro(await searchParams);
  const consulta = urlDeLista(filtro).replace(/^\/proyectos\??/, "");
  const lista = await apiGet<Lista>(`/proyectos?${consulta}${consulta ? "&" : ""}pagina=${filtro.pagina}`);
  const puedeCrear = puede(usuario, "proyectos:crear");
  const hayAlgunProyecto = Object.values(lista.meta.recuento_por_etapa).some((n) => n > 0);

  return (
    // Espacio abajo en el móvil: la barra fija de «Nuevo proyecto» no debe tapar la última tarjeta
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-24 md:gap-5 md:pb-0">
      <PageHeader
        migas={[{ etiqueta: "Inicio", href: RUTA_INICIO }, { etiqueta: "Proyectos" }]}
        titulo="Proyectos"
        descripcion="Cada trabajo, del primer mensaje del cliente a la entrega. La lista muestra lo que está en curso; lo cerrado está en su pestaña."
        acciones={puedeCrear ? <AltaProyecto /> : null}
      />

      {!hayAlgunProyecto && !filtro.buscar ? (
        <EmptyState
          icono={FolderKanban}
          titulo="Todavía no hay proyectos"
          descripcion="Registre el primero cuando llegue un lead: basta con el cliente, qué quiere y cómo llegó."
        />
      ) : (
        <>
          <form action="/proyectos" className="relative max-w-md" role="search">
            {filtro.etapa ? <input type="hidden" name="etapa" value={filtro.etapa} /> : null}
            {!filtro.etapa && filtro.vista !== "vivos" ? (
              <input type="hidden" name="vista" value={filtro.vista} />
            ) : null}
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              id="buscar-proyectos"
              type="search"
              name="buscar"
              defaultValue={filtro.buscar}
              placeholder="Código, proyecto, cliente o teléfono"
              aria-label="Buscar proyectos"
              className="h-11 pl-9 md:h-9"
            />
          </form>
          <FocoEnEscritorio id="buscar-proyectos" />

          <FiltroEtapas filtro={filtro} recuento={lista.meta.recuento_por_etapa} />

          {lista.datos.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              {filtro.buscar ? `Ningún proyecto coincide con «${filtro.buscar}».` : "No hay proyectos en esta vista."}
            </p>
          ) : (
            <ListaProyectos key={`${consulta}|${filtro.pagina}`} inicial={lista} consulta={consulta} />
          )}
        </>
      )}
    </div>
  );
}
