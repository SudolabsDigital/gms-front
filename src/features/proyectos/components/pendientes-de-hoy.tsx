import { ChevronRight, TriangleAlert } from "lucide-react";

import { Enlace } from "@/components/comunes/enlace";
import { PestanasConCifra } from "@/components/comunes/pestanas-con-cifra";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { rutaDeSeccion, type Seccion } from "@/features/proyectos/pestanas";
import { ETAPAS, ETAPAS_EN_CURSO } from "@/features/proyectos/textos";
import type { AsuntoPendiente, Pendientes } from "@/features/proyectos/types";
import { diaDe, diaLegible, haceDias, moneda, numero } from "@/lib/formato";
import { cn } from "@/lib/utils";

/*
 * Inicio, «qué hacer hoy» (`proyectos/54-brief-inicio`, decisión 43). Los asuntos llegan del servidor ya ordenados
 * por urgencia y solo si tienen pendientes: aquí no se compara una fecha ni un saldo (`G-32`). Cada tarjeta lleva a
 * donde se resuelve, y el color de advertencia es solo de lo vencido: si todo fuera amarillo, nada avisaría.
 */

type Proyecto = AsuntoPendiente["proyectos"][number];

const ASUNTOS: Record<
  AsuntoPendiente["clave"],
  { titulo: string; corto: string; seccion: Seccion | "corte"; detalle: (p: Proyecto) => string; todos: string }
> = {
  vencidas: {
    corto: "Vencidas",
    titulo: "Cotizaciones vencidas",
    seccion: "cotizacion",
    detalle: (p) => `venció el ${vence(p)} · recotizar`,
    todos: "/proyectos?etapa=cotizado",
  },
  por_vencer: {
    corto: "Por vencer",
    titulo: "Cotizaciones por vencer",
    seccion: "cotizacion",
    detalle: (p) => `vence el ${vence(p)}`,
    todos: "/proyectos?etapa=cotizado",
  },
  leads: {
    corto: "Leads sin cotizar",
    titulo: "Leads sin cotizar",
    seccion: "resumen",
    detalle: (p) => `llegó ${haceDias(p.etapa_desde)}`,
    todos: "/proyectos?etapa=lead",
  },
  sin_medir: {
    corto: "Sin medir",
    titulo: "Aprobados sin medir",
    seccion: "obra",
    detalle: (p) => `aprobado ${haceDias(p.etapa_desde)}`,
    todos: "/proyectos?etapa=aprobado",
  },
  produccion: {
    corto: "Corte por imprimir",
    titulo: "Listas de corte por imprimir",
    seccion: "corte",
    detalle: (p) => `en producción ${haceDias(p.etapa_desde)}`,
    todos: "/proyectos?etapa=produccion",
  },
  por_cobrar: {
    corto: "Por cobrar",
    titulo: "Por cobrar",
    seccion: "cobros",
    detalle: (p) => (p.saldo !== undefined ? `debe ${moneda(p.saldo)}` : `entregado ${haceDias(p.etapa_desde)}`),
    todos: "/proyectos?vista=por_cobrar",
  },
  // SEC.9c: lo cotizado que ni venció ni vence pronto; antes no salía en Inicio y se quedaba sin seguimiento
  esperando: {
    corto: "Esperando respuesta",
    titulo: "Cotizadas esperando respuesta",
    seccion: "cotizacion",
    detalle: (p) => `vence el ${vence(p)}`,
    todos: "/proyectos?etapa=cotizado",
  },
};

function vence(p: Proyecto): string {
  return p.vence_at ? diaLegible(diaDe(p.vence_at)) : "—";
}

/** A dónde lleva cada proyecto: la sección de la obra que lo resuelve, la hoja de corte incluida (SEC.9b) */
function destino(clave: AsuntoPendiente["clave"], p: Proyecto): string {
  return rutaDeSeccion(p.id, ASUNTOS[clave].seccion);
}

