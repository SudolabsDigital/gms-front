import type { Metadata } from "next";
import { Ruler } from "lucide-react";

import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { MedicionEnObra } from "@/features/proyectos/components/medicion-en-obra";
import { Pendiente } from "@/features/proyectos/components/pendiente";
import { leerDocumento, leerObra } from "@/features/proyectos/datos";
import { adelantar } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Medición · Proyecto · GMS Integra",
};

/**
 * La medición en obra (SEC.9b; en la URL `obra`, como decían los enlaces con `?pestana=obra`). Se mide la vigente
 * (C.2): desde que se aprueba, o para enseñar la última medición después.
 */
export default async function MedicionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const peticion = adelantar(leerObra(id));

  const usuario = await exigirUsuario();
  // El layout ya dice «sin acceso» y no pinta la sección
  if (!puede(usuario, "proyectos:ver")) return null;

  const proyecto = await peticion;
  const seMide = proyecto.vigente && (proyecto.etapa === "aprobado" || proyecto.medicion !== null) ? proyecto.vigente : null;
  const vigente = seMide ? await leerDocumento(seMide.id) : null;
  const cerrado = proyecto.etapa === "perdido" || proyecto.etapa === "anulado";

  return (
    <>
      <CabeceraDeSeccion titulo="Medición" descripcion="Las cotas de la obra, confirmadas en el sitio antes de cortar." />
      {vigente ? (
        // `key`: si la vigente cambia —recotizar y aprobar otra—, el formulario vuelve a partir de sus cotas
        <MedicionEnObra
          key={vigente.id}
          proyecto={proyecto}
          vigente={vigente}
          puedeMedir={puede(usuario, "medicion:registrar")}
          puedeRecotizar={puede(usuario, "cotizaciones:crear")}
        />
      ) : (
        <Pendiente icono={Ruler} titulo="Medición en obra">
          {cerrado
            ? "El proyecto se cerró antes de medir en obra."
            : "Se mide en obra cuando el cliente aprueba la cotización: antes de cortar, cada cota se confirma en el sitio."}
        </Pendiente>
      )}
    </>
  );
}
