import { CAMPOS, ETAPAS, MEDIOS_COBRO, ORIGENES, TIPOS_COBRO, tituloDeEvento } from "@/features/proyectos/textos";
import type { Etapa, Evento, MedioCobro, Origen, TipoCobro } from "@/features/proyectos/types";
import { diaLegible, fechaHora, moneda } from "@/lib/formato";

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
          {/* El sí del cliente (B.3): el día que dio —puede ser anterior al registro— y cómo llegó */}
          {evento.tipo === "cotizacion_aprobada" && evento.datos ? (
            <p className="mt-1 text-sm">
              Dijo que sí el {diaLegible(String(evento.datos.aprobada_el ?? ""))}
              {typeof evento.datos.nota === "string" ? ` · «${evento.datos.nota}»` : ""}
            </p>
          ) : null}
          {/* Un cobro dice qué fue (C.1); el monto solo llega con `costeo:ver` (`TipoEvento::clavesSinDinero`) */}
          {(evento.tipo === "cobro_registrado" || evento.tipo === "cobro_anulado") && evento.datos ? (
            <p className="mt-1 text-sm">{describirCobro(evento.datos)}</p>
          ) : null}
          {evento.tipo === "cotizacion_sustituida" && typeof evento.datos?.por_version === "number" ? (
            <p className="text-muted-foreground mt-1 text-xs">
              Por la v{evento.datos.por_version} · {String(evento.datos.por_numero ?? "")}
            </p>
          ) : null}
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

function describirCobro(datos: Record<string, unknown>): string {
  const partes = [
    TIPOS_COBRO[datos.tipo as TipoCobro] ?? String(datos.tipo ?? ""),
    typeof datos.fecha === "string" ? diaLegible(datos.fecha) : null,
    typeof datos.medio === "string" ? (MEDIOS_COBRO[datos.medio as MedioCobro] ?? datos.medio) : null,
    typeof datos.monto === "string" ? moneda(Number(datos.monto)) : null,
  ];

  return partes.filter(Boolean).join(" · ");
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
