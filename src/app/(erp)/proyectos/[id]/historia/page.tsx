import type { Metadata } from "next";

import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { Card, CardContent } from "@/components/ui/card";
import { HistoriaProyecto } from "@/features/proyectos/components/historia-proyecto";
import { leerObra } from "@/features/proyectos/datos";
import { adelantar } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Historia · Proyecto · GMS Integra",
};

/** La historia de la obra (SEC.9b): cada cosa que pasó, con su fecha. Viene dentro del proyecto, ya leído (`cache`) */
export default async function HistoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const peticion = adelantar(leerObra(id));

  const usuario = await exigirUsuario();
  // El layout ya dice «sin acceso» y no pinta la sección
  if (!puede(usuario, "proyectos:ver")) return null;

  const proyecto = await peticion;

  return (
    <>
      <CabeceraDeSeccion titulo="Historia" descripcion="Todo lo que pasó en la obra, con su fecha." />
      <Card>
        <CardContent className="pt-6">
          <HistoriaProyecto eventos={proyecto.historia} />
        </CardContent>
      </Card>
    </>
  );
}
