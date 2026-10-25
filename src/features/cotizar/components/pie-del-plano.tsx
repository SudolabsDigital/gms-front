import type { ReactNode } from "react";

import {
  hayDudas,
  leerInsumo,
  piezasUbicadas,
  ROTULO_POSICION,
} from "@/features/cotizar/lectura-del-plano";
import type { Despiece, GeometriaV2, LineaDespiece } from "@/features/cotizar/types";
import { medida, numero } from "@/lib/formato";
import { cn } from "@/lib/utils";

/**
 * El pie del plano: dice LO CIERTO de la pieza elegida (`disenos/51-ui` P4, `DIS-I13`).
 *
 * Antes afirmaba «se dibuja por encima del resto» de piezas que no se dibujaban. Ahora cada frase sale de lo que el
 * plano tiene: cuántas piezas y en cuántos sitios, cuánto mide cada corte, si dos van una detrás de otra, con qué
 * certeza, y si no tiene sitio, por qué. Lo redacta y lo probó la sonda (`52-brief-plano` § 5).
 */
export function PieDelPlano({
  plano,
  despiece,
  insumo,
  className,
}: {
  plano: GeometriaV2;
  despiece: Despiece;
  insumo: string | null;
  className?: string;
}) {
  return (
    <p className={cn("text-muted-foreground text-xs leading-relaxed", className)} aria-live="polite">
      {insumo ? describir(plano, despiece, insumo) : "Toque una pieza para ver dónde va. Las apagadas siguen siendo parte de la ventana."}
    </p>
  );
}

function describir(plano: GeometriaV2, despiece: Despiece, insumo: string): ReactNode {
  const lineas = despiece.despiece.filter((l) => l.insumo === insumo);
  const piezas = piezasUbicadas(plano, insumo);
  const nombre = lineas[0]?.nombre ?? piezas[0]?.rol ?? null;
  const titulo = (
    <strong className="text-foreground">
      <span className="font-mono">{insumo}</span>
      {/* El U-13 se llama «U-13»: el nombre solo se dice si añade algo */}
      {nombre && nombre !== insumo ? ` · ${nombre}` : ""}
    </strong>
  );

  const sinSitio = plano.sin_sitio.find((s) => s.insumo === insumo);

  if (sinSitio) {
    return (
      <>
        {titulo} no tiene sitio en el plano todavía: <em>{sinSitio.motivo}</em>. Se corta igual: {cortesDe(lineas)}.
      </>
    );
  }

  const alojada = plano.piezas.find((p) => p.insumo === insumo && p.forma === "alojada");

  if (alojada) {
    return (
      <>
        {titulo} va dentro del <span className="font-mono">{alojada.anfitrion}</span>
        {(alojada.factor ?? 1) > 1 ? `, en sus ${numero(alojada.factor, 0)} caras` : ""}: {cortesDe(lineas)}.
      </>
    );
  }

  if (piezas.length === 0) {
    return (
      <>
        {titulo} se corta: {cortesDe(lineas)}.
      </>
    );
  }

  const lectura = leerInsumo(piezas);
  const posiciones = lectura.posiciones.map((p) => ROTULO_POSICION[p]).join(" · ");
  const certeza = (
    <span className={cn(lectura.posiciones.includes("hipotesis") && "text-foreground font-semibold")}>{posiciones}</span>
  );

  if (lectura.repartida) {
    return (
      <>
        {titulo} — se corta {lectura.medidas.join(" · ")} y se reparte en {numero(lectura.sitios, 0)} sitios · {certeza}
      </>
    );
  }

  const roles = lectura.porRol.length > 0 ? `: ${lectura.porRol.map((r) => `${numero(r.piezas, 0)} ${r.rol}`).join(" · ")}` : "";
  const cuanto = lectura.seCorta ? lectura.medidas.join(" · ") : `mide ${medida(lectura.mideSinCortar)}`;

  return (
    <>
      {titulo} — {numero(lectura.piezas, 0)} {lectura.piezas === 1 ? "pieza" : "piezas"} en {numero(lectura.sitios, 0)}{" "}
      {lectura.sitios === 1 ? "sitio" : "sitios"}
      {roles}
      {cuanto ? ` · ${cuanto}` : ""}
      {lectura.apilados > 0 ? (
        <strong className="text-foreground">
          {` · en ${numero(lectura.apilados, 0)} ${lectura.apilados === 1 ? "sitio van" : "sitios van"} ${
            lectura.porSitio === 2 ? "dos" : numero(lectura.porSitio, 0)
          }, una detrás de otra`}
        </strong>
      ) : null}{" "}
      · {certeza}
    </>
  );
}

/** «2 × 130 cm»: cómo se corta, desde el despiece (lo que no tiene sitio solo está ahí) */
function cortesDe(lineas: LineaDespiece[]): string {
  return lineas
    .map((l) =>
      l.tipo_medida === "lineal"
        ? `${numero(l.cantidad, 0)} × ${medida(l.largo_cm)}`
        : l.tipo_medida === "area"
          ? `${numero(l.cantidad, 0)} × ${numero(l.ancho_cm)} × ${medida(l.alto_cm)}`
          : `${numero(l.cantidad, 0)} ${l.cantidad === 1 ? "unidad" : "unidades"}`,
    )
    .join(" · ");
}

/**
 * El plano de OTRAS medidas, velado (P8, `G-40`): si lo escrito ya no es lo calculado, lo que se ve no puede
 * pasar por la ventana que se está cotizando. Antes quedaba a la vista sin marca, incluso con «Calcular» deshabilitado.
 */
export function VeloDeOtrasMedidas({ ancho, alto }: { ancho: string; alto: string }) {
  return (
    <div className="bg-background/75 absolute inset-0 z-10 flex items-center justify-center rounded-md backdrop-blur-[1px]">
      <p className="bg-background rounded-md border px-3 py-1.5 text-center text-xs font-medium shadow-xs">
        Plano de {ancho} × {alto} · vuelva a calcular
      </p>
    </div>
  );
}

/**
 * La certeza va en el trazo (P3): una línea bajo el plano, solo si hay algo que no esté confirmado. Las muestras
 * repiten los mismos trazos del plano, en píxeles.
 */
export function LeyendaDeCerteza({ plano, className }: { plano: GeometriaV2; className?: string }) {
  if (!hayDudas(plano)) return null;

  const muestra = (trazo?: string) => (
    <svg aria-hidden width="26" height="6" className="shrink-0">
      <line x1="1" y1="3" x2="25" y2="3" stroke="currentColor" strokeWidth="2.5" strokeDasharray={trazo} strokeLinecap="round" />
    </svg>
  );

  return (
    <p className={cn("text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs", className)}>
      <span className="flex items-center gap-1.5">{muestra()}confirmada</span>
      <span className="flex items-center gap-1.5">{muestra("6 4")}deducida</span>
      <span className="flex items-center gap-1.5">{muestra("0.1 5")}hipótesis, no se corta</span>
    </p>
  );
}
