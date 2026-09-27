"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Cotizacion } from "@/features/proyectos/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";
import { notificar } from "@/lib/notificar";

/** El cotizador en modo «para este proyecto»: tras calcular, el botón es «Agregar al proyecto» (`51-ui`) */
export const rutaDelCotizador = (cotizacionId: string) => `/cotizar/nueva?cotizacion=${encodeURIComponent(cotizacionId)}`;

/**
 * «Cotizar»: abre el borrador del proyecto —o el que ya existe: hay uno como mucho (`10-modelo`)— y lleva al
 * cotizador para agregarle ítems. Es idempotente en el servidor, así que un doble toque no abre dos.
 */
export function CotizarProyecto({
  proyectoId,
  etiqueta = "Cotizar",
  variante = "brand",
  className,
}: {
  proyectoId: string;
  etiqueta?: string;
  variante?: "brand" | "outline";
  className?: string;
}) {
  const router = useRouter();
  const [abriendo, setAbriendo] = useState(false);

  async function cotizar() {
    setAbriendo(true);
    const respuesta = await pedir<Cotizacion>(`/api/v1/proyectos/${proyectoId}/cotizaciones`, { method: "POST" });

    if (!respuesta.ok) {
      setAbriendo(false);
      notificar({ tono: "error", titulo: "No se pudo abrir la cotización", descripcion: mensajeDeError(respuesta.error) });
      return;
    }

    router.push(rutaDelCotizador(respuesta.datos.id));
  }

  return (
    <Button variant={variante} className={className ?? "h-11 w-full md:h-9"} onClick={cotizar} disabled={abriendo}>
      {abriendo ? <Loader2 className="size-4 animate-spin" /> : null}
      {etiqueta}
    </Button>
  );
}
