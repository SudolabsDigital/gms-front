import type { Metadata } from "next";

import { PageHeader } from "@/components/comunes/page-header";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { RUTA_INICIO } from "@/components/erp/navegacion";
import { EditarFamilia } from "@/features/materiales/components/editar-familia";
import type { Material } from "@/features/materiales/types";
import type { Meta } from "@/features/proyectos/types";
import { adelantar, apiGet } from "@/lib/api-server";
import { plural } from "@/lib/formato";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Familias de material · GMS Integra",
};

/** Las familias de material (MAE.6, `materiales/52-brief-materiales` § 11): cinco filas, alta y edición en hoja */
export default async function FamiliasPage() {
  const peticion = adelantar(apiGet<{ datos: Material[]; meta: Meta }>("/materiales?por_pagina=100"));
  const usuario = await exigirUsuario();
  if (!puede(usuario, "catalogo:ver")) return <SinAcceso que="materiales" />;

  const familias = await peticion;
  const gestiona = puede(usuario, "catalogo:gestionar");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <PageHeader
        migas={[{ etiqueta: "Inicio", href: RUTA_INICIO }, { etiqueta: "Materiales", href: "/materiales" }, { etiqueta: "Familias" }]}
        titulo="Familias de material"
        descripcion="Aluminio, vidrio, acero…: agrupan los insumos para saber cuánto se consume de cada uno."
        acciones={gestiona ? <EditarFamilia /> : null}
      />

      <ul className="bg-card divide-y rounded-md border shadow-sm">
        {familias.datos.map((f) => (
          <li key={f.id} className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="min-w-0">
              <span className="font-mono text-sm font-semibold">{f.codigo}</span> <span className="font-medium">{f.nombre}</span>
              <span className="text-muted-foreground block text-xs">
                se consume en {f.unidad_consumo} · {plural(f.insumos, "insumo", "insumos")}
              </span>
            </span>
            {gestiona ? <EditarFamilia familia={f} /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
