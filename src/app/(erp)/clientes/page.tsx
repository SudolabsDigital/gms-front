import type { Metadata } from "next";

import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { BarraDeContexto } from "@/components/erp/barra-de-contexto";
import { MarcoDeTrabajo } from "@/components/erp/marco-de-trabajo";
import { PanelDeClientes, rutaDelPanelDeClientes } from "@/features/clientes/components/panel-de-clientes";
import { PortadaDeClientes } from "@/features/clientes/components/portada-de-clientes";
import type { ListaClientesConRecuento, ResumenDeClientes } from "@/features/clientes/types";
import { AltaProyecto } from "@/features/proyectos/components/alta-proyecto";
import { adelantar, apiGet } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Clientes · GMS Integra",
};

type Parametros = Promise<{ [clave: string]: string | string[] | undefined }>;

/**
 * La portada de Clientes (SEC.10, decisión 78): un espacio como la obra —la barra, la lista en el panel y, en el
 * centro, lo que la lista no dice—. La tabla que había aquí sobraba: el panel encuentra a cualquiera igual y se queda
 * al abrir su ficha. Encontrar sigue siendo la acción principal (`52-brief-clientes` § 2): el buscador del panel toma
 * el foco en el escritorio y, en el móvil, el panel va antes que la portada. Sin «Nuevo cliente»: nacen con su
 * proyecto (decisión 50).
 */
export default async function ClientesPage({ searchParams }: { searchParams: Parametros }) {
  const crudo = await searchParams;
  const buscar = typeof crudo.buscar === "string" ? crudo.buscar.trim().slice(0, 100) : "";

  const peticionLista = adelantar(apiGet<ListaClientesConRecuento>(rutaDelPanelDeClientes(buscar)));
  const peticionResumen = adelantar(apiGet<ResumenDeClientes>("/clientes/resumen"));

  const usuario = await exigirUsuario();
  const barra = <BarraDeContexto ruta={[{ etiqueta: "Clientes" }]} />;
  if (!puede(usuario, "proyectos:ver")) {
    return (
      <MarcoDeTrabajo barra={barra}>
        <SinAcceso que="clientes" />
      </MarcoDeTrabajo>
    );
  }

  const [lista, resumen] = await Promise.all([peticionLista, peticionResumen]);

  return (
    <MarcoDeTrabajo
      barra={barra}
      panel={<PanelDeClientes lista={lista} buscar={buscar} accion="/clientes" enfocar />}
      panelAncho
      panelEnMovil
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 md:gap-5">
        <CabeceraDeSeccion
          titulo="Clientes"
          descripcion="A quién se le ha hecho o se le está haciendo un trabajo: sus datos, sus proyectos y lo que debe."
        />

        {resumen.total === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-3 py-8 text-center text-sm">
            <p>Todavía no hay clientes. Nacen al crear un proyecto.</p>
            {puede(usuario, "proyectos:crear") ? <AltaProyecto /> : null}
          </div>
        ) : (
          <PortadaDeClientes resumen={resumen} />
        )}
      </div>
    </MarcoDeTrabajo>
  );
}
