import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileText, MessageCircle, Phone, Ruler, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/comunes/page-header";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { RUTA_INICIO } from "@/components/erp/navegacion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { enlaceParaEscribirA } from "@/config/site-config";
import { AccionesEtapa } from "@/features/proyectos/components/acciones-etapa";
import { CotizacionBorrador } from "@/features/proyectos/components/cotizacion-borrador";
import { CotizacionEmitida } from "@/features/proyectos/components/cotizacion-emitida";
import { CotizarProyecto } from "@/features/proyectos/components/cotizar-proyecto";
import { DatosProyecto } from "@/features/proyectos/components/datos-proyecto";
import { EditarProyecto } from "@/features/proyectos/components/editar-proyecto";
import { HistoriaProyecto } from "@/features/proyectos/components/historia-proyecto";
import { LineaDeEtapas } from "@/features/proyectos/components/linea-de-etapas";
import { PestanasFicha } from "@/features/proyectos/components/pestanas-ficha";
import { SelectorDeVersiones } from "@/features/proyectos/components/selector-de-versiones";
import { pestanaInicial } from "@/features/proyectos/pestanas";
import { ETAPAS, QUE_FALTA } from "@/features/proyectos/textos";
import type { Cotizacion, ProyectoFicha } from "@/features/proyectos/types";
import { ApiError, apiGet } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Proyecto · GMS Integra",
};

type Parametros = Promise<{ [clave: string]: string | string[] | undefined }>;

/** Lo que aún no existe se ve rotulado, sin fingir que funciona (`51-ui`) */
function Pendiente({ icono: Icono, titulo, children }: { icono: LucideIcon; titulo: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icono className="size-4" />
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">{children}</CardContent>
    </Card>
  );
}

/**
 * La ficha del proyecto (`proyectos/51-ui` § la ficha, decisión 23 y su brief `proyectos/52-brief-ficha`).
 *
 * De arriba abajo: la cabecera con el contacto, la **línea de etapas** —en qué va, desde cuándo, cuánto— y las
 * **pestañas por asunto**, que abren en la que pide la etapa (`?pestana=` manda si viene). En el escritorio, la
 * acción de la etapa vive en un riel a la derecha; en el móvil, en la barra fija, y el resto de acciones debajo
 * del contenido.
 */