function Asunto({ asunto }: { asunto: AsuntoPendiente }) {
  const { titulo, detalle, todos } = ASUNTOS[asunto.clave];
  const vencido = asunto.clave === "vencidas";

  return (
    // El ancla de su cifra en la tira de arriba; el margen deja la tarjeta debajo de la barra de contexto
    <Card id={`asunto-${asunto.clave}`} className={cn("scroll-mt-[calc(var(--alto-barra-contexto)+1rem)]", vencido && "border-warning-fuerte/60")}>
      <CardHeader className="flex flex-row items-baseline justify-between gap-3 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {vencido ? <TriangleAlert aria-hidden className="text-warning-fuerte size-4" /> : null}
          {titulo}
        </CardTitle>
        <span className="font-mono text-sm tabular-nums">
          {asunto.total !== undefined ? moneda(asunto.total) : numero(asunto.recuento, 0)}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col pt-0">
        <ul className="divide-y">
          {asunto.proyectos.map((p) => (
            <li key={p.id}>
              <Enlace
                href={destino(asunto.clave, p)}
                className="hover:bg-muted/50 relative -mx-2 flex min-h-11 items-center gap-3 overflow-hidden rounded-md px-2 py-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="shrink-0 font-mono text-xs whitespace-nowrap">{p.codigo}</span>
                    <span className="line-clamp-2 text-sm font-medium break-words">{p.nombre}</span>
                  </span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {p.cliente} · {detalle(p)}
                  </span>
                </span>
                <ChevronRight aria-hidden className="text-muted-foreground size-4 shrink-0" />
              </Enlace>
            </li>
          ))}
        </ul>
        {asunto.recuento > asunto.proyectos.length ? (
          <Enlace href={todos} className="text-primary relative mt-1 flex min-h-11 items-center text-sm font-medium md:min-h-8">
            Ver los {numero(asunto.recuento, 0)}
          </Enlace>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** Todo al día: lo dice, y debajo lo que está en curso, que es lo que se viene a revisar cuando no hay urgencias */
function AlDia({ enCurso }: { enCurso: Pendientes["en_curso"] }) {
  const etapas = ETAPAS_EN_CURSO.filter((e) => (enCurso[e] ?? 0) > 0);

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <p className="font-medium">Nada urgente hoy.</p>
        {etapas.length > 0 ? (
          <p className="text-muted-foreground text-sm">
            En curso:{" "}
            {etapas.map((e, i) => (
              <span key={e}>
                {i > 0 ? " · " : ""}
                <Enlace href={`/proyectos?etapa=${e}`} className="text-foreground underline-offset-4 hover:underline">
                  {numero(enCurso[e] ?? 0, 0)} {ETAPAS[e].toLowerCase()}
                </Enlace>
              </span>
            ))}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">No hay proyectos en curso.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function PendientesDeHoy({ pendientes }: { pendientes: Pendientes }) {
  if (pendientes.asuntos.length === 0) return <AlDia enCurso={pendientes.en_curso} />;

  return (
    <>
      {/* Cuántos de cada cosa, de un vistazo y en orden de urgencia (SEC.9c); cada cifra lleva a su tarjeta. No
          filtra: Inicio enseña todo lo de hoy a la vez (decisión 43) */}
      <PestanasConCifra
        etiqueta="Lo de hoy, por asunto"
        opciones={pendientes.asuntos.map((asunto) => ({
          clave: asunto.clave,
          etiqueta: ASUNTOS[asunto.clave].corto,
          cifra: asunto.recuento,
          detalle: asunto.total !== undefined ? moneda(asunto.total) : undefined,
          // El color de advertencia es solo de lo vencido: si todo fuera amarillo, nada avisaría
          tono: asunto.clave === "vencidas" ? "aviso" : undefined,
          href: `#asunto-${asunto.clave}`,
          activa: false,
        }))}
      />
      <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
        {pendientes.asuntos.map((asunto) => (
          <Asunto key={asunto.clave} asunto={asunto} />
        ))}
      </div>
    </>
  );
}
