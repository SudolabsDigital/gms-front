import { CAMPOS, ETAPAS, ORIGENES, tituloDeEvento } from "@/features/proyectos/textos";
import type { Etapa, Evento, Origen } from "@/features/proyectos/types";
import { fechaHora } from "@/lib/formato";

/**
 * La historia del proyecto (`proyecto_eventos`, `PRY-09`): del más reciente al más antiguo, en el orden
 * en que se escribió (`secuencia`, `G-51`). Cada línea dice qué pasó, quién y cuándo; una corrección
 * de datos dice además qué había antes (decisión del usuario, 2026-09-23).
 */
export function HistoriaProyecto({ eventos }: { eventos: Evento[] }) {
  if (eventos.length === 0) {
    return <p className="text-muted-foreground text-sm">Sin movimientos todavía.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {eventos.map((evento) => (
        <li key={evento.id} className="border-l-2 pl-3">
          <p className="text-sm font-medium">{tituloDeEvento(evento)}</p>
          <p className="text-muted-foreground text-xs">
            {evento.actor.nombre} · {fechaHora(evento.created_at)}
          </p>
          {evento.motivo ? <p className="mt-1 text-sm">«{evento.motivo}»</p> : null}
          {evento.tipo === "datos_editados" && evento.datos ? (
            <ul className="text-muted-foreground mt-1 space-y-0.5 text-xs">
              {Object.entries(evento.datos).map(([campo, valores]) => (
                <li key={campo}>{describirCambio(campo, valores)}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function describirCambio(campo: string, valores: unknown): string {
  const nombre = CAMPOS[campo] ?? campo;

  // Los identificadores no le dicen nada a quien lee: basta saber que cambió
  if (campo === "cliente_id" || campo === "responsable_id" || !Array.isArray(valores)) {
    return `${nombre}: cambiado`;
  }

  const [antes, despues] = valores as [unknown, unknown];
  const legible = (v: unknown): string => {
    if (v === null || v === undefined || v === "") return "—";
    if (campo === "origen" && typeof v === "string") return ORIGENES[v as Origen] ?? v;
    if (campo === "etapa" && typeof v === "string") return ETAPAS[v as Etapa] ?? v;
    return String(v);
  };

  return `${nombre}: ${legible(antes)} → ${legible(despues)}`;
}
