"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Info, LayoutTemplate } from "lucide-react";

import { EmptyState } from "@/components/comunes/empty-state";
import { Notificacion } from "@/components/comunes/notificacion";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AgregarAlProyecto, type DestinoDeCotizacion } from "@/features/cotizar/components/agregar-al-proyecto";
import { BarraControles } from "@/features/cotizar/components/barra-controles";
import { ResultadoCalculo } from "@/features/cotizar/components/resultado-calculo";
import type { Despiece, Tipo } from "@/features/cotizar/types";
import { pedir, type ErrorApi } from "@/lib/api-cliente";

/**
 * Panel del cotizador.
 *
 * [AVISO] Este componente NO calcula nada. Envía medidas y dibuja la respuesta. Duplicar aquí
 * una sola fórmula significaría, en unos meses, dos motores que no coinciden y aluminio
 * cortado según el que se equivocó (PC-GMS-006).
 */
export function CotizadorPanel({
  tipos,
  puedeVerDinero,
  destino: destinoInicial = null,
}: {
  tipos: Tipo[];
  puedeVerDinero: boolean;
  /** Con proyecto, tras calcular aparece «Agregar al proyecto» (tajada B.1). Sin él, cálculo en seco */
  destino?: DestinoDeCotizacion | null;
}) {
  const [destino, setDestino] = useState(destinoInicial);
  const [tipoId, setTipoId] = useState<string>(tipos[0]?.id ?? "");
  const [ancho, setAncho] = useState<string>(String(tipos[0]?.ancho_default ?? 300));
  const [alto, setAlto] = useState<string>(String(tipos[0]?.alto_default ?? 170));

  const [resultado, setResultado] = useState<Despiece | null>(null);
  /** Las entradas del resultado a la vista: lo que «Agregar al proyecto» manda, aunque la barra ya diga otra cosa */
  const [calculado, setCalculado] = useState<{ tipoId: string; ancho: string; alto: string } | null>(null);
  const [errores, setErrores] = useState<ErrorApi | null>(null);
  const [calculando, iniciarCalculo] = useTransition();

  /** Pieza aislada en el plano. Vive aquí porque la comparten la lista y el dibujo. */
  const [insumoResaltado, setInsumoResaltado] = useState<string | null>(null);

  /**
   * Al cambiar de tipo se proponen sus medidas de referencia del cuaderno y se descarta
   * el resultado anterior, que ya no corresponde. Se hace en el manejador y no en un
   * efecto: es una reacción a una acción del usuario, no una sincronización con un
   * sistema externo.
   */
  function seleccionarTipo(nuevoTipoId: string) {
    const nuevoTipo = tipos.find((t) => t.id === nuevoTipoId);
    const anterior = tipos.find((t) => t.id === tipoId);
    // Una medida escrita a mano se respeta; solo la vacía o la que seguía siendo la del tipo anterior toma la del nuevo.
    // Antes, elegir el tipo después de escribir las medidas las borraba sin avisar (recorrido UX.0, R20)
    const sinTocar = (valor: string, delAnterior: number | null | undefined) =>
      valor.trim() === "" || (delAnterior !== null && delAnterior !== undefined && valor === String(delAnterior));

    setTipoId(nuevoTipoId);
    if (sinTocar(ancho, anterior?.ancho_default)) setAncho(String(nuevoTipo?.ancho_default ?? 300));
    if (sinTocar(alto, anterior?.alto_default)) setAlto(String(nuevoTipo?.alto_default ?? 170));
    setResultado(null);
    setCalculado(null);
    setErrores(null);
    setInsumoResaltado(null);
  }

  function calcular() {
    if (!tipoId) return;

    const entradas = { tipoId, ancho, alto };

    iniciarCalculo(async () => {
      setErrores(null);

      const respuesta = await pedir<Despiece>(`/api/v1/tipos/${tipoId}/calcular`, {
        method: "POST",
        body: JSON.stringify({ ancho: Number(ancho), alto: Number(alto) }),
      });

      if (!respuesta.ok) {
        setResultado(null);
        setCalculado(null);
        setErrores(respuesta.error);

        return;
      }

      setResultado(respuesta.datos);
      setCalculado(entradas);
    });
  }

  if (tipos.length === 0) {
    return (
      <EmptyState
        icono={LayoutTemplate}
        titulo="Todavía no hay nada que cotizar"
        descripcion="Cotizar parte de un tipo ya publicado. El maestro de taller debe crear y publicar al menos uno en Plantillas."
      />
    );
  }

  const advertencias = resultado?.advertencias ?? [];
  const graves = advertencias.filter((a) => a.nivel === "warn");
  const notas = advertencias.filter((a) => a.nivel !== "warn");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {destino ? <CabeceraDestino destino={destino} /> : null}

      <BarraControles
        tipos={tipos}
        tipoId={tipoId}
        ancho={ancho}
        alto={alto}
        calculando={calculando}
        alCambiarTipo={seleccionarTipo}
        alCambiarAncho={setAncho}
        alCambiarAlto={setAlto}
        alCalcular={calcular}
      />

      {/* Lo que cambia una decisión —despiece incompleto, precios sin actualizar— se ve; lo informativo se pliega.
          Seis avisos iguales en cada cálculo escondían el grave entre los demás (recorrido UX.0, R22) */}
      {graves.length > 0 ? (
        <Notificacion
          tono="advertencia"
          titulo={graves.length === 1 ? "El motor avisa" : `El motor avisa de ${graves.length} cosas`}
          detalles={graves.map((a) => ({ mensaje: a.mensaje }))}
        />
      ) : null}

      {notas.length > 0 ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground self-start">
              <Info className="size-4" />
              {notas.length === 1 ? "1 nota técnica del cálculo" : `${notas.length} notas técnicas del cálculo`}
            </Button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-96">
            <Notificacion tono="info" detalles={notas.map((a) => ({ mensaje: a.mensaje }))} className="border-0 bg-transparent p-0" />
          </PopoverContent>
        </Popover>
      ) : null}

      {errores ? (
        <Notificacion
          tono="error"
          // Solo un 422 es el motor rechazando una medida; lo demás es que el cálculo no llegó
          // a hacerse, y decir «rechazado» ante una caída de red le atribuye al motor un juicio
          // que no emitió
          titulo={errores.estado === 422 ? "El cálculo fue rechazado" : "No se pudo calcular"}
          // El código es lo que se cita al reportarlo; el mensaje es lo que resuelve la situación
          detalles={errores.detalles.map((d) => ({ codigo: d.codigo, mensaje: d.mensaje }))}
        />
      ) : null}

      {resultado && destino && calculado ? (
        <AgregarAlProyecto
          destino={destino}
          // Lo que se ve en el plano, no lo que está escrito ahora en la barra (`G-40`)
          tipoId={calculado.tipoId}
          ancho={calculado.ancho}
          alto={calculado.alto}
          alAgregar={(documento) => setDestino({ ...destino, items: documento.items.length })}
        />
      ) : null}

      {resultado ? (
        <ResultadoCalculo
          despiece={resultado}
          puedeVerDinero={puedeVerDinero}
          insumoResaltado={insumoResaltado}
          alResaltar={setInsumoResaltado}
        />
      ) : errores ? null : (
        <p className="text-muted-foreground flex flex-1 items-center justify-center gap-2 py-16 text-sm">
          <Info className="size-4" />
          Escriba las medidas del vano y presione «Calcular».
        </p>
      )}
    </div>
  );
}

/**
 * Para quién se cotiza, y el camino de vuelta. El cotizador se queda tras agregar (`52-brief-ficha` § 10):
 * un trabajo trae varias ventanas seguidas, y la vuelta a la ficha está siempre a un toque.
 */
function CabeceraDestino({ destino }: { destino: DestinoDeCotizacion }) {
  return (
    <div className="bg-muted/40 flex flex-col gap-2 rounded-lg border px-3 py-2 md:flex-row md:items-center md:justify-between">
      <p className="min-w-0 text-sm">
        <span className="text-muted-foreground">Cotizando para </span>
        <span className="font-mono">{destino.codigo}</span>
        <span className="text-muted-foreground"> · v{destino.version} borrador · </span>
        <span className="font-medium break-words">{destino.nombre}</span>
      </p>
      <Button asChild variant="outline" size="sm" className="h-11 shrink-0 md:h-8">
        <Link href={`/proyectos/${destino.proyectoId}?pestana=cotizacion`}>
          <ArrowLeft className="size-4" />
          Volver al proyecto ({destino.items} {destino.items === 1 ? "ítem" : "ítems"})
        </Link>
      </Button>
    </div>
  );
}
