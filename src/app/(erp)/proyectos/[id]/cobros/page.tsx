import type { Metadata } from "next";

import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { CobrosProyecto } from "@/features/proyectos/components/cobros-proyecto";
import { leerObra } from "@/features/proyectos/datos";
import { adelantar } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Cobros · Proyecto · GMS Integra",
};

/** Los cobros de la obra (SEC.9b, C.1): lo que el cliente pagó y lo que falta. Solo el proyecto, ya leído (`cache`) */
export default async function CobrosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const peticion = adelantar(leerObra(id));

  const usuario = await exigirUsuario();
  // El layout ya dice «sin acceso» y no pinta la sección
  if (!puede(usuario, "proyectos:ver")) return null;

  const proyecto = await peticion;

  return (
    <>
      <CabeceraDeSeccion titulo="Cobros" descripcion="Lo que el cliente pagó y lo que falta cobrar." />
      <CobrosProyecto
        proyecto={proyecto}
        puedeRegistrar={puede(usuario, "cobros:registrar")}
        puedeAnular={puede(usuario, "cobros:anular")}
      />
    </>
  );
}
