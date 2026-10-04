import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { CotizacionBorrador } from "@/features/proyectos/components/cotizacion-borrador";
import { CotizacionEmitida } from "@/features/proyectos/components/cotizacion-emitida";
import { CotizarProyecto } from "@/features/proyectos/components/cotizar-proyecto";
import { Pendiente } from "@/features/proyectos/components/pendiente";
import { SelectorDeVersiones } from "@/features/proyectos/components/selector-de-versiones";
import { leerDocumento, leerObra } from "@/features/proyectos/datos";
import { adelantar } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Cotización · Proyecto · GMS Integra",
};

type Parametros = Promise<{ [clave: string]: string | string[] | undefined }>;

/**
 * La cotización de la obra (SEC.9b): el borrador o la versión emitida, con sus versiones. `?version=` abre una emitida
 * concreta (B.3); sin él, el borrador o, si no hay, la vigente (B.2). Los documentos se piden a la vez (SEC.5), y el
 * borrador es el mismo que lee el riel del layout: `cache` lo sirve una vez.
 */
export default async function CotizacionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Parametros }) {
  const { id } = await params;
  const peticion = adelantar(leerObra(id));

  const usuario = await exigirUsuario();
  // El layout ya dice «sin acceso» y no pinta la sección
  if (!puede(usuario, "proyectos:ver")) return null;

  const [proyecto, parametros] = await Promise.all([peticion, searchParams]);

  const idBorrador = proyecto.versiones.find((v) => v.estado === "borrador")?.id;
  const pedida = proyecto.versiones.find((v) => v.estado !== "borrador" && String(v.version) === parametros.version);
  const verEmitida = pedida ?? (!idBorrador ? proyecto.vigente : null);
  const [borrador, emitida] = await Promise.all([
    idBorrador ? leerDocumento(idBorrador) : null,
    verEmitida ? leerDocumento(verEmitida.id) : null,
  ]);
  const mostrada = emitida ?? borrador;
  // Recotizando: a qué vigente sustituirá el borrador al emitirse, y si estaba aprobada (B.3)
  const sustituye =
    borrador && proyecto.vigente
      ? { version: proyecto.vigente.version, aprobada: proyecto.vigente.estado === "aprobada" }
      : null;
  const puedeCotizar = puede(usuario, "cotizaciones:crear");
  const cerrado = proyecto.etapa === "perdido" || proyecto.etapa === "anulado";

  return (
    <>
      <CabeceraDeSeccion
        titulo="Cotización"
        descripcion="Las versiones del documento: la vigente es la que vale para el cliente."
      />
      {mostrada ? (
        <div className="flex flex-col gap-4">
          <SelectorDeVersiones proyectoId={proyecto.id} versiones={proyecto.versiones} elegida={mostrada.version} />
          {emitida ? (
            <CotizacionEmitida cotizacion={emitida} cliente={proyecto.cliente} sustituidaPor={pedida?.sustituida_por ?? null} />
          ) : borrador ? (
            <CotizacionBorrador
              cotizacion={borrador}
              puedeEditar={puedeCotizar}
              puedeEmitir={puede(usuario, "cotizaciones:emitir")}
              sustituye={sustituye}
            />
          ) : null}
        </div>
      ) : (
        <Pendiente icono={FileText} titulo="Cotización">
          {cerrado ? (
            "El proyecto se cerró sin cotización."
          ) : proyecto.etapa === "lead" && puedeCotizar ? (
            <div className="flex flex-col items-start gap-3">
              <p>
                Todavía no hay cotización. Se arma en el cotizador: cada ventana se calcula y se agrega al proyecto con su
                cantidad y dónde va.
              </p>
              <CotizarProyecto proyectoId={proyecto.id} className="h-11 md:h-9" />
            </div>
          ) : (
            "Todavía no hay cotización."
          )}
        </Pendiente>
      )}
    </>
  );
}
