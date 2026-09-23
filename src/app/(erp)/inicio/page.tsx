import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/comunes/page-header";
import { navegacionPara } from "@/components/erp/navegacion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Inicio · GMS Integra",
};

/**
 * La puerta del ERP.
 *
 * Antes el login dejaba al usuario directamente en el cotizador, que es la pantalla que
 * más se usa pero la peor para llegar en frío: no dice qué es el sistema ni qué más
 * tiene. Quien entra por primera vez necesita el mapa antes que la herramienta.
 *
 * Los tres pasos no son un tutorial: son el orden real del negocio. Sin un tipo definido
 * no hay nada que cotizar, y sin cotización no hay orden de producción. Ver esa cadena
 * explica el sistema entero mejor que cualquier manual.
 */
export default async function InicioPage() {
  const usuario = await exigirUsuario();
  const entradas = navegacionPara(usuario).filter(
    (entrada) => entrada.href !== "/inicio",
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        titulo={`Hola, ${usuario.nombre.split(" ")[0]}`}
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
            descripcion="El despiece es la lista de corte y la compra es lo que el almacén debe pedir."
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
                <Link href={entrada.href} className="block">
                  {contenido}
                </Link>
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
