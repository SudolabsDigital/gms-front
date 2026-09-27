"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PESTANAS_RESULTADO = [
  { id: "modelo", etiqueta: "Modelo" },
  { id: "medidas", etiqueta: "Medidas" },
  { id: "perfiles", etiqueta: "Perfiles" },
  { id: "despiece", etiqueta: "Despiece" },
  // «Barras», no «Compra»: es el mínimo con que se costea, no una lista de compra (decisión 42, R21)
  { id: "compra", etiqueta: "Barras" },
  { id: "costeo", etiqueta: "Costeo" },
] as const;
import { FilaMonto } from "@/components/comunes/fila-monto";
import { StatTile } from "@/components/comunes/stat-tile";
import { TerminoTecnico } from "@/components/comunes/termino-tecnico";
import { PanelPerfiles } from "@/features/cotizar/components/panel-perfiles";
import { VentanaSVG } from "@/features/cotizar/components/ventana-svg";
import type { Despiece } from "@/features/cotizar/types";
import { medida, moneda, numero, porcentaje } from "@/lib/formato";

/**
 * El resultado del cálculo, repartido en pestañas.
 *
 * Del mismo cálculo salen documentos con públicos distintos, y confundirlos es el error
 * clásico de este tipo de sistema (negocio.md §5):
 *
 *   Despiece → taller   · Barras → costo   · Costeo → cliente
 *
 * El **modelo** abre la baraja y ocupa todo el alto disponible: es lo que se mira
 * mientras se ajustan medidas, y lo que hace que un tipo se entienda sin leer una tabla.
 * Lo demás queda a un clic, cada cosa para quien la necesita.
 */
