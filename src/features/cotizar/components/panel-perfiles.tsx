"use client";

import type { ReactNode } from "react";
import { Crosshair } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeyendaDeCerteza, PieDelPlano } from "@/features/cotizar/components/pie-del-plano";
import { VentanaSVG } from "@/features/cotizar/components/ventana-svg";
import { leerInsumo, piezasUbicadas } from "@/features/cotizar/lectura-del-plano";
import { esPlanoV2, type Despiece, type GeometriaV2, type LineaDespiece } from "@/features/cotizar/types";
import {
  familiaDe,
  FAMILIAS,
  ORDEN_FAMILIAS,
  type Familia,
} from "@/lib/catalogo-visual";
import { medida, numero } from "@/lib/formato";
import { cn } from "@/lib/utils";

/**
 * Verificación de perfiles: dónde va cada pieza y cuánto mide.
 *
 * Es la respuesta a la pregunta que el taller hace de verdad —«¿dónde va el 8115 y de qué
 * largo lo corto?»— y la razón de que exista esta pestaña en vez de una leyenda más. Se
 * pulsa una pieza y el plano apaga todo lo demás y la redibuja encima, así que se ve
 * aunque en vista frontal quede detrás de otro perfil.
 *
 * Se activa con CLIC, no con el puntero encima. En la tablet del taller no hay hover, y
 * una función de verificación que solo aparece con ratón no existe para media plantilla.
 * Además, así el aislamiento se queda fijo mientras se mira el plano o se compara con la
 * pieza real que se tiene en la mano.
 *
 * Con el plano de la red (v2) TODA pieza se elige y se ve —también tocándola en el plano—, la
 * hipótesis del 3206 entra en la lista sin cortarse, y lo que no tiene sitio lo dice (`disenos/51-ui`).
 */
