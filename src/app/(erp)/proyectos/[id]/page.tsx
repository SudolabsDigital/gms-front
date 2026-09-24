import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileText, MessageCircle, Phone, Wallet } from "lucide-react";

import { PageHeader } from "@/components/comunes/page-header";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { RUTA_INICIO } from "@/components/erp/navegacion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { enlaceParaEscribirA } from "@/config/site-config";
import { AccionesEtapa } from "@/features/proyectos/components/acciones-etapa";
import { EditarProyecto } from "@/features/proyectos/components/editar-proyecto";
import { HistoriaProyecto } from "@/features/proyectos/components/historia-proyecto";
import { InsigniaEtapa } from "@/features/proyectos/components/insignia-etapa";
import { ORIGENES, esCerrada } from "@/features/proyectos/textos";
import type { ProyectoFicha } from "@/features/proyectos/types";
import { ApiError, apiGet } from "@/lib/api-server";
import { fechaHora, haceDias } from "@/lib/formato";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Proyecto · GMS Integra",
};

/**
 * La ficha del proyecto (`proyectos/51-ui` § la ficha).
 *
 * Móvil: secciones apiladas —Etapa · Cotización vigente · Cobros y saldo · Historia · Datos— con la
 * acción principal en una barra fija. Escritorio: dos columnas, el documento y los datos a la
 * izquierda; etapa, cobros e historia a la derecha. Un solo árbol para los dos: las columnas del
 * escritorio son `display: contents` en el móvil, así cada tarjeta ordena por su cuenta sin duplicar
 * nada.
 *
 * Cotización y cobros llegan con las tajadas B y C: se ven, rotulados, sin fingir que funcionan.
 */
export default async function FichaProyectoPage({ params }: { params: Promise<{ id: string }> }) {
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

  const whatsapp = enlaceParaEscribirA(proyecto.cliente.telefono);
  const telefono = proyecto.cliente.telefono?.replace(/[^\d+]/g, "");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-28 md:pb-0">
      <PageHeader
        migas={[
          { etiqueta: "Inicio", href: RUTA_INICIO },
          { etiqueta: "Proyectos", href: "/proyectos" },
          { etiqueta: proyecto.codigo },
        ]}
        titulo={proyecto.nombre}
        descripcion={`${proyecto.codigo} · ${proyecto.cliente.nombre}`}
        acciones={puede(usuario, "proyectos:crear") ? <EditarProyecto proyecto={proyecto} /> : null}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        {/* Columna izquierda en el escritorio; en el móvil sus tarjetas se ordenan con el resto */}
        <div className="contents md:flex md:min-w-0 md:flex-1 md:flex-col md:gap-4">
          <Card className="order-2 md:order-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4" />
                Cotización vigente
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              {esCerrada(proyecto.etapa)
                ? "El proyecto se cerró sin cotización."
                : "Todavía no hay cotización. Se arma con el cotizador conectado al proyecto, que llega en la próxima entrega: agregar ítems, emitir y registrar la aprobación del cliente."}
            </CardContent>
          </Card>

          <Card className="order-5 md:order-none">
            <CardHeader>
              <CardTitle className="text-base">Datos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-2">
                <div>
                  <p className="font-medium">{proyecto.cliente.nombre}</p>
                  <p className="text-muted-foreground">
                    {[proyecto.cliente.telefono, proyecto.cliente.documento].filter(Boolean).join(" · ") ||
                      "Sin teléfono ni documento"}
                  </p>
                </div>
                {whatsapp || telefono ? (
                  <div className="flex gap-2">
                    {whatsapp ? (
                      <Button asChild variant="outline" className="h-11 flex-1 md:h-8 md:flex-none">
                        <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="size-4" />
                          WhatsApp
                        </a>
                      </Button>
                    ) : null}
                    {telefono ? (
                      <Button asChild variant="outline" className="h-11 flex-1 md:hidden">
                        <a href={`tel:${telefono}`}>
                          <Phone className="size-4" />
                          Llamar
                        </a>
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <dt className="text-muted-foreground">Obra</dt>
                <dd>{[proyecto.direccion_obra, proyecto.distrito].filter(Boolean).join(", ") || "—"}</dd>
                <dt className="text-muted-foreground">Llegó por</dt>
                <dd>
                  {ORIGENES[proyecto.origen]}
                  {proyecto.enlace_origen ? (
                    <>
                      {" · "}
                      <a
                        href={proyecto.enlace_origen}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary break-all underline-offset-4 hover:underline"
                      >
                        lo que vio
                      </a>
                    </>
                  ) : null}
                </dd>
                <dt className="text-muted-foreground">Responsable</dt>
                <dd>{proyecto.responsable?.nombre ?? "—"}</dd>
                <dt className="text-muted-foreground">Registrado</dt>
                <dd>{fechaHora(proyecto.created_at)}</dd>
              </dl>

              {proyecto.notas ? <p className="bg-muted/40 rounded-md p-3 whitespace-pre-line">{proyecto.notas}</p> : null}
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha en el escritorio */}
        <div className="contents md:flex md:w-80 md:shrink-0 md:flex-col md:gap-4 lg:w-96">
          <Card className="order-1 md:order-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                Etapa
                <InsigniaEtapa etapa={proyecto.etapa} />
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Desde {haceDias(proyecto.etapa_desde)} · {fechaHora(proyecto.etapa_desde)}
              </p>
            </CardHeader>
            <CardContent>
              <AccionesEtapa proyecto={proyecto} puedeAvanzar={puede(usuario, "proyectos:avanzar")} />
            </CardContent>
          </Card>

          <Card className="order-3 md:order-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="size-4" />
                Cobros y saldo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Los cobros —anticipo, parciales y saldo— se registran cuando haya una cotización aprobada. Llegan
              con la entrega de cobros.
            </CardContent>
          </Card>

          <Card className="order-4 md:order-none">
            <CardHeader>
              <CardTitle className="text-base">Historia</CardTitle>
            </CardHeader>
            <CardContent>
              <HistoriaProyecto eventos={proyecto.historia} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
