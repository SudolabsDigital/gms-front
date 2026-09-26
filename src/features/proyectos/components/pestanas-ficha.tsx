"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PESTANAS, type Pestana } from "@/features/proyectos/pestanas";

/**
 * Las pestañas por asunto de la ficha (decisión 23). El contenido de cada una llega ya pintado por el servidor
 * —la ficha es un solo `GET`—, así que cambiar de pestaña es instantáneo: no hay viaje por toque en el móvil.
 *
 * La URL guarda la pestaña (`?pestana=`) con `replace`, como los filtros de la lista: recargar, volver o
 * compartir el enlace abre la misma vista, y cambiar de pestaña no llena el historial del navegador.
 */
export function PestanasFicha({ inicial, paneles }: { inicial: Pestana; paneles: Record<Pestana, React.ReactNode> }) {
  const router = useRouter();
  const ruta = usePathname();
  const [activa, setActiva] = useState<Pestana>(inicial);
  // Una acción que lleva a otra pestaña por la URL —recotizar desde Obra, B.3 y C.2— navega sin desmontar la
  // ficha: sin esto la URL decía «cotización» y se seguía viendo Obra (recorrido de C.2). Patrón de React para
  // ajustar el estado cuando cambia una prop, sin efecto
  const [previa, setPrevia] = useState<Pestana>(inicial);
  if (inicial !== previa) {
    setPrevia(inicial);
    setActiva(inicial);
  }

  function cambiar(valor: string) {
    setActiva(valor as Pestana);
    router.replace(`${ruta}?pestana=${valor}`, { scroll: false });
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
