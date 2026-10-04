import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";

import { Buscador } from "@/components/comunes/buscador";
import { EmptyState } from "@/components/comunes/empty-state";
import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { BarraDeContexto } from "@/components/erp/barra-de-contexto";
import { MarcoDeTrabajo } from "@/components/erp/marco-de-trabajo";
import { AltaProyecto } from "@/features/proyectos/components/alta-proyecto";
import { FiltroEtapas, type FiltroLista, urlDeLista } from "@/features/proyectos/components/filtro-etapas";
import { ListaProyectos } from "@/features/proyectos/components/lista-proyectos";
import { ETAPAS } from "@/features/proyectos/textos";
import type { Etapa, ListaProyectos as Lista } from "@/features/proyectos/types";
import { adelantar, apiGet } from "@/lib/api-server";
import { moneda, plural } from "@/lib/formato";
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
    vista: vista === "cerrados" || vista === "por_cobrar" || vista === "todos" ? vista : "vivos",
    buscar: texto("buscar").trim().slice(0, 100),
    pagina: Math.max(1, Number.parseInt(texto("pagina"), 10) || 1),
  };
}

/**
 * En qué va cada trabajo (M5, `proyectos/51-ui` § `/proyectos`). Los filtros viven en la URL: se
 * pueden compartir, recargar y volver atrás sin perderlos, como en `/obras`.
 */
export default async function ProyectosPage({ searchParams }: { searchParams: Parametros }) {
  const filtro = leerFiltro(await searchParams);
  const consulta = urlDeLista(filtro).replace(/^\/proyectos\??/, "");
  const peticion = adelantar(apiGet<Lista>(`/proyectos?${consulta}${consulta ? "&" : ""}pagina=${filtro.pagina}`));

  const usuario = await exigirUsuario();
  const barra = <BarraDeContexto ruta={[{ etiqueta: "Proyectos" }]} />;

  if (!puede(usuario, "proyectos:ver")) {
    return (
      <MarcoDeTrabajo barra={barra}>
        <SinAcceso que="proyectos" />
      </MarcoDeTrabajo>
    );
  }

  const lista = await peticion;
  const puedeCrear = puede(usuario, "proyectos:crear");
  const hayAlgunProyecto = Object.values(lista.meta.recuento_por_etapa).some((n) => n > 0);

  return (
    <MarcoDeTrabajo barra={barra}>
      {/* Espacio abajo en el móvil: la barra fija de «Nuevo proyecto» no debe tapar la última tarjeta */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-24 md:gap-5 md:pb-0">
        <CabeceraDeSeccion
          titulo="Proyectos"
          descripcion="Cada trabajo, del primer mensaje del cliente a la entrega. La lista muestra lo que está en curso; lo cerrado está en su pestaña."
        />
        {/* En el escritorio, «Nuevo proyecto» está en la barra de contexto */}
        {puedeCrear ? <AltaProyecto disparador="movil" /> : null}

        {!hayAlgunProyecto && !filtro.buscar ? (
          <EmptyState
            icono={FolderKanban}
            titulo="Todavía no hay proyectos"
            descripcion="Registre el primero cuando llegue un lead: basta con el cliente, qué quiere y cómo llegó."
          />
        ) : (
          <>
            <Buscador
              accion="/proyectos"
              id="buscar-proyectos"
              etiqueta="Buscar proyectos"
              placeholder="Código, proyecto, cliente o teléfono"
              valor={filtro.buscar}
              conservar={{ etapa: filtro.etapa, vista: !filtro.etapa && filtro.vista !== "vivos" ? filtro.vista : null }}
            />

            <FiltroEtapas filtro={filtro} recuento={lista.meta.recuento_por_etapa} porVista={lista.meta.recuento_por_vista} />

            {/* La suma la da el servidor y solo a quien ve dinero (decisión 40): aquí no se suma nada (`G-32`) */}
            {!filtro.etapa && filtro.vista === "por_cobrar" && lista.meta.por_cobrar_total !== undefined ? (
              <p className="text-sm">
                Falta cobrar <b className="font-mono tabular-nums">{moneda(lista.meta.por_cobrar_total)}</b> en{" "}
                {plural(lista.meta.recuento_por_vista.por_cobrar, "proyecto", "proyectos")}.
              </p>
            ) : null}

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
    </MarcoDeTrabajo>
  );
}
