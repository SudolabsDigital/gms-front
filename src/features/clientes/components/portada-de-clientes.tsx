import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { Enlace } from "@/components/comunes/enlace";
import { PestanasConCifra, type OpcionConCifra } from "@/components/comunes/pestanas-con-cifra";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { datosQueFaltan, type ResumenDeClientes } from "@/features/clientes/types";
import { InsigniaEtapa } from "@/features/proyectos/components/insignia-etapa";
import { diaDe, diaLegible, moneda, numero } from "@/lib/formato";

/**
 * La portada de Clientes (SEC.10, decisión 78): la lista está en el panel, y aquí lo que la lista no dice. Cuatro
 * cifras —cada una lleva a donde se actúa— y dos listas cortas: a quién pedirle el documento antes de cotizar y quién
 * llegó hace poco. Todo lo cuenta el servidor (`G-32`); aquí solo se dice qué falta, con la regla de la ficha.
 */
export function PortadaDeClientes({ resumen }: { resumen: ResumenDeClientes }) {
  const { deben, por_completar: porCompletar } = resumen;

  const cifras: OpcionConCifra[] = [
    {
      clave: "clientes",
      etiqueta: "Clientes",
      cifra: resumen.total,
      detalle: `+${numero(resumen.nuevos_30_dias, 0)} en 30 días`,
      href: "#recientes",
      activa: false,
    },
    { clave: "en-curso", etiqueta: "Con obra en curso", cifra: resumen.con_obra_en_curso, href: "/proyectos", activa: false },
    // Lo que se debe, solo con `costeo:ver`; lleva a «Por cobrar» de Proyectos, donde se registra el cobro
    ...(deben
      ? [
          {
            clave: "deben",
            etiqueta: "Deben",
            cifra: deben.clientes,
            detalle: deben.clientes > 0 ? moneda(deben.total) : undefined,
            tono: deben.clientes > 0 ? ("aviso" as const) : undefined,
            href: "/proyectos?vista=por_cobrar",
            activa: false,
          },
        ]
      : []),
    { clave: "por-completar", etiqueta: "Sin DNI ni RUC", cifra: porCompletar.total, href: "#por-completar", activa: false },
  ];

  return (
    <>
      <PestanasConCifra etiqueta="Los clientes, de un vistazo" opciones={cifras} />

      <div className="grid items-start gap-3 md:grid-cols-2">
        <Lista
          id="por-completar"
          titulo="Por completar"
          descripcion="Sin DNI ni RUC y con una obra en curso: su cotización saldría sin documento."
          vacio="Todos los que tienen una obra en curso tienen su DNI o RUC."
          resto={
            porCompletar.total > porCompletar.clientes.length
              ? `Se ven ${porCompletar.clientes.length} de ${numero(porCompletar.total, 0)}: los de obra movida más recientemente.`
              : null
          }
        >
          {porCompletar.clientes.map((c) => (
            <Fila
              key={c.id}
              href={`/clientes/${c.id}`}
              titulo={c.nombre}
              detalle={`Falta: ${datosQueFaltan(c).join(", ")}`}
              extremo={<InsigniaEtapa etapa={c.obra.etapa} />}
            />
          ))}
        </Lista>

        <Lista
          id="recientes"
          titulo="Recientes"
          descripcion={`${numero(resumen.nuevos_30_dias, 0)} en los últimos 30 días.`}
          vacio="Todavía no hay clientes. Nacen al crear un proyecto."
        >
          {resumen.recientes.map((c) => (
            <Fila
              key={c.id}
              href={`/clientes/${c.id}`}
              titulo={c.nombre}
              detalle={c.telefono ?? "Sin teléfono"}
              extremo={<span className="text-muted-foreground font-mono text-xs">{diaLegible(diaDe(c.created_at))}</span>}
            />
          ))}
        </Lista>
      </div>
    </>
  );
}

function Lista({
  id,
  titulo,
  descripcion,
  vacio,
  resto,
  children,
}: {
  id: string;
  titulo: string;
  descripcion: string;
  vacio: string;
  resto?: string | null;
  children: ReactNode[];
}) {
  return (
    // El ancla de su cifra; el margen la deja debajo de la barra de contexto
    <Card id={id} className="scroll-mt-[calc(var(--alto-barra-contexto)+1rem)]">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <p className="text-muted-foreground text-sm">{descripcion}</p>
      </CardHeader>
      <CardContent className="flex flex-col pt-0">
        {children.length === 0 ? (
          <p className="text-muted-foreground text-sm">{vacio}</p>
        ) : (
          <ul className="divide-y">{children}</ul>
        )}
        {resto ? <p className="text-muted-foreground mt-2 text-xs">{resto}</p> : null}
      </CardContent>
    </Card>
  );
}

function Fila({ href, titulo, detalle, extremo }: { href: string; titulo: string; detalle: string; extremo: ReactNode }) {
  return (
    <li>
      <Enlace
        href={href}
        className="hover:bg-muted/50 relative -mx-2 flex min-h-11 items-center gap-3 overflow-hidden rounded-md px-2 py-2"
      >
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-sm font-medium break-words">{titulo}</span>
          <span className="text-muted-foreground block truncate text-xs">{detalle}</span>
        </span>
        {extremo}
        <ChevronRight aria-hidden className="text-muted-foreground size-4 shrink-0" />
      </Enlace>
    </li>
  );
}
