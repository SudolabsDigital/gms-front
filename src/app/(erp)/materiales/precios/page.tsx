import type { Metadata } from "next";

import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { PestanasDeSubruta } from "@/components/comunes/pestanas-de-subruta";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { BarraDeContexto } from "@/components/erp/barra-de-contexto";
import { MarcoDeTrabajo } from "@/components/erp/marco-de-trabajo";
import { CargarPrecios } from "@/features/materiales/components/cargar-precios";
import { subrutasDeMateriales } from "@/features/materiales/subrutas";
import type { ListaInsumos } from "@/features/materiales/types";
import { adelantar, apiGet } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Cargar precios · GMS Integra",
};

/** La lista del proveedor (`materiales/52-brief-materiales`): los insumos activos, con su precio para cambiarlo en lote */
export default async function CargarPreciosPage() {
  const peticion = adelantar(apiGet<ListaInsumos>("/insumos?por_pagina=100"));
  const usuario = await exigirUsuario();
  const barra = <BarraDeContexto ruta={[{ etiqueta: "Materiales", href: "/materiales" }, { etiqueta: "Cargar precios" }]} />;
  // Cambiar precios y ver dinero van juntos: sin `costeo:ver` no hay precio actual que comparar
  if (!puede(usuario, "precios:actualizar") || !puede(usuario, "costeo:ver")) {
    return (
      <MarcoDeTrabajo barra={barra}>
        <SinAcceso que="los precios" />
      </MarcoDeTrabajo>
    );
  }

  const lista = await peticion;

  return (
    <MarcoDeTrabajo barra={barra}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <CabeceraDeSeccion
          titulo="Cargar precios"
          descripcion="Escriba solo los que cambian. Se guardan juntos: o todos o ninguno. Las cotizaciones emitidas que los usan quedan marcadas como desactualizadas."
        />
        <PestanasDeSubruta etiqueta="Apartados de materiales" opciones={subrutasDeMateriales(usuario)} />
        <CargarPrecios insumos={lista.datos} />
      </div>
    </MarcoDeTrabajo>
  );
}
