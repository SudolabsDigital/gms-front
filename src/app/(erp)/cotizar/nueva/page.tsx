import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { DestinoDeCotizacion } from "@/features/cotizar/components/agregar-al-proyecto";
import { CotizadorPanel } from "@/features/cotizar/components/cotizador-panel";
import type { Tipo } from "@/features/cotizar/types";
import type { Cotizacion, ProyectoFicha } from "@/features/proyectos/types";
import { ApiError, apiGet } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Cotizar · GMS Integra",
};

type Parametros = Promise<{ [clave: string]: string | string[] | undefined }>;

/**
 * Sin encabezado de página, a diferencia de Inicio y Plantillas.
 *
 * El sidebar ya dice en qué sección se está, así que un título «Cotizador» y unas migas
 * «Inicio / Cotizar» solo repetían esa información a cambio de empujar el plano hacia
 * abajo. Esta es una pantalla de trabajo continuo: todo lo que aparece por encima del
 * modelo tiene que ganarse el sitio, y la navegación ya está resuelta a la izquierda.
 *
 * Con `?cotizacion=<id>` cotiza **para un proyecto** (tajada B.1): la cabecera dice para cuál y, tras
 * calcular, aparece «Agregar al proyecto». Sin él, es el cálculo en seco de siempre.
 */
export default async function NuevaCotizacionPage({ searchParams }: { searchParams: Parametros }) {
  // El layout se renderiza EN PARALELO con la página: no garantiza nada aquí. Cada página
  // que necesita al usuario lo exige por su cuenta (la consulta se hace una vez por petición)
  const usuario = await exigirUsuario();
  const tipos = await apiGet<Tipo[]>("/tipos");

  const crudo = (await searchParams).cotizacion;
  const cotizacionId = typeof crudo === "string" ? crudo : null;
  let destino: DestinoDeCotizacion | null = null;

  if (cotizacionId && puede(usuario, "cotizaciones:crear")) {
    let cotizacion: Cotizacion;

    try {
      cotizacion = await apiGet<Cotizacion>(`/cotizaciones/${encodeURIComponent(cotizacionId)}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }

    // Lo emitido no se toca (`PRY-I07`): se dice aquí, no al pulsar «Agregar» y recibir un 422
    if (cotizacion.estado !== "borrador") {
      return (
        <div className="mx-auto flex max-w-md flex-col items-start gap-3 py-16">
          <p className="font-semibold">Esta cotización ya se emitió</p>
          <p className="text-muted-foreground text-sm">
            Un documento emitido no cambia: el cliente ya lo vio. Para otra propuesta, recotice desde el proyecto.
          </p>
          <Button asChild variant="outline" className="h-11 md:h-9">
            <Link href={`/proyectos/${cotizacion.proyecto_id}?pestana=cotizacion`}>Volver al proyecto</Link>
          </Button>
        </div>
      );
    }

    const proyecto = await apiGet<ProyectoFicha>(`/proyectos/${encodeURIComponent(cotizacion.proyecto_id)}`);
    destino = {
      cotizacionId: cotizacion.id,
      proyectoId: proyecto.id,
      codigo: proyecto.codigo,
      nombre: proyecto.nombre,
      version: cotizacion.version,
      items: cotizacion.items.length,
    };
  }

  return (
    <CotizadorPanel
      tipos={tipos}
      puedeVerDinero={puede(usuario, "costeo:ver")}
      destino={destino}
    />
  );
}
