import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Enlace } from "@/components/comunes/enlace";
import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { BarraDeContexto } from "@/components/erp/barra-de-contexto";
import { MarcoDeTrabajo } from "@/components/erp/marco-de-trabajo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BotonImprimir } from "@/features/proyectos/components/boton-imprimir";
import { HojaDeCorte } from "@/features/proyectos/components/hoja-de-corte";
import type { ListaDeCorte } from "@/features/proyectos/types";
import { adelantar, ApiError, apiGet } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Lista de corte · GMS Integra",
};

/** El mensaje del 422, tal como lo redacta el servidor: la regla de la etapa vive allí (`PRY-I34`) */
function mensajeDelServidor(datos: unknown): string | null {
  const detalles = (datos as { detalles?: { mensaje?: unknown }[] } | null)?.detalles;
  const mensaje = detalles?.[0]?.mensaje;
  return typeof mensaje === "string" ? mensaje : null;
}

/**
 * La lista de corte (`proyectos/51-ui` § lista de corte, brief `proyectos/53-brief-lista-de-corte`). La operación es
 * imprimir: la pantalla es la vista previa y en papel sale solo la hoja. Un error al leer lo recoge `(erp)/error.tsx`,
 * que ofrece reintentar.
 */
export default async function ListaDeCortePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ficha = `/proyectos/${encodeURIComponent(id)}`;
  const peticion = adelantar(apiGet<ListaDeCorte>(`${ficha}/despiece`));

  const usuario = await exigirUsuario();

  if (!puede(usuario, "despiece:ver")) {
    return (
      <MarcoDeTrabajo barra={<BarraDeContexto ruta={[{ etiqueta: "Proyectos", href: "/proyectos" }, { etiqueta: "Lista de corte" }]} />}>
        <SinAcceso que="la lista de corte" />
      </MarcoDeTrabajo>
    );
  }

  let lista: ListaDeCorte | null = null;
  let fueraDeEtapa: string | null = null;

  try {
    lista = await peticion;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (!(error instanceof ApiError && error.status === 422)) throw error;
    fueraDeEtapa = mensajeDelServidor(error.datos) ?? "La lista de corte sale cuando el proyecto pasa a producción.";
  }

  const volver = (
    <Button asChild variant="outline" className="h-11 md:h-9">
      <Enlace href={ficha}>
        <ArrowLeft className="size-4" />
        Volver a la ficha
      </Enlace>
    </Button>
  );

  // Sin la lista (fuera de etapa) no se sabe el nombre de la obra: la barra dice su código si lo tiene
  const barra = (
    <BarraDeContexto
      ruta={[
        { etiqueta: "Proyectos", href: "/proyectos" },
        lista ? { codigo: lista.proyecto.codigo, etiqueta: lista.proyecto.nombre, href: ficha } : { etiqueta: "Proyecto", href: ficha },
        { etiqueta: "Lista de corte" },
      ]}
    />
  );

  return (
    <MarcoDeTrabajo barra={barra}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 print:max-w-none">
        <CabeceraDeSeccion
          className="print:hidden"
          titulo="Lista de corte"
          descripcion="Qué se corta, a qué medida y cuántas veces, ítem por ítem. Se imprime y en el taller se tacha con lápiz."
          acciones={
            <>
              {volver}
              {lista ? <BotonImprimir /> : null}
            </>
          }
        />

        {lista ? (
          <HojaDeCorte lista={lista} />
        ) : (
          <Card>
            <CardContent className="text-sm">{fueraDeEtapa}</CardContent>
          </Card>
        )}
      </div>
    </MarcoDeTrabajo>
  );
}
