"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { BarraFijaMovil } from "@/components/comunes/barra-fija-movil";
import { Notificacion } from "@/components/comunes/notificacion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contenidoLegible } from "@/features/materiales/contenido";
import { diferencia } from "@/features/materiales/diferencia";
import { CLASES } from "@/features/materiales/textos";
import type { Clase, InsumoFila } from "@/features/materiales/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";
import { moneda, plural } from "@/lib/formato";
import { notificar } from "@/lib/notificar";
import { cn } from "@/lib/utils";

const aNumero = (texto: string) => Number(texto.trim().replace(",", "."));

/** El precio que se carga es el de la presentación de compra, como lo da el proveedor (decisión 48) */
const actualDe = (i: InsumoFila) => i.compra?.precio ?? 0;

/**
 * La lista del proveedor (`materiales/52-brief-materiales`, decisión 47). Por fila: el precio actual, el nuevo y la
 * diferencia —en soles y en %—, y un cambio de más del 50 % se marca sin bloquear: es el error de tecla más caro. Se
 * manda **solo lo que cambió**, en un lote que es todo o nada (`MAT-I10`). De primera en el escritorio.
 */
export function CargarPrecios({ insumos }: { insumos: InsumoFila[] }) {
  const router = useRouter();
  const [nuevos, setNuevos] = useState<Record<string, string>>({});
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cambios = insumos.filter((i) => {
    const t = nuevos[i.id]?.trim();
    return t !== undefined && t !== "" && !Number.isNaN(aNumero(t)) && aNumero(t) !== actualDe(i);
  });
  const invalidos = insumos.filter((i) => {
    const t = nuevos[i.id]?.trim();
    return t !== undefined && t !== "" && (Number.isNaN(aNumero(t)) || aNumero(t) < 0);
  });

  // Salir con precios escritos y sin guardar pregunta primero: son minutos de trabajo con la lista al lado
  useEffect(() => {
    if (cambios.length === 0) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [cambios.length]);

  async function guardar() {
    setEnviando(true);
    setError(null);
    const respuesta = await pedir<{ cambiados: number; cotizaciones_desactualizadas: number }>("/api/v1/insumos/precios", {
      method: "PATCH",
      body: JSON.stringify({
        motivo: motivo.trim() || null,
        precios: cambios.map((i) => ({ id: i.id, precio_unitario: nuevos[i.id].trim().replace(",", ".") })),
      }),
    });
    setEnviando(false);

    if (!respuesta.ok) {
      setError(mensajeDeError(respuesta.error));
      return;
    }

    const { cambiados, cotizaciones_desactualizadas: n } = respuesta.datos;
    notificar({
      tono: n > 0 ? "advertencia" : "exito",
      titulo: `${plural(cambiados, "precio cambiado", "precios cambiados")}`,
      descripcion: n > 0 ? `${plural(n, "cotización emitida quedó desactualizada", "cotizaciones emitidas quedaron desactualizadas")}.` : "Ninguna cotización emitida los usaba.",
    });
    setNuevos({});
    router.refresh();
  }

  const porClase = (Object.keys(CLASES) as Clase[]).map((clase) => [clase, insumos.filter((i) => i.clase === clase)] as const).filter(([, filas]) => filas.length > 0);
  const boton = (
    <Button variant="brand" className="h-11 w-full md:h-9 md:w-auto" onClick={guardar} disabled={enviando || cambios.length === 0 || invalidos.length > 0}>
      {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
      Guardar precios
    </Button>
  );

  return (
    <div className="flex flex-col gap-4 pb-24 md:pb-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md flex-1 space-y-1.5">
          <Label htmlFor="precios-motivo">Motivo, para todos (opcional)</Label>
          <Input id="precios-motivo" className="h-11 md:h-9" maxLength={200} value={motivo} placeholder="Lista de octubre del proveedor" onChange={(e) => setMotivo(e.target.value)} />
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <span className="text-muted-foreground text-sm">{cambios.length === 0 ? "Sin cambios" : plural(cambios.length, "cambia", "cambian")}</span>
          {boton}
        </div>
      </div>

      {error ? <Notificacion tono="error">{error}</Notificacion> : null}
      {invalidos.length > 0 ? <Notificacion tono="error">Hay precios que no son un número válido o son negativos: corríjalos para guardar.</Notificacion> : null}

      {porClase.map(([clase, filas]) => (
        <section key={clase} className="bg-card overflow-hidden rounded-md border shadow-sm">
          <h2 className="bg-muted/40 px-3 py-2 text-xs font-semibold tracking-wide uppercase">{CLASES[clase]}</h2>
          <table className="w-full text-sm">
            <thead className="text-muted-foreground sr-only text-left text-xs md:not-sr-only">
              <tr>
                <th className="px-3 py-2 font-medium">Insumo</th>
                <th className="hidden px-3 py-2 text-right font-medium md:table-cell">Actual</th>
                <th className="px-3 py-2 text-right font-medium">Nuevo</th>
                <th className="hidden px-3 py-2 font-medium md:table-cell">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filas.map((i) => {
                const texto = nuevos[i.id] ?? "";
                const cambio = texto.trim() === "" ? null : diferencia(actualDe(i), aNumero(texto));
                return (
                  <tr key={i.id}>
                    <td className="px-3 py-2">
                      <span className="font-mono font-semibold">{i.codigo}</span> <span>{i.nombre_comercial}</span>
                      <span className="text-muted-foreground block text-xs">
                        {i.compra ? `por ${i.compra.nombre} (${contenidoLegible(i.tipo_medida, i.compra)})` : ""}
                        <span className="md:hidden"> · actual {moneda(actualDe(i))}</span>
                      </span>
                      {cambio ? (
                        <span className={cn("block text-xs md:hidden", cambio.grande ? "text-warning-fuerte font-medium" : "text-muted-foreground")}>
                          {cambio.texto}
                          {cambio.grande ? " · ¿seguro?" : ""}
                        </span>
                      ) : null}
                    </td>
                    <td className="hidden px-3 py-2 text-right font-mono tabular-nums md:table-cell">{moneda(actualDe(i))}</td>
                    <td className="w-32 px-3 py-2">
                      <Input
                        aria-label={`Precio nuevo de ${i.codigo}`}
                        inputMode="decimal"
                        className="h-11 text-right font-mono tabular-nums md:h-8"
                        value={texto}
                        onChange={(e) => setNuevos((n) => ({ ...n, [i.id]: e.target.value }))}
                      />
                    </td>
                    <td className={cn("hidden px-3 py-2 text-xs md:table-cell", cambio?.grande ? "text-warning-fuerte font-medium" : "text-muted-foreground")}>
                      {cambio ? `${cambio.texto}${cambio.grande ? " · ¿seguro?" : ""}` : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}

      <BarraFijaMovil>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground shrink-0 text-sm">{cambios.length === 0 ? "Sin cambios" : plural(cambios.length, "cambia", "cambian")}</span>
          {boton}
        </div>
      </BarraFijaMovil>
    </div>
  );
}
