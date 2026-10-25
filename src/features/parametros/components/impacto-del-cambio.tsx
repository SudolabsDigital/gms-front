import { Notificacion } from "@/components/comunes/notificacion";
import type { ImpactoEnTipo, PruebaDeParametro } from "@/features/parametros/types";
import { TiraComposicion } from "@/features/plantillas/components/tira-composicion";
import { numero, plural } from "@/lib/formato";

/**
 * Las líneas que cambian, dichas como se piensan: la API da cada medida con su cantidad antes y después, así que una
 * pieza que cambia de largo llega como dos líneas —«140 cm: 8 → 0» y «135 cm: 0 → 8»—. Las de un mismo insumo que se
 * quitan y se ponen, en el mismo orden y con la misma cantidad, se leen juntas: «8 de 140 cm → 135 cm».
 */
function cambiosLegibles(lineas: ImpactoEnTipo["lineas"]): { insumo: string; texto: string }[] {
  const cambios: { insumo: string; texto: string }[] = [];

  for (const insumo of [...new Set(lineas.map((l) => l.insumo))]) {
    const delInsumo = lineas.filter((l) => l.insumo === insumo);
    const quitadas = delInsumo.filter((l) => l.despues === 0);
    const puestas = delInsumo.filter((l) => l.antes === 0);
    const emparejan = quitadas.length > 0 && quitadas.length === puestas.length && quitadas.every((q, i) => q.antes === puestas[i].despues);

    if (emparejan) {
      quitadas.forEach((q, i) => cambios.push({ insumo, texto: `${numero(q.antes)} de ${q.medida} → ${puestas[i].medida}` }));
      delInsumo
        .filter((l) => l.antes !== 0 && l.despues !== 0)
        .forEach((l) => cambios.push({ insumo, texto: `${l.medida}: ${numero(l.antes)} → ${numero(l.despues)}` }));
      continue;
    }

    delInsumo.forEach((l) => cambios.push({ insumo, texto: `${l.medida}: ${numero(l.antes)} → ${numero(l.despues)}` }));
  }

  return cambios;
}

/**
 * Lo que pasaría con el valor nuevo (decisión 82, `series/50-api` § cambiar el cálculo): cuántos tipos cambian y qué
 * líneas de corte, qué casos del cuaderno dejan de cuadrar y cuántas emitidas se desactualizarán. Se lee antes de guardar;
 * no escribe nada.
 */
export function ImpactoDelCambio({ prueba }: { prueba: PruebaDeParametro }) {
  const cambian = prueba.impacto.filter((t) => t.error !== null || t.lineas.length > 0 || t.sitios.length > 0);
  const igual = prueba.impacto.filter((t) => !cambian.includes(t));
  const cuaderno = prueba.cuaderno;
  const cotizaciones = prueba.cotizaciones_a_desactualizar;

  return (
    <section aria-label="Qué cambia" className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1 text-sm">
        <li>
          {cambian.length === 0
            ? "Ningún tipo cambia su corte ni sus piezas."
            : `Cambia${cambian.length === 1 ? "" : "n"} ${plural(cambian.length, "tipo", "tipos")} de ${prueba.impacto.length}.`}
        </li>
        <li>
          {cotizaciones === 0
            ? "Ninguna cotización emitida quedará desactualizada."
            : `${plural(cotizaciones, "cotización emitida quedará desactualizada", "cotizaciones emitidas quedarán desactualizadas")}: el cliente tiene la de antes.`}
        </li>
      </ul>

      {cuaderno && cuaderno.no_cuadran > 0 ? (
        <Notificacion tono="advertencia" titulo={`${cuaderno.no_cuadran} de ${cuaderno.casos} casos del cuaderno no cuadran con este valor`}>
          El cálculo sigue funcionando. Para volver a publicar el diseño, Sudolabs actualiza esos casos en código.
        </Notificacion>
      ) : null}

      {cambian.length > 0 ? (
        <ul className="bg-muted/30 flex max-h-72 flex-col divide-y overflow-y-auto rounded-md border text-sm">
          {cambian.map((tipo) => (
            <li key={tipo.tipo} className="flex flex-col gap-1.5 px-3 py-2">
              <div className="flex items-center gap-2">
                <TiraComposicion composicion={tipo.composicion} className="h-5 w-14 shrink-0" />
                <span className="font-mono text-xs font-semibold">{tipo.tipo}</span>
                <span className="text-muted-foreground text-xs">
                  {numero(tipo.ancho)} × {numero(tipo.alto)} cm
                </span>
              </div>
              {tipo.error ? <p className="text-destructive-fuerte text-sm">No se calcula: {tipo.error}</p> : null}
              {tipo.lineas.length > 0 ? (
                <ul className="flex flex-col gap-0.5">
                  {cambiosLegibles(tipo.lineas).map((cambio, i) => (
                    <li key={`${cambio.insumo}-${i}`} className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
                      <span className="font-mono text-xs font-semibold">{cambio.insumo}</span>
                      <span>{cambio.texto}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {tipo.sitios.length > 0 ? (
                <p className="text-muted-foreground text-xs">
                  En el plano cambian de sitio: {tipo.sitios.map((s) => `${s.codigo} (${s.insumo})`).join(", ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {igual.length > 0 && cambian.length > 0 ? (
        <p className="text-muted-foreground text-xs">Sin cambios: {igual.map((t) => t.tipo).join(", ")}.</p>
      ) : null}
    </section>
  );
}
