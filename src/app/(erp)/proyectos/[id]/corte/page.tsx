import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { SinAcceso } from "@/components/comunes/sin-acceso";
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
 * La lista de corte (`proyectos/51-ui` § lista de corte, brief `proyectos/53-brief-lista-de-corte`), una sección de la
 * obra desde SEC.9b: la barra, el panel y el riel son del layout, y en papel no sale ninguno (`print:hidden`). La
 * operación es imprimir: la pantalla es la vista previa y en papel sale solo la hoja. Un error al leer lo recoge
 * `(erp)/error.tsx`, que ofrece reintentar.
 */
export default async function ListaDeCortePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const peticion = adelantar(apiGet<ListaDeCorte>(`/proyectos/${encodeURIComponent(id)}/despiece`));

  const usuario = await exigirUsuario();

  if (!puede(usuario, "despiece:ver")) return <SinAcceso que="la lista de corte" />;

  let lista: ListaDeCorte | null = null;
  let fueraDeEtapa: string | null = null;

  try {
    lista = await peticion;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (!(error instanceof ApiError && error.status === 422)) throw error;
    fueraDeEtapa = mensajeDelServidor(error.datos) ?? "La lista de corte sale cuando el proyecto pasa a producción.";
  }

  return (
    <>
      <CabeceraDeSeccion
        className="print:hidden"
        titulo="Lista de corte"
        descripcion="Qué se corta, a qué medida y cuántas veces, ítem por ítem. Se imprime y en el taller se tacha con lápiz."
        acciones={lista ? <BotonImprimir /> : null}
      />

      {lista ? (
        <HojaDeCorte lista={lista} />
      ) : (
        <Card>
          <CardContent className="text-sm">{fueraDeEtapa}</CardContent>
        </Card>
      )}
    </>
  );
}
