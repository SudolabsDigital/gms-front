import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { Enlace } from "@/components/comunes/enlace";
import { BarraDeContexto } from "@/components/erp/barra-de-contexto";
import { MarcoDeTrabajo } from "@/components/erp/marco-de-trabajo";
import { navegacionPara } from "@/components/erp/navegacion";
import { Card, CardContent } from "@/components/ui/card";
import { AltaProyecto } from "@/features/proyectos/components/alta-proyecto";
import { PendientesDeHoy } from "@/features/proyectos/components/pendientes-de-hoy";
import type { Pendientes } from "@/features/proyectos/types";
import { adelantar, apiGet } from "@/lib/api-server";
import { puede } from "@/lib/permisos";
import { cn } from "@/lib/utils";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Inicio · GMS Integra",
};

/**
 * La puerta del ERP: **qué hacer hoy** (`proyectos/54-brief-inicio`, decisión 43).
 *
 * Quien ve proyectos llega a lo que le necesita —cotizaciones que vencen, aprobados sin medir, saldos—, en orden de
 * urgencia y a un toque de donde se resuelve. El mapa del sistema de abajo se queda para quien no los ve (el maestro y
 * el almacén): a Miguel el menú ya le da las secciones, y ver el mapa cada mañana era ruido (recorrido UX.0, R26).
 */
export default async function InicioPage() {
  const peticion = adelantar(apiGet<Pendientes>("/inicio"));
  const usuario = await exigirUsuario();
  const nombre = usuario.nombre.split(" ")[0];
  const barra = <BarraDeContexto ruta={[{ etiqueta: "Inicio" }]} />;

  if (!puede(usuario, "proyectos:ver")) {
    return (
      <MarcoDeTrabajo barra={barra}>
        <MapaDelSistema nombre={nombre} usuario={usuario} />
      </MarcoDeTrabajo>
    );
  }

  const pendientes = await peticion;

  return (
    <MarcoDeTrabajo barra={barra}>
      {/* Espacio abajo en el móvil: la barra fija de «Nuevo proyecto» no debe tapar la última tarjeta */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-24 md:pb-0">
        <CabeceraDeSeccion
          titulo={`Hola, ${nombre}`}
          descripcion="Lo que necesita atención hoy, de lo más urgente a lo que puede esperar."
        />
        <PendientesDeHoy pendientes={pendientes} />
        {/* En el escritorio, «Nuevo proyecto» está en la barra de contexto */}
        {puede(usuario, "proyectos:crear") ? <AltaProyecto disparador="movil" /> : null}
      </div>
    </MarcoDeTrabajo>
  );
}

/**
 * El mapa del sistema, para quien no ve proyectos.
 *
 * Antes el login dejaba al usuario directamente en el cotizador, que es la pantalla que
 * más se usa pero la peor para llegar en frío: no dice qué es el sistema ni qué más
 * tiene. Quien entra por primera vez necesita el mapa antes que la herramienta.
 *
 * Los tres pasos no son un tutorial: son el orden real del negocio. Sin un tipo definido
 * no hay nada que cotizar, y sin cotización no hay orden de producción. Ver esa cadena
 * explica el sistema entero mejor que cualquier manual.
 */
function MapaDelSistema({ nombre, usuario }: { nombre: string; usuario: Awaited<ReturnType<typeof exigirUsuario>> }) {
  const entradas = navegacionPara(usuario).filter(
    (entrada) => entrada.href !== "/inicio",
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <CabeceraDeSeccion
        titulo={`Hola, ${nombre}`}
        descripcion="GMS Integra calcula ventanas y mamparas a medida: usted da las medidas y el sistema devuelve el plano, la lista de corte y el precio."
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Cómo funciona</h2>

        <ol className="grid gap-3 sm:grid-cols-3">
          <Paso
            numero={1}
            titulo="Se define el tipo"
            descripcion="En Plantillas se dice cómo se compone la ventana: cuántos paneles y cuáles corren."
          />
          <Paso
            numero={2}
            titulo="Se cotiza a medida"
            descripcion="Se elige el tipo, se escriben ancho y alto, y el motor devuelve plano, despiece y precio."
          />
          <Paso
            numero={3}
            titulo="Se lleva al taller"
            descripcion="Desde que el proyecto pasa a producción, su despiece se imprime como lista de corte para el banco."
          />
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Secciones</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {entradas.map((entrada) => {
            const contenido = (
              <CardContent className="flex items-start gap-3 p-4">
                <span
                  className={cn(
                    "rounded-md p-2",
                    entrada.disponible
                      ? "bg-primary/8 text-primary"
                      : "bg-muted text-muted-foreground/60",
                  )}
                >
                  <entrada.icono className="size-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{entrada.titulo}</span>
                    {entrada.disponible ? null : (
                      <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">
                        Pronto
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground block text-sm text-pretty">
                    {entrada.descripcion}
                  </span>
                </span>

                {entrada.disponible ? (
                  <ArrowRight className="text-muted-foreground mt-2 size-4 shrink-0" />
                ) : null}
              </CardContent>
            );

            if (!entrada.disponible) {
              return (
                <Card key={entrada.href} className="border-dashed shadow-none">
                  {contenido}
                </Card>
              );
            }

            return (
              <Card
                key={entrada.href}
                className="hover:border-primary/30 transition-colors"
              >
                <Enlace href={entrada.href} className="block">
                  {contenido}
                </Enlace>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Paso({
  numero,
  titulo,
  descripcion,
}: {
  numero: number;
  titulo: string;
  descripcion: string;
}) {
  return (
    <li className="bg-card flex flex-col gap-1 rounded-md border p-4">
      <span className="bg-primary/8 text-primary flex size-6 items-center justify-center rounded-full text-xs font-semibold">
        {numero}
      </span>
      <p className="mt-1 font-medium">{titulo}</p>
      <p className="text-muted-foreground text-sm text-pretty">{descripcion}</p>
    </li>
  );
}