export function PanelPerfiles({
  despiece,
  insumoResaltado,
  alResaltar,
  velo = null,
}: {
  despiece: Despiece;
  insumoResaltado: string | null;
  alResaltar: (codigo: string | null) => void;
  /** Encima del plano si es de otras medidas (P8) */
  velo?: ReactNode;
}) {
  const plano = despiece.geometria && esPlanoV2(despiece.geometria) ? despiece.geometria : null;
  const grupos = agrupar(despiece, plano);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            Pulse una pieza para verla aislada en el plano.
          </p>

          {insumoResaltado ? (
            <Button variant="ghost" size="sm" onClick={() => alResaltar(null)}>
              Ver todo
            </Button>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          {ORDEN_FAMILIAS.filter((familia) => grupos[familia]?.length).map(
            (familia) => (
              <section key={familia} className="flex flex-col gap-1.5">
                <h3 className="text-xs font-medium">{FAMILIAS[familia].etiqueta}</h3>
                <p className="text-muted-foreground -mt-1 text-[11px]">
                  {FAMILIAS[familia].descripcion}
                </p>

                <ul className="mt-1 flex flex-col gap-1">
                  {grupos[familia].map((pieza) => {
                    const activo = insumoResaltado === pieza.codigo;

                    return (
                      <li key={pieza.codigo}>
                        <button
                          type="button"
                          onClick={() => alResaltar(activo ? null : pieza.codigo)}
                          aria-pressed={activo}
                          className={cn(
                            // 44px de área táctil: esto se usa en tablet, en el taller
                            "flex min-h-11 w-full items-start gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                            activo
                              ? "border-foreground/25 bg-muted"
                              : "hover:bg-muted/60 border-transparent",
                          )}
                        >
                          <span
                            aria-hidden
                            className="mt-1 size-3 shrink-0 rounded-[2px] ring-1 ring-black/10"
                            style={{ backgroundColor: pieza.color }}
                          />

                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-baseline gap-x-2">
                              <span className="font-mono text-sm font-medium">
                                {pieza.codigo}
                              </span>
                              <span className="text-sm">{pieza.nombre}</span>
                            </span>

                            {pieza.roles.length > 0 ? (
                              <span className="text-muted-foreground block text-[11px] leading-tight">
                                {pieza.roles.join(" · ")}
                              </span>
                            ) : null}

                            {/* Las medidas de corte: lo que el taller necesita leer */}
                            <span className="mt-0.5 block text-xs tabular-nums">
                              {pieza.cortes.join(" · ")}
                            </span>

                            {/* Lo que no es seguro, o no tiene sitio, se marca en la lista y no solo en el plano */}
                            {pieza.distintivos.length > 0 ? (
                              <span className="mt-1 flex flex-wrap gap-1">
                                {pieza.distintivos.map((d) => (
                                  <Badge
                                    key={d}
                                    variant="outline"
                                    className={cn("h-auto py-0 text-[11px]", d === "sin sitio" && "border-dashed")}
                                  >
                                    {d}
                                  </Badge>
                                ))}
                              </span>
                            ) : null}
                          </span>

                          <span className="text-muted-foreground shrink-0 pt-0.5 text-right text-xs tabular-nums">
                            {!pieza.seCorta ? (
                              <span className="block">no se corta</span>
                            ) : pieza.totalCm > 0 ? (
                              <>
                                <span className="block">total</span>
                                <span className="text-foreground block font-medium">
                                  {medida(pieza.totalCm)}
                                </span>
                              </>
                            ) : (
                              <span className="block">
                                {numero(pieza.cantidad, 0)} pz
                              </span>
                            )}
                          </span>

                          {activo ? (
                            <Crosshair className="text-foreground mt-1 size-4 shrink-0" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ),
          )}
        </div>
      </div>

      {plano ? (
        // En el móvil el plano va ARRIBA y se queda fijo bajo la barra de navegación, y la lista corre debajo:
        // elegir no obliga a desplazarse (P5; antes el plano quedaba 1.174 px por debajo de la pieza pulsada)
        <div className="bg-background sticky top-14 z-[11] order-first -mx-4 border-b px-4 pt-1 pb-2 lg:top-24 lg:z-auto lg:order-none lg:mx-0 lg:self-start lg:border-0 lg:p-0">
          <div className="relative">
            <VentanaSVG
              geometria={plano}
              ancho={despiece.metricas.ancho}
              alto={despiece.metricas.alto}
              insumoResaltado={insumoResaltado}
              alElegir={alResaltar}
              className="mx-auto h-auto max-h-[34svh] w-full lg:max-h-none"
            />
            {velo}
          </div>
          <LeyendaDeCerteza plano={plano} className="mt-1 justify-center" />
          <PieDelPlano plano={plano} despiece={despiece} insumo={insumoResaltado} className="mt-1.5 text-center" />
        </div>
      ) : despiece.geometria ? (
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative">
            <VentanaSVG
              geometria={despiece.geometria}
              ancho={despiece.metricas.ancho}
              alto={despiece.metricas.alto}
              insumoResaltado={insumoResaltado}
              className="h-auto w-full"
            />
            {velo}
          </div>

          <p className="text-muted-foreground mt-2 text-center text-xs">
            {insumoResaltado
              ? `Aislado ${insumoResaltado}: se dibuja por encima del resto y sus extremos van marcados. Las piezas apagadas siguen formando parte de la ventana.`
              : "Sin pieza seleccionada."}
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Este diseño todavía no declara geometría, así que no hay plano donde ubicar las
          piezas. Las medidas de la lista siguen siendo válidas.
        </p>
      )}
    </div>
  );
}

type PiezaAgrupada = {
  codigo: string;
  nombre: string;
  color: string;
  roles: string[];
  cantidad: number;
  totalCm: number;
  /** «4 × 140 cm», «2 × 60 × 30 cm»: cómo se corta realmente. */
  cortes: string[];
  /** Lo que el plano dice de su posición: «deducida», «hipótesis · no se corta», «sin sitio» */
  distintivos: string[];
  /** La hipótesis del 3206 se dibuja y no se corta: está en la lista sin total */
  seCorta: boolean;
};

/**
 * Una fila por insumo, no por regla.
 *
 * El motor puede emitir varias líneas del mismo código con roles distintos —el 8115 vive
 * en la hoja y en la junta— pero el aislamiento en el plano funciona por CÓDIGO: se
 * enciende el 8115 entero. Que la lista tuviera dos filas que hacen exactamente lo mismo
 * al pulsarlas sería desconcertante, así que se juntan y se enumeran sus roles y sus
 * medidas de corte, que es lo que de verdad distingue una línea de otra.
 *
 * Con el plano de la red, cada fila lleva lo que el plano sabe de su posición, y lo que se
 * DIBUJA sin cortarse —la hipótesis del 3206— entra también, al final de su familia (P6).
 */
function agrupar(despiece: Despiece, plano: GeometriaV2 | null): Record<Familia, PiezaAgrupada[]> {
  const grupos = {} as Record<Familia, PiezaAgrupada[]>;
  const porCodigo = new Map<string, { familia: Familia; pieza: PiezaAgrupada }>();

  for (const linea of despiece.despiece) {
    const existente = porCodigo.get(linea.insumo);
    const corte = describirCorte(linea);

    if (existente) {
      existente.pieza.cantidad += linea.cantidad;
      existente.pieza.totalCm += linea.total_cm ?? 0;

      if (linea.rol && !existente.pieza.roles.includes(linea.rol)) {
        existente.pieza.roles.push(linea.rol);
      }

      if (!existente.pieza.cortes.includes(corte)) {
        existente.pieza.cortes.push(corte);
      }

      continue;
    }

    porCodigo.set(linea.insumo, {
      familia: familiaDe(linea.rol, linea.clase),
      pieza: {
        codigo: linea.insumo,
        nombre: linea.nombre,
        color: linea.color,
        roles: linea.rol ? [linea.rol] : [],
        cantidad: linea.cantidad,
        totalCm: linea.total_cm ?? 0,
        cortes: [corte],
        distintivos: plano ? distintivosDe(plano, linea.insumo) : [],
        seCorta: true,
      },
    });
  }

  // Lo que el plano dibuja y no se corta no tiene línea en el despiece (`DIS-I08`): se lista igual
  if (plano) {
    for (const pieza of plano.piezas) {
      if (pieza.se_corta || porCodigo.has(pieza.insumo)) continue;

      const lectura = leerInsumo(piezasUbicadas(plano, pieza.insumo));

      porCodigo.set(pieza.insumo, {
        familia: familiaDe(pieza.rol, null),
        pieza: {
          codigo: pieza.insumo,
          nombre: pieza.rol ?? pieza.insumo,
          color: pieza.color,
          roles: [],
          cantidad: lectura.piezas,
          totalCm: 0,
          cortes: lectura.medidas,
          distintivos: distintivosDe(plano, pieza.insumo),
          seCorta: false,
        },
      });
    }
  }

  for (const { familia, pieza } of porCodigo.values()) {
    grupos[familia] = [...(grupos[familia] ?? []), pieza];
  }

  return grupos;
}

/** Lo que el plano sabe de la posición de un insumo, dicho en la lista (`DIS-04`, `DIS-05`) */
function distintivosDe(plano: GeometriaV2, insumo: string): string[] {
  if (plano.sin_sitio.some((s) => s.insumo === insumo)) return ["sin sitio"];

  const { posiciones } = leerInsumo(piezasUbicadas(plano, insumo));

  if (posiciones.includes("hipotesis")) return ["hipótesis · no se corta"];
  if (posiciones.includes("deducida")) return ["deducida"];

  return [];
}

/** Cómo se corta una línea, en el lenguaje del taller: «4 × 140 cm». */
function describirCorte(linea: LineaDespiece): string {
  const veces = `${numero(linea.cantidad, 0)} ×`;

  if (linea.tipo_medida === "lineal") {
    return `${veces} ${medida(linea.largo_cm)}`;
  }

  if (linea.tipo_medida === "area") {
    return `${veces} ${numero(linea.ancho_cm)} × ${medida(linea.alto_cm)}`;
  }

  return `${numero(linea.cantidad, 0)} unidades`;
}
