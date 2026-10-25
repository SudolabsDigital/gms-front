import type { Metadata } from "next";

import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatosProyecto } from "@/features/proyectos/components/datos-proyecto";
import { EditarProyecto } from "@/features/proyectos/components/editar-proyecto";
import { leerObra } from "@/features/proyectos/datos";
import { culminado, QUE_FALTA } from "@/features/proyectos/textos";
import { adelantar } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Resumen · Proyecto · GMS Integra",
};

/**
 * Resumen de la obra (SEC.9b): qué falta para cerrarla y sus datos, que aquí se editan. Lo común —barra, panel y
 * riel— lo pinta el layout de la obra; esta sección solo pide lo suyo, que es el proyecto ya leído (`cache`).
 */
export default async function ResumenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const peticion = adelantar(leerObra(id));

  const usuario = await exigirUsuario();
  // El layout ya dice «sin acceso» y no pinta la sección
  if (!puede(usuario, "proyectos:ver")) return null;

  const proyecto = await peticion;
  // Culminado lo decide el servidor, que también cuenta la garantía: la pantalla no compara saldos (decisión 41)
  const queFalta = proyecto.garantia_hasta ? culminado(proyecto.garantia_hasta) : QUE_FALTA[proyecto.etapa];

  return (
    <>
      <CabeceraDeSeccion
        titulo="Resumen"
        descripcion="Qué falta para cerrar la obra y sus datos."
        acciones={puede(usuario, "proyectos:crear") ? <EditarProyecto proyecto={proyecto} /> : null}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Qué falta</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">{queFalta}</CardContent>
      </Card>
      <DatosProyecto proyecto={proyecto} />
    </>
  );
}
