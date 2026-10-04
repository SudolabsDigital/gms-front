import type { Metadata } from "next";

import { PageHeader } from "@/components/comunes/page-header";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { RUTA_INICIO } from "@/components/erp/navegacion";
import { CargarPrecios } from "@/features/materiales/components/cargar-precios";
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
  // Cambiar precios y ver dinero van juntos: sin `costeo:ver` no hay precio actual que comparar
  if (!puede(usuario, "precios:actualizar") || !puede(usuario, "costeo:ver")) return <SinAcceso que="los precios" />;

  const lista = await peticion;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <PageHeader
        migas={[{ etiqueta: "Inicio", href: RUTA_INICIO }, { etiqueta: "Materiales", href: "/materiales" }, { etiqueta: "Cargar precios" }]}
        titulo="Cargar precios"
        descripcion="Escriba solo los que cambian. Se guardan juntos: o todos o ninguno. Las cotizaciones emitidas que los usan quedan marcadas como desactualizadas."
      />
      <CargarPrecios insumos={lista.datos} />
    </div>
  );
}