export function ResultadoCalculo({
  despiece,
  puedeVerDinero,
  insumoResaltado,
  alResaltar,
}: {
  despiece: Despiece;
  puedeVerDinero: boolean;
  insumoResaltado: string | null;
  alResaltar: (codigo: string | null) => void;
}) {
  const { metricas, costeo } = despiece;
  const conCosteo = puedeVerDinero && costeo;

  return (
    <Tabs defaultValue="modelo" className="flex min-h-0 flex-1 flex-col gap-4">
      {/*
        Medido el 2026-09-24 a 390 px: con una fila, barra de desplazamiento visible, «Compra» cortada,
        «Costeo» escondida y 8 px de alto; a 44 px en una fila, 395 px en 358 y la página entera desplazaba.
        En el móvil van en tres columnas —el maestro, sin Costeo, ve 3 + 2—; «Costeo» es el dinero y no se
        esconde tras un desplazamiento
      */}
      {/* `group-data-horizontal/tabs:h-auto`: la variante fija `h-8` con ese prefijo y un `h-auto` suelto no la pisa */}
      <TabsList
        variant="line"
        className="grid w-full grid-cols-3 gap-0 border-b group-data-horizontal/tabs:h-auto md:flex md:justify-start md:gap-2"
      >
        {PESTANAS_RESULTADO.filter((p) => conCosteo || p.id !== "costeo").map((p) => (
          <TabsTrigger key={p.id} value={p.id} className="h-11 px-1 md:h-9 md:flex-none md:px-3">
            {p.etiqueta}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* ── Modelo ─────────────────────────────────────────────────────────── */}
      <TabsContent value="modelo" className="flex min-h-0 flex-1 flex-col">
        {despiece.geometria ? (
          <>
            <VentanaSVG
              geometria={despiece.geometria}
              ancho={metricas.ancho}
              alto={metricas.alto}
              className="mx-auto h-auto max-h-[68svh] w-full max-w-4xl"
            />
            <p className="text-muted-foreground mt-3 text-center text-xs">
              El plano lo calcula el motor en la misma pasada que el despiece: lo que se
              dibuja es exactamente lo que se corta.
            </p>
          </>
        ) : (
          <p className="text-muted-foreground py-16 text-center text-sm">
            Este diseño todavía no declara geometría, así que no se puede dibujar. El
            despiece y el costeo sí son válidos.
          </p>
        )}
      </TabsContent>

      {/* ── Medidas ────────────────────────────────────────────────────────── */}
      <TabsContent value="medidas">
        <Card>
          <CardContent className="grid grid-cols-2 gap-5 py-6 sm:grid-cols-3 lg:grid-cols-4">
            <StatTile
              etiqueta="Paneles"
              valor={numero(metricas.n_paneles, 0)}
              ayuda={`${numero(metricas.n_fijos, 0)} fijos · ${numero(metricas.n_deslizantes, 0)} corredizas`}
            />
            <StatTile
              etiqueta="Ancho de cada panel"
              valor={medida(metricas.ancho_panel)}
              ayuda="Lo que mide una hoja"
            />
            <StatTile
              etiqueta="Alto de la ventana"
              valor={medida(metricas.alto_ventana)}
              ayuda={`Sin el puente de ${medida(metricas.alto_puente)}`}
            />
            <StatTile
              etiqueta="Carriles"
              valor={numero(metricas.n_carriles, 0)}
              ayuda="Vías por las que se deslizan las hojas"
            />
            <StatTile
              etiqueta="Área"
              valor={medida(metricas.area_m2, "m²")}
              ayuda={`${numero(metricas.area_pie2)} pie², que es como se cobra`}
            />
            <StatTile
              etiqueta="Tiempo de armado"
              valor={medida(metricas.tiempo_hi_horas, "h")}
              ayuda="Habilitado más instalación (H+I)"
            />
            <StatTile
              etiqueta="Bloques"
              valor={numero(metricas.n_bloques, 0)}
              ayuda="Tramos contiguos de hojas corredizas"
            />
            <StatTile
              etiqueta="Juntas mixtas"
              valor={numero(metricas.n_juntas_mixtas, 0)}
              ayuda="Encuentros entre un panel fijo y una hoja"
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Perfiles: dónde va cada pieza ──────────────────────────────────── */}
      <TabsContent value="perfiles">
        <PanelPerfiles
          despiece={despiece}
          insumoResaltado={insumoResaltado}
          alResaltar={alResaltar}
        />
      </TabsContent>

      {/* ── Despiece: la lista de corte del taller ─────────────────────────── */}
      <TabsContent value="despiece">
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pieza</TableHead>
                  <TableHead className="text-right">Cant.</TableHead>
                  <TableHead className="text-right">Medida</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Regla</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despiece.despiece.map((linea, indice) => (
                  <TableRow key={`${linea.insumo}-${indice}`}>
                    <TableCell>
                      <TerminoTecnico
                        etiqueta={linea.rol ?? linea.nombre}
                        codigo={linea.insumo}
                        nombreComercial={linea.nombre}
                        color={linea.color}
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {numero(linea.cantidad)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {linea.tipo_medida === "lineal"
                        ? medida(linea.largo_cm)
                        : linea.tipo_medida === "area"
                          ? `${numero(linea.ancho_cm)} × ${medida(linea.alto_cm)}`
                          : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {linea.tipo_medida === "lineal"
                        ? medida(linea.total_cm)
                        : linea.tipo_medida === "area"
                          ? medida(linea.total_m2, "m²")
                          : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {linea.regla ?? "—"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <p className="text-muted-foreground mt-3 text-xs">
          El despiece de vidrio es una <strong>referencia de medida</strong>, no una orden
          de corte exacta: el descuento horizontal está en 0 por decisión del taller.
        </p>
      </TabsContent>

      {/* ── Barras: el mínimo con que se costea. La compra será su propio sistema (decisión 29) ── */}
      <TabsContent value="compra">
        <p className="text-muted-foreground mb-3 text-sm">
          Las barras mínimas con que se costea: sin empalmes ni merma de corte. No es una lista de compra; las compras
          tendrán su propio sistema.
        </p>
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insumo</TableHead>
                  <TableHead className="text-right">Se necesita</TableHead>
                  <TableHead className="text-right">Barras mínimas</TableHead>
                  <TableHead className="text-right">Presentación</TableHead>
                  <TableHead className="text-right">Sobra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despiece.compra.map((linea) => (
                  <TableRow key={linea.insumo}>
                    <TableCell>
                      <TerminoTecnico
                        etiqueta={linea.nombre}
                        codigo={linea.insumo}
                        color={linea.color}
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {medida(linea.requerido_cm)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {numero(linea.unidades, 0)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">
                      {linea.largo_barra_cm ? medida(linea.largo_barra_cm) : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {medida(linea.merma_cm)}
                      <span className="text-muted-foreground ml-1 text-xs">
                        ({porcentaje(linea.merma_pct)})
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <p className="text-muted-foreground mt-3 text-xs">
          «Sobra» es el recorte que queda de cada barra o rollo tras cortar las piezas. No
          es desperdicio seguro: puede servir para otra ventana.
        </p>
      </TabsContent>

      {/* ── Costeo: lo que ve el cliente ───────────────────────────────────── */}
      {conCosteo ? (
        <TabsContent value="costeo">
          <Card className="mx-auto max-w-md">
            <CardContent className="flex flex-col gap-3 py-6">
              <FilaMonto
                etiqueta="Material"
                valor={costeo.material}
                codigoMoneda={costeo.moneda}
                ayuda={
                  costeo.material === 0
                    ? "En cero: faltan los precios del proveedor"
                    : undefined
                }
              />
              <FilaMonto
                etiqueta="Mano de obra"
                valor={costeo.mano_obra}
                codigoMoneda={costeo.moneda}
                ayuda="Habilitado e instalación, por pie cuadrado"
              />
              <FilaMonto
                etiqueta="Transporte"
                valor={costeo.transporte}
                codigoMoneda={costeo.moneda}
              />

              <div className="mt-1 space-y-3 border-t pt-3">
                <FilaMonto
                  etiqueta="Subtotal"
                  valor={costeo.subtotal}
                  codigoMoneda={costeo.moneda}
                  ayuda={`Antes del margen de ${porcentaje(costeo.margen_pct)}`}
                />
                <FilaMonto
                  etiqueta="Total"
                  valor={costeo.total}
                  codigoMoneda={costeo.moneda}
                  destacado
                />
              </div>
            </CardContent>
          </Card>

          {costeo.material === 0 ? (
            <p className="text-muted-foreground mx-auto mt-3 max-w-md text-xs">
              El costo de material es {moneda(0, costeo.moneda)} porque los precios de
              insumos aún no se han capturado con el proveedor. La mano de obra sí es
              exacta.
            </p>
          ) : null}
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
