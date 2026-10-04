"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PESTANAS, type Pestana } from "@/features/proyectos/pestanas";

/**
 * Las pestañas por asunto de la ficha (decisión 23). El contenido de cada una llega ya pintado por el servidor
 * —la ficha es un solo `GET`—, así que cambiar de pestaña es instantáneo: no hay viaje por toque en el móvil.
 *
 * La URL guarda la pestaña (`?pestana=`), como los filtros de la lista: recargar, volver o compartir el enlace abre
 * la misma vista, y cambiar de pestaña no llena el historial del navegador. Se escribe con `history.replaceState`,
 * que Next sincroniza con `useSearchParams` **sin volver al servidor**: con `router.replace`, cada toque rehacía la
 * ficha entera —hasta 4 llamadas a la API— para tirarla (SEC.5). El resto de la URL (`?version=`) se conserva.
 *
 * La activa sale de la URL, no de un estado: una acción que lleva a otra pestaña —recotizar desde Obra, B.3 y C.2—
 * navega sin desmontar la ficha, y la URL manda (sin esto, en el recorrido de C.2 decía «cotización» y se veía Obra).
 */
export function PestanasFicha({ inicial, paneles }: { inicial: Pestana; paneles: Record<Pestana, React.ReactNode> }) {
  const ruta = usePathname();
  const parametros = useSearchParams();
  const pedida = PESTANAS.find((p) => p.id === parametros.get("pestana"))?.id;
  const activa = pedida ?? inicial;

  function cambiar(valor: string) {
    const siguientes = new URLSearchParams(parametros.toString());
    siguientes.set("pestana", valor);
    window.history.replaceState(null, "", `${ruta}?${siguientes.toString()}`);
  }

  return (
    <Tabs value={activa} onValueChange={cambiar} className="min-w-0 gap-4">
      {/* A 390 px las cinco caben sin desplazar (medido: 386 px en 358 con el hueco y el relleno por omisión) */}
      <TabsList
        variant="line"
        className="h-auto w-full justify-between gap-0 border-b md:justify-start md:gap-2"
      >
        {PESTANAS.map((p) => (
          <TabsTrigger key={p.id} value={p.id} className="h-11 flex-none px-1 md:h-9 md:px-3">
            {p.etiqueta}
          </TabsTrigger>
        ))}
      </TabsList>

      {PESTANAS.map((p) => (
        <TabsContent key={p.id} value={p.id} className="flex flex-col gap-4">
          {paneles[p.id]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
