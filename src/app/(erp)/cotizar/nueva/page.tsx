import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Enlace } from "@/components/comunes/enlace";
import { BarraDeContexto } from "@/components/erp/barra-de-contexto";
import { MarcoDeTrabajo } from "@/components/erp/marco-de-trabajo";
import { Button } from "@/components/ui/button";
import type { DestinoDeCotizacion } from "@/features/cotizar/components/agregar-al-proyecto";
import { CotizadorPanel } from "@/features/cotizar/components/cotizador-panel";
import type { Despiece, Tipo } from "@/features/cotizar/types";
import { rutaDeSeccion } from "@/features/proyectos/pestanas";
import type { Cotizacion, ProyectoFicha } from "@/features/proyectos/types";
import { adelantar, ApiError, apiGet, apiPost } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Cotizar · GMS Integra",
};

type Parametros = Promise<{ [clave: string]: string | string[] | undefined }>;

/**
 * Sin encabezado de página, a diferencia de Inicio y Plantillas.
 *
 * La barra de contexto ya dice dónde se está —«Cotizar», o la obra para la que se cotiza—, así que un
 * título «Cotizador» solo repetiría esa información a cambio de empujar el plano hacia abajo. Esta es una
 * pantalla de trabajo continuo: todo lo que aparece por encima del modelo tiene que ganarse el sitio.
 *
 * Con `?cotizacion=<id>` cotiza **para un proyecto** (tajada B.1): la cabecera dice para cuál y, tras
 * calcular, aparece «Agregar al proyecto». Sin él, es el cálculo en seco de siempre.
 *
 * Con `?tipo=<id>` abre en ese tipo: es lo que manda «Cotizar» desde Plantillas, y hasta la sesión 32 se ignoraba
 * (abría siempre el primero).
 */
export default async function NuevaCotizacionPage({ searchParams }: { searchParams: Parametros }) {
  const parametros = await searchParams;
  const crudo = parametros.cotizacion;
  const cotizacionId = typeof crudo === "string" ? crudo : null;
  // Los tipos y la cotización no dependen del usuario: salen ya, mientras se le espera (SEC.5)
  const peticionTipos = adelantar(apiGet<Tipo[]>("/tipos"));
  const peticionCotizacion = cotizacionId
    ? adelantar(apiGet<Cotizacion>(`/cotizaciones/${encodeURIComponent(cotizacionId)}`))
    : null;

  // El layout se renderiza EN PARALELO con la página: no garantiza nada aquí. Cada página
  // que necesita al usuario lo exige por su cuenta (la consulta se hace una vez por petición)
  const usuario = await exigirUsuario();
  const tipos = await peticionTipos;
  // Abre ya calculado: el tipo pedido —o el primero— con sus medidas de referencia, las mismas que propone la barra
  // (P1). Si el cálculo no sale, abre como antes, esperando «Calcular». Corre a la vez que el destino
  const inicial = tipos.find((tipo) => tipo.id === parametros.tipo) ?? tipos[0];
  const peticionCalculo = inicial
    ? apiPost<Despiece>(`/tipos/${encodeURIComponent(inicial.id)}/calcular`, {
        ancho: inicial.ancho_default ?? 300,
        alto: inicial.alto_default ?? 170,
      }).catch(() => null)
    : null;
  let destino: DestinoDeCotizacion | null = null;

  if (peticionCotizacion && puede(usuario, "cotizaciones:crear")) {
    let cotizacion: Cotizacion;

    try {
      cotizacion = await peticionCotizacion;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }

    // Lo emitido no se toca (`PRY-I07`): se dice aquí, no al pulsar «Agregar» y recibir un 422
    if (cotizacion.estado !== "borrador") {
      return (
        <MarcoDeTrabajo barra={<BarraDeContexto ruta={[{ etiqueta: "Cotizar" }]} />}>
          <div className="mx-auto flex max-w-md flex-col items-start gap-3 py-16">
            <p className="font-semibold">Esta cotización ya se emitió</p>
            <p className="text-muted-foreground text-sm">
              Un documento emitido no cambia: el cliente ya lo vio. Para otra propuesta, recotice desde el proyecto.
            </p>
            <Button asChild variant="outline" className="h-11 md:h-9">
              <Enlace href={rutaDeSeccion(cotizacion.proyecto_id, "cotizacion")}>Volver al proyecto</Enlace>
            </Button>
          </div>
        </MarcoDeTrabajo>
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

  const resultadoInicial = peticionCalculo ? await peticionCalculo : null;

  const ruta = destino
    ? [
        { etiqueta: "Proyectos", href: "/proyectos" },
        { codigo: destino.codigo, etiqueta: destino.nombre, href: rutaDeSeccion(destino.proyectoId, "cotizacion") },
        { etiqueta: "Cotizar" },
      ]
    : [{ etiqueta: "Cotizar" }];

  return (
    <MarcoDeTrabajo barra={<BarraDeContexto ruta={ruta} />}>
      <CotizadorPanel
        tipos={tipos}
        puedeVerDinero={puede(usuario, "costeo:ver")}
        destino={destino}
        tipoInicialId={inicial?.id}
        resultadoInicial={resultadoInicial}
      />
    </MarcoDeTrabajo>
  );
}
