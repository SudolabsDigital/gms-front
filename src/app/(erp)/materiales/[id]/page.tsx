import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/comunes/page-header";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { RUTA_INICIO } from "@/components/erp/navegacion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActividadInsumo } from "@/features/materiales/components/actividad-insumo";
import { CambiarPrecio } from "@/features/materiales/components/cambiar-precio";
import { PresentacionesInsumo } from "@/features/materiales/components/presentaciones-insumo";
import { contenidoLegible, UNIDAD_DEL_MOTOR } from "@/features/materiales/contenido";
import { EditarInsumo } from "@/features/materiales/components/editar-insumo";
import { CLASE, MEDIDAS } from "@/features/materiales/textos";
import type { InsumoFicha } from "@/features/materiales/types";
import { adelantar, ApiError, apiGet } from "@/lib/api-server";
import { fechaHora, haceDias, medida, moneda, numero } from "@/lib/formato";
import { puede } from "@/lib/permisos";
import { exigirUsuario } from "@/lib/session";

export const metadata: Metadata = {
  title: "Insumo · GMS Integra",
};

/**
 * La ficha de un insumo (`materiales/52-brief-materiales`, decisión 47: página propia). Leer primero —qué es, cuánto
 * cuesta, dónde se usa—; las acciones son secundarias y dependen del permiso.
 */
export default async function InsumoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const peticion = adelantar(apiGet<InsumoFicha>(`/insumos/${encodeURIComponent(id)}`));

  const usuario = await exigirUsuario();
  if (!puede(usuario, "catalogo:ver")) return <SinAcceso que="materiales" />;

  let insumo: InsumoFicha;
  try {
    insumo = await peticion;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const gestiona = puede(usuario, "catalogo:gestionar");
  const veDinero = insumo.precio_unitario !== undefined;
  const compra = insumo.presentaciones.find((p) => p.es_compra) ?? null;
  const precioCompra = compra?.precio ?? 0;
  const porCompra = compra ? `por ${compra.nombre} (${contenidoLegible(insumo.tipo_medida, compra)})` : "";
  const cambiaPrecios = puede(usuario, "precios:actualizar");
  const datos: [string, string][] = [
    ["Qué es", CLASE[insumo.clase]],
    ["Cómo se calcula", MEDIDAS[insumo.tipo_medida]],
    ["Material", insumo.material?.nombre ?? "—"],
    ["Serie", insumo.serie?.codigo ?? "Sin serie"],
    ...(insumo.largo_barra_cm !== null ? ([["Largo de barra o rollo", medida(insumo.largo_barra_cm)]] as [string, string][]) : []),
    ["Pieza única", insumo.requiere_pieza_unica ? "Sí: no admite empalme" : "No"],
    ["Peso", insumo.peso_kg_por_metro !== null ? `${numero(insumo.peso_kg_por_metro, 3)} kg/m` : "—"],
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <PageHeader
        migas={[{ etiqueta: "Inicio", href: RUTA_INICIO }, { etiqueta: "Materiales", href: "/materiales" }, { etiqueta: insumo.codigo }]}
        titulo={insumo.nombre_comercial}
        descripcion={`${insumo.codigo}${insumo.activo ? "" : " · inactivo"}`}
        acciones={
          <>
            {/* El precio de la compra, por la ruta del insumo: el de siempre (MAE.3), ahora de su presentación de compra */}
            {veDinero && cambiaPrecios && compra ? (
              <CambiarPrecio
                titulo={insumo.codigo}
                actual={precioCompra}
                por={porCompra}
                ruta={`/api/v1/insumos/${insumo.id}/precio`}
                campo="precio_unitario"
                leido={insumo.updated_at}
                compra
              />
            ) : null}
            {gestiona ? <EditarInsumo insumo={insumo} /> : null}
          </>
        }
      />

      <div className="grid items-start gap-4 md:grid-cols-2">
        {veDinero ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Precio</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p>
                <span className="font-mono text-2xl tabular-nums">{moneda(precioCompra)}</span>
                <span className="text-muted-foreground text-sm"> {porCompra}</span>
              </p>
              {/* Lo que el cálculo usa, derivado de la compra (decisión 48): en un vidrio no es lo mismo que la plancha */}
              {insumo.precio_unitario ? (
                <p className="text-muted-foreground text-sm">
                  El cálculo usa <span className="font-mono tabular-nums">{moneda(insumo.precio_unitario)}</span> {UNIDAD_DEL_MOTOR[insumo.tipo_medida]}
                  {insumo.tipo_medida === "lineal" && insumo.largo_barra_cm ? ` de ${medida(insumo.largo_barra_cm)}` : ""}.
                </p>
              ) : null}
              {insumo.precio_unitario === 0 ? (
                <p className="text-warning-fuerte text-sm font-medium">Sin precio: se cotiza a S/ 0 en material.</p>
              ) : insumo.precio_actualizado_at ? (
                <p className="text-muted-foreground text-sm">Cambió {haceDias(insumo.precio_actualizado_at)}.</p>
              ) : null}
              {insumo.historial && insumo.historial.length > 0 ? (
                <ol className="divide-y border-t text-sm">
                  {insumo.historial.map((h, i) => (
                    <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-3 py-2">
                      <span className="font-mono tabular-nums">
                        {moneda(h.precio_anterior)} → {moneda(h.precio_nuevo)}
                        {h.presentacion ? <span className="text-muted-foreground font-sans text-xs"> · {h.presentacion}</span> : null}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {fechaHora(h.fecha)}
                        {h.por ? ` · ${h.por}` : ""}
                      </span>
                      {h.motivo ? <span className="w-full text-xs">«{h.motivo}»</span> : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted-foreground text-xs">Sin cambios de precio todavía.</p>
              )}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cómo se compra</CardTitle>
          </CardHeader>
          <CardContent>
            <PresentacionesInsumo insumo={insumo} gestiona={gestiona} cambiaPrecios={veDinero && cambiaPrecios} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
              {datos.map(([etiqueta, valor]) => (
                <div key={etiqueta} className="contents">
                  <dt className="text-muted-foreground">{etiqueta}</dt>
                  <dd className="break-words">{valor}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dónde se usa</CardTitle>
          </CardHeader>
          <CardContent>
            {insumo.reglas.length === 0 ? (
              <p className="text-muted-foreground text-sm">Ninguna regla de cálculo lo usa.</p>
            ) : (
              <ul className="divide-y text-sm">
                {insumo.reglas.map((r) => (
                  <li key={r.id} className={r.activa ? "py-2" : "text-muted-foreground py-2"}>
                    <span className="font-mono font-semibold">{r.codigo}</span>
                    {r.rol ? ` · ${r.rol}` : ""}
                    <span className="text-muted-foreground block text-xs">
                      {r.ambito ?? "—"}
                      {r.como === "origen" ? " · como origen de otra pieza" : ""}
                      {r.activa ? "" : " · regla inactiva"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {gestiona ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Baja</CardTitle>
            </CardHeader>
            <CardContent>
              <ActividadInsumo insumo={insumo} />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
