"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AvisoDeError } from "@/components/comunes/aviso-de-error";
import { Button } from "@/components/ui/button";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import type { Cotizacion, Etapa } from "@/features/proyectos/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";

/**
 * «Recotizar» (`proyectos/50-api` § recotizar, tajada B.3): abre la versión siguiente con los ítems **y** las
 * condiciones de la vigente, recalculados con los precios de hoy (decisión 26), y lleva a su pestaña.
 *
 * Antes de abrirla dice lo que va a pasar, porque es la consecuencia que el usuario eligió (`51-ui`): la vigente
 * manda hasta que salga la nueva, y si estaba aprobada, al emitir la nueva el proyecto vuelve a Cotizado. Con un
 * borrador ya abierto no hay nada que abrir: se sigue en él.
 */
export function RecotizarProyecto({
  proyectoId,
  etapa,
  versionVigente,
  hayBorrador,
  className,
}: {
  proyectoId: string;
  etapa: Etapa;
  versionVigente: number;
  hayBorrador: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pestana = `/proyectos/${proyectoId}?pestana=cotizacion`;
  const clase = className ?? "h-11 md:h-9";

  if (hayBorrador) {
    return (
      <Button asChild variant="outline" className={clase}>
        <Link href={pestana}>Seguir recotizando</Link>
      </Button>
    );
  }

  async function recotizar() {
    setAbriendo(true);
    setError(null);
    const respuesta = await pedir<Cotizacion>(`/api/v1/proyectos/${proyectoId}/cotizaciones`, { method: "POST" });
    setAbriendo(false);

    if (!respuesta.ok) {
      // `DESCUENTO_EXCEDE_SUBTOTAL` si con los precios de hoy el descuento ya no cabe: nada se abrió (`G-59`)
      setError(mensajeDeError(respuesta.error));
      return;
    }

    setAbierto(false);
    router.push(pestana);
    router.refresh();
  }

  const nueva = versionVigente + 1;

  return (
    <>
      <Button variant="outline" className={clase} onClick={() => { setAbierto(true); setError(null); }}>
        Recotizar
      </Button>

      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo={`Recotizar · v${nueva}`}
        descripcion={`Se abre la v${nueva} con los ítems y las condiciones de la v${versionVigente}, recalculados con los precios de hoy. La v${versionVigente} sigue vigente hasta que emita la nueva.`}
      >
        <div className="flex flex-col gap-4">
          {etapa === "aprobado" ? (
            <p className="bg-muted rounded-md px-3 py-2 text-sm">
              La v{versionVigente} está aprobada. La versión nueva tendrá que aprobarla el cliente: al emitirla, el
              proyecto vuelve a Cotizado.
            </p>
          ) : null}

          {error ? <AvisoDeError>{error}</AvisoDeError> : null}

          <Button variant="brand" className="h-11 md:h-9" onClick={recotizar} disabled={abriendo}>
            {abriendo ? <Loader2 className="size-4 animate-spin" /> : null}
            Abrir la v{nueva}
          </Button>
        </div>
      </PanelResponsivo>
    </>
  );
}
