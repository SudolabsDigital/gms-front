import type { Metadata } from "next";
import { Layers, Tags } from "lucide-react";

import { Buscador } from "@/components/comunes/buscador";
import { Enlace } from "@/components/comunes/enlace";
import { Notificacion } from "@/components/comunes/notificacion";
import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { BarraDeContexto } from "@/components/erp/barra-de-contexto";
import { MarcoDeTrabajo } from "@/components/erp/marco-de-trabajo";
import { Button } from "@/components/ui/button";
import { EditarInsumo } from "@/features/materiales/components/editar-insumo";
import { FiltroClases, type FiltroInsumos, urlDeInsumos } from "@/features/materiales/components/filtro-clases";
import { ListaInsumos } from "@/features/materiales/components/lista-insumos";
import { CLASES } from "@/features/materiales/textos";
import type { Clase, ListaInsumos as Lista } from "@/features/materiales/types";
import { adelantar, apiGet } from "@/lib/api-server";
import { plural } from "@/lib/formato";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Materiales · GMS Integra",
};

type Parametros = Promise<{ [clave: string]: string | string[] | undefined }>;

function leerFiltro(crudo: Awaited<Parametros>): FiltroInsumos {
  const texto = (clave: string) => (typeof crudo[clave] === "string" ? (crudo[clave] as string) : "");
  const clase = texto("clase");
  return {
    clase: clase in CLASES ? (clase as Clase) : null,
    inactivos: texto("estado") === "inactivos",
    buscar: texto("buscar").trim().slice(0, 100),
  };
}

/**
 * El repositorio de materiales (`materiales/51-ui`, `52-brief-materiales`, MAE.4). Los filtros viven en la URL. Son 21
 * insumos: se piden hasta 100 de una vez y no hay paginación en pantalla; si un día pasan de 100, se añade.
 */
export default async function MaterialesPage({ searchParams }: { searchParams: Parametros }) {
  const filtro = leerFiltro(await searchParams);
  const consulta = urlDeInsumos(filtro).replace(/^\/materiales\??/, "");
  const peticion = adelantar(apiGet<Lista>(`/insumos?${consulta}${consulta ? "&" : ""}por_pagina=100`));

  const usuario = await exigirUsuario();
  const barra = <BarraDeContexto ruta={[{ etiqueta: "Materiales" }]} />;
  if (!puede(usuario, "catalogo:ver")) {
    return (
      <MarcoDeTrabajo barra={barra}>
        <SinAcceso que="materiales" />
      </MarcoDeTrabajo>
    );
  }

  const lista = await peticion;
  const sinPrecio = lista.meta.sin_precio ?? 0;
  const cargarPrecios = puede(usuario, "precios:actualizar");

  return (
    <MarcoDeTrabajo barra={barra}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:gap-5">
        <CabeceraDeSeccion
          titulo="Materiales"
          descripcion="Todo lo que se consume —perfiles, vidrios, accesorios, consumibles—, cuánto cuesta y dónde se usa."
          acciones={
            <>
              {/* Las familias con que se agrupa el consumo (MAE.6): se consultan con el mismo permiso que los insumos */}
              <Button asChild variant="ghost" className="h-11 md:h-9">
                <Enlace href="/materiales/familias">
                  <Layers className="size-4" />
                  Familias
                </Enlace>
              </Button>
              {cargarPrecios ? (
                <Button asChild variant="outline" className="h-11 md:h-9">
                  <Enlace href="/materiales/precios">
                    <Tags className="size-4" />
                    Cargar precios
                  </Enlace>
                </Button>
              ) : null}
              {puede(usuario, "catalogo:gestionar") ? <EditarInsumo /> : null}
            </>
          }
        />

        {sinPrecio > 0 && !filtro.inactivos ? (
          <Notificacion tono="advertencia" titulo={`${plural(sinPrecio, "insumo sin precio", "insumos sin precio")}`}>
            Se cotizan a S/ 0 en material: el costo sale incompleto.
            {cargarPrecios ? (
              <>
                {" "}
                <Enlace href="/materiales/precios" className="font-medium underline underline-offset-4">
                  Cargar la lista del proveedor
                </Enlace>
              </>
            ) : null}
          </Notificacion>
        ) : null}

        <Buscador
          accion="/materiales"
          id="buscar-insumos"
          etiqueta="Buscar insumos"
          placeholder="Código o nombre"
          valor={filtro.buscar}
          conservar={{ clase: filtro.clase, estado: filtro.inactivos ? "inactivos" : null }}
        />

        <FiltroClases filtro={filtro} recuento={lista.meta.recuento_por_clase} />

        {lista.datos.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            {filtro.buscar ? `Ningún insumo coincide con «${filtro.buscar}».` : filtro.inactivos ? "No hay insumos inactivos." : "No hay insumos en esta clase."}
          </p>
        ) : (
          <ListaInsumos filas={lista.datos} />
        )}
      </div>
    </MarcoDeTrabajo>
  );
}