export default async function FichaProyectoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Parametros;
}) {
  const usuario = await exigirUsuario();

  if (!puede(usuario, "proyectos:ver")) return <SinAcceso que="proyectos" />;

  const { id } = await params;
  let proyecto: ProyectoFicha;

  try {
    proyecto = await apiGet<ProyectoFicha>(`/proyectos/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const parametros = await searchParams;
  const leerDocumento = (idDocumento: string) => apiGet<Cotizacion>(`/cotizaciones/${encodeURIComponent(idDocumento)}`);

  // El borrador se lee entero aquí, en el mismo render: cambiar de pestaña sigue siendo instantáneo
  const idBorrador = proyecto.versiones.find((v) => v.estado === "borrador")?.id;
  const borrador = idBorrador ? await leerDocumento(idBorrador) : null;
  // `?version=` abre una versión emitida concreta (B.3); sin él, el borrador o, si no hay, la vigente (B.2)
  const pedida = proyecto.versiones.find((v) => v.estado !== "borrador" && String(v.version) === parametros.version);
  const verEmitida = pedida ?? (!borrador ? proyecto.vigente : null);
  const emitida = verEmitida ? await leerDocumento(verEmitida.id) : null;
  const mostrada = emitida ?? borrador;
  // Recotizando: a qué vigente sustituirá el borrador al emitirse, y si estaba aprobada (B.3)
  const sustituye = borrador && proyecto.vigente
    ? { version: proyecto.vigente.version, aprobada: proyecto.vigente.estado === "aprobada" }
    : null;
  const puedeCotizar = puede(usuario, "cotizaciones:crear");
  const puedeEmitir = puede(usuario, "cotizaciones:emitir");

  const crudo = parametros.pestana;
  const inicial = pestanaInicial(typeof crudo === "string" ? crudo : undefined, proyecto.etapa);

  const whatsapp = enlaceParaEscribirA(proyecto.cliente.telefono);
  const telefono = proyecto.cliente.telefono?.replace(/[^\d+]/g, "");
  const cerrado = proyecto.etapa === "perdido" || proyecto.etapa === "anulado";
  // Sin `costeo:ver` la clave `saldo` no viaja (`CAL-04`): entonces la línea no habla de dinero
  const veDinero = "saldo" in proyecto;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-28 md:pb-0">
      <PageHeader
        migas={[
          { etiqueta: "Inicio", href: RUTA_INICIO },
          { etiqueta: "Proyectos", href: "/proyectos" },
          { etiqueta: proyecto.codigo },
        ]}
        titulo={proyecto.nombre}
        descripcion={`${proyecto.codigo} · ${proyecto.cliente.nombre}`}
        acciones={
          <>
            {whatsapp ? (
              <Button asChild variant="outline" className="text-whatsapp h-11 md:h-8">
                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
              </Button>
            ) : null}
            {telefono ? (
              <Button asChild variant="outline" className="h-11 md:hidden">
                <a href={`tel:${telefono}`}>
                  <Phone className="size-4" />
                  Llamar
                </a>
              </Button>
            ) : null}
            {puede(usuario, "proyectos:crear") ? <EditarProyecto proyecto={proyecto} /> : null}
          </>
        }
      />

      <LineaDeEtapas
        etapa={proyecto.etapa}
        etapaDesde={proyecto.etapa_desde}
        creado={proyecto.created_at}
        historia={proyecto.historia}
        total={veDinero ? (proyecto.vigente?.total ?? null) : undefined}
        saldo={veDinero ? proyecto.saldo : undefined}
        borrador={borrador?.version ?? null}
      />

      <div className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1fr)_20rem] md:items-start lg:grid-cols-[minmax(0,1fr)_24rem]">
        <PestanasFicha
          inicial={inicial}
          paneles={{
            resumen: (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Qué falta</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">{QUE_FALTA[proyecto.etapa]}</CardContent>
                </Card>
                <DatosProyecto proyecto={proyecto} />
              </>
            ),
            cotizacion: mostrada ? (
              <div className="flex flex-col gap-4">
                <SelectorDeVersiones
                  proyectoId={proyecto.id}
                  versiones={proyecto.versiones}
                  elegida={mostrada.version}
                />
                {emitida ? (
                  <CotizacionEmitida cotizacion={emitida} sustituidaPor={pedida?.sustituida_por ?? null} />
                ) : borrador ? (
                  <CotizacionBorrador
                    cotizacion={borrador}
                    puedeEditar={puedeCotizar}
                    puedeEmitir={puedeEmitir}
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
                      Todavía no hay cotización. Se arma en el cotizador: cada ventana se calcula y se agrega al proyecto
                      con su cantidad y dónde va.
                    </p>
                    <CotizarProyecto proyectoId={proyecto.id} className="h-11 md:h-9" />
                  </div>
                ) : (
                  "Todavía no hay cotización."
                )}
              </Pendiente>
            ),
            obra: (
              <Pendiente icono={Ruler} titulo="Medición en obra">
                {cerrado
                  ? "El proyecto se cerró antes de medir en obra."
                  : "Antes de producir, cada medida de la cotización aprobada se confirma en obra. Llega con la entrega de medición y producción."}
              </Pendiente>
            ),
            cobros: (
              <Pendiente icono={Wallet} titulo="Cobros">
                {cerrado
                  ? "El proyecto se cerró sin cobros."
                  : "Los cobros —anticipo, parciales y saldo— se registran cuando haya una cotización aprobada. Llegan con la entrega de cobros."}
              </Pendiente>
            ),
            historia: (
              <Card>
                <CardContent className="pt-6">
                  <HistoriaProyecto eventos={proyecto.historia} />
                </CardContent>
              </Card>
            ),
          }}
        />

        {/* El riel de la etapa: a la derecha en el escritorio; debajo del contenido en el móvil */}
        <aside className="md:sticky md:top-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{cerrado ? ETAPAS[proyecto.etapa] : `${ETAPAS[proyecto.etapa]} · qué sigue`}</CardTitle>
            </CardHeader>
            <CardContent>
              <AccionesEtapa
                proyecto={proyecto}
                puedeAvanzar={puede(usuario, "proyectos:avanzar")}
                puedeCotizar={puedeCotizar}
                puedeAprobar={puede(usuario, "cotizaciones:aprobar")}
                // Con ítems, lo siguiente de un lead es emitir (`51-ui`: «Emitir» en la barra fija)
                emitible={borrador && borrador.items.length > 0 && puedeEmitir ? borrador.id : null}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
