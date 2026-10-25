import { redirect } from "next/navigation";

import { leerObra } from "@/features/proyectos/datos";
import { rutaDeSeccion, seccionInicial } from "@/features/proyectos/pestanas";
import { adelantar } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

type Parametros = Promise<{ [clave: string]: string | string[] | undefined }>;

/**
 * La obra sin sección: abre en la de lo siguiente que hacer (decisión 23, `arquitectura-del-erp` § 3). Es también la
 * puerta de lo de antes de SEC.9b —los enlaces con `?pestana=`, compartidos o guardados— y de las acciones que cambian
 * la etapa, que navegan aquí para caer en la sección de la etapa nueva. El resto de la URL (`?version=`) se conserva.
 */
export default async function ObraPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Parametros }) {
  const { id } = await params;
  const peticion = adelantar(leerObra(id));

  const usuario = await exigirUsuario();
  // El layout ya dice «sin acceso»
  if (!puede(usuario, "proyectos:ver")) return null;

  const [proyecto, parametros] = await Promise.all([peticion, searchParams]);
  const { pestana, ...resto } = parametros;
  const seccion = seccionInicial(typeof pestana === "string" ? pestana : undefined, proyecto.etapa);
  const consulta = new URLSearchParams(
    Object.entries(resto).flatMap(([clave, valor]) =>
      typeof valor === "string" ? [[clave, valor]] : (valor ?? []).map((v) => [clave, v]),
    ),
  ).toString();

  redirect(rutaDeSeccion(proyecto.id, seccion, consulta ? `?${consulta}` : ""));
}
