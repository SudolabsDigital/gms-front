import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";

import { Enlace } from "@/components/comunes/enlace";
import { Notificacion } from "@/components/comunes/notificacion";
import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { BarraDeContexto } from "@/components/erp/barra-de-contexto";
import { MarcoDeTrabajo } from "@/components/erp/marco-de-trabajo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { enlaceParaEscribirA } from "@/config/site-config";
import { EditarCliente } from "@/features/clientes/components/editar-cliente";
import { documentoLegible, type ClienteFicha } from "@/features/clientes/types";
import { InsigniaEtapa } from "@/features/proyectos/components/insignia-etapa";
import { adelantar, ApiError, apiGet } from "@/lib/api-server";
import { moneda, plural } from "@/lib/formato";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Cliente · GMS Integra",
};

/**
 * La ficha del cliente (`clientes/52-brief-clientes` § 4): cómo escribirle, qué obras tuvo y cuánto debe. Lo que falta
 * se nombra en un solo sitio —«Falta: DNI o RUC»— porque es lo que las cotizaciones necesitan y nadie completa.
 */
export default async function FichaClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const peticion = adelantar(apiGet<ClienteFicha>(`/clientes/${encodeURIComponent(id)}`));

  const usuario = await exigirUsuario();
  if (!puede(usuario, "proyectos:ver")) {
    return (
      <MarcoDeTrabajo barra={<BarraDeContexto ruta={[{ etiqueta: "Clientes" }]} />}>
        <SinAcceso que="clientes" />
      </MarcoDeTrabajo>
    );
  }

  let cliente: ClienteFicha;
  try {
    cliente = await peticion;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const whatsapp = enlaceParaEscribirA(cliente.telefono);
  const telefono = cliente.telefono?.replace(/[^\d+]/g, "");
  const conDeuda = cliente.proyectos.filter((p) => (p.saldo ?? 0) > 0).length;
  const puedeEditar = puede(usuario, "proyectos:crear");

  const datos = [
    ["Teléfono", cliente.telefono],
    ["Email", cliente.email],
    ["Dirección", [cliente.direccion, cliente.distrito].filter(Boolean).join(", ") || null],
  ] as const;
  const falta = [
    !cliente.documento && "DNI o RUC",
    !cliente.telefono && "teléfono",
    !cliente.email && "email",
    !cliente.direccion && "dirección",
  ].filter(Boolean) as string[];

  const barra = <BarraDeContexto ruta={[{ etiqueta: "Clientes", href: "/clientes" }, { etiqueta: cliente.nombre }]} />;

  return (
    <MarcoDeTrabajo barra={barra}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <CabeceraDeSeccion
          volver={{ href: "/clientes", etiqueta: "Clientes" }}
          titulo={cliente.nombre}
          descripcion={documentoLegible(cliente.documento) ?? "Sin DNI ni RUC"}
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
              {puedeEditar ? <EditarCliente cliente={cliente} /> : null}
            </>
          }
        />

        {/* Solo si debe: «Debe S/ 0.00» es ruido (brief § 4). Sin `costeo:ver` la clave no viaja */}
        {cliente.debe !== undefined && cliente.debe > 0 ? (
          <Notificacion tono="advertencia" titulo={`Debe ${moneda(cliente.debe)}`}>
            En {plural(conDeuda, "proyecto", "proyectos")} ya aprobados: abra cada uno para registrar el cobro.
          </Notificacion>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contacto</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              {datos
                .filter(([, valor]) => valor)
                .map(([etiqueta, valor]) => (
                  <div key={etiqueta} className="contents">
                    <dt className="text-muted-foreground">{etiqueta}</dt>
                    <dd className="break-words">{valor}</dd>
                  </div>
                ))}
            </dl>
            {cliente.notas ? <p className="text-muted-foreground whitespace-pre-line">{cliente.notas}</p> : null}
            {falta.length > 0 ? (
              <p className="text-muted-foreground">
                Falta: {falta.join(", ")}.
                {!cliente.documento ? " Sin DNI ni RUC, las cotizaciones salen sin documento." : null}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{plural(cliente.proyectos.length, "proyecto", "proyectos")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {cliente.proyectos.map((p) => (
                <li key={p.id}>
                  <Enlace href={`/proyectos/${p.id}`} className="hover:bg-muted/40 active:bg-muted/60 flex min-h-11 flex-col gap-1 px-4 py-3 md:flex-row md:items-center md:gap-3">
                    <span className="text-muted-foreground font-mono text-xs md:w-28 md:shrink-0">{p.codigo}</span>
                    <span className="min-w-0 flex-1 font-medium break-words">{p.nombre}</span>
                    <span className="flex items-center justify-between gap-3 md:justify-end">
                      <InsigniaEtapa etapa={p.etapa} />
                      {p.saldo !== undefined && p.saldo > 0 ? (
                        <span className="font-mono text-sm tabular-nums">
                          <span className="text-muted-foreground font-sans">Por cobrar </span>
                          {moneda(p.saldo)}
                        </span>
                      ) : null}
                    </span>
                  </Enlace>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </MarcoDeTrabajo>
  );
}
