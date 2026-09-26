"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Ruler } from "lucide-react";
import { toast } from "sonner";

import { AvisoDeError } from "@/components/comunes/aviso-de-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VentanaSVG } from "@/features/cotizar/components/ventana-svg";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import type { Cotizacion, ItemMedido, Medicion, ProyectoFicha } from "@/features/proyectos/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";
import { fechaHora, medida, numero } from "@/lib/formato";
import { cn } from "@/lib/utils";

type Cotas = Record<string, { ancho: string; alto: string }>;

/** «−3 cm», «+0,5 cm»; `null` si coincide. Son cotas, no importes: la resta es de presentación, antes de enviar */
function diferencia(escrito: string, cotizado: number): string | null {
  const valor = Number(escrito.replace(",", "."));
  if (escrito.trim() === "" || Number.isNaN(valor)) return null;
  const d = Math.round((valor - cotizado) * 1000) / 1000;
  if (d === 0) return null;
  return `${d > 0 ? "+" : "−"}${numero(Math.abs(d), 1)} cm`;
}

/**
 * La medición en obra (`proyectos/51-ui` § la medición, tajada C.2, decisión 28): **se hace de pie en la obra**, así
 * que el móvil manda. Una tarjeta por ítem —dibujo, ubicación, cota cotizada— con dos campos grandes **precargados**:
 * medir y coincidir es no tocar nada. Cada campo que cambia marca la diferencia en el acto.
 *
 * Qué coincide lo decide el servidor, al milímetro (`PRY-I26`); aquí solo se enseña. Si algo difiere, el único
 * camino es **recotizar con estas medidas**: la versión nueva la aprueba el cliente y se vuelve a confirmar.
 */
export function MedicionEnObra({
  proyecto,
  vigente,
  puedeMedir,
  puedeRecotizar,
}: {
  proyecto: ProyectoFicha;
  /** El documento vigente, con sus ítems y el dibujo del motor */
  vigente: Cotizacion;
  puedeMedir: boolean;
  puedeRecotizar: boolean;
}) {
  const router = useRouter();
  const precargadas = (): Cotas =>
    Object.fromEntries(vigente.items.map((i) => [i.id, { ancho: String(i.ancho_cm), alto: String(i.alto_cm) }]));
  const [cotas, setCotas] = useState<Cotas>(precargadas);
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const medicion = proyecto.medicion;
  const sePuedeMedir = puedeMedir && proyecto.etapa === "aprobado";

  function cambiar(id: string, eje: "ancho" | "alto", valor: string) {
    setCotas((antes) => ({ ...antes, [id]: { ...antes[id], [eje]: valor } }));
  }

  async function enviar() {
    setEnviando(true);
    setError(null);
    const respuesta = await pedir<ProyectoFicha>(`/api/v1/proyectos/${proyecto.id}/medicion`, {
      method: "POST",
      body: JSON.stringify({
        medidas: vigente.items.map((i) => ({
          cotizacion_item_id: i.id,
          ancho_cm: cotas[i.id].ancho.replace(",", "."),
          alto_cm: cotas[i.id].alto.replace(",", "."),
        })),
        nota: nota.trim() || null,
        updated_at: proyecto.updated_at,
      }),
    });
    setEnviando(false);

    if (!respuesta.ok) {
      setError(mensajeDeError(respuesta.error));
      if (respuesta.error.estado === 409) router.refresh();
      return;
    }

    const resultado = respuesta.datos.medicion;
    if (resultado?.estado === "confirmada") {
      toast.success("Medición confirmada", { description: "Todas las cotas coinciden: ya se puede pasar a producción." });
    } else {
      const distintas = resultado?.items.filter((i) => !i.coincide).length ?? 0;
      toast.warning(`${distintas} ${distintas === 1 ? "ítem no coincide" : "ítems no coinciden"} con la v${vigente.version}`, {
        description: "Para cortar lo medido hay que recotizar con estas medidas.",
      });
    }
    setNota("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {medicion ? (
        <ResultadoDeMedicion
          medicion={medicion}
          version={vigente.version}
          proyectoId={proyecto.id}
          puedeRecotizar={puedeRecotizar && proyecto.etapa === "aprobado"}
        />
      ) : null}

      {sePuedeMedir ? (
        <Card id="medir" className="scroll-mt-4">
          <CardHeader className="gap-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Ruler className="size-4" />
              {medicion ? "Volver a medir" : "Confirmar la medición"} · v{vigente.version}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Cada cota viene con la de la cotización. Si coincide, no la toque; si no, escriba la de obra.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {vigente.items.map((item) => {
                const dAncho = diferencia(cotas[item.id].ancho, item.ancho_cm);
                const dAlto = diferencia(cotas[item.id].alto, item.alto_cm);
                return (
                  <li key={item.id} className="rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted/40 flex size-14 shrink-0 items-center justify-center rounded-md border p-1">
                        {item.geometria ? (
                          <VentanaSVG geometria={item.geometria} ancho={item.ancho_cm} alto={item.alto_cm} mostrarCotas={false} className="size-full" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold break-words">{item.ubicacion ?? item.tipo.nombre}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.ubicacion ? `${item.tipo.nombre} · ` : ""}×{item.cantidad} · cotizado{" "}
                          <span className="font-mono">
                            {medida(item.ancho_cm)} × {medida(item.alto_cm)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {(["ancho", "alto"] as const).map((eje) => {
                        const d = eje === "ancho" ? dAncho : dAlto;
                        return (
                          <div key={eje} className="space-y-1">
                            <Label htmlFor={`medida-${item.id}-${eje}`}>{eje === "ancho" ? "Ancho (cm)" : "Alto (cm)"}</Label>
                            <Input
                              id={`medida-${item.id}-${eje}`}
                              inputMode="decimal"
                              className={cn("h-12 font-mono text-lg tabular-nums", d && "border-primary")}
                              value={cotas[item.id][eje]}
                              onChange={(e) => cambiar(item.id, eje, e.target.value)}
                            />
                            <p className={cn("text-xs", d ? "text-primary font-semibold" : "text-muted-foreground")}>
                              {d ?? "coincide"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-1.5">
              <Label htmlFor="medicion-nota">Nota de obra (opcional)</Label>
              <Textarea
                id="medicion-nota"
                rows={2}
                maxLength={500}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Vano fuera de escuadra · Falta el tarrajeo · Acceso por la azotea…"
              />
            </div>

            {error ? <AvisoDeError>{error}</AvisoDeError> : null}

            <Button variant="brand" className="h-11 md:h-9" onClick={enviar} disabled={enviando}>
              {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
              Registrar medición
            </Button>
          </CardContent>
        </Card>
      ) : !medicion ? (
        <Card>
          <CardContent className="text-muted-foreground pt-6 text-sm">
            {proyecto.etapa === "lead" || proyecto.etapa === "cotizado"
              ? "Se mide en obra cuando el cliente aprueba la cotización: antes de cortar, cada cota se confirma en el sitio."
              : "No hay medición registrada de la cotización vigente."}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

/** Lo que dijo la última medición de la vigente: confirmada, o qué no coincide y el único camino que queda */
function ResultadoDeMedicion({
  medicion,
  version,
  proyectoId,
  puedeRecotizar,
}: {
  medicion: Medicion;
  version: number;
  proyectoId: string;
  puedeRecotizar: boolean;
}) {
  const distintas = medicion.items.filter((i) => !i.coincide);

  if (medicion.estado === "confirmada") {
    return (
      <div className="flex items-start gap-2 rounded-md border px-3 py-2 text-sm">
        <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">Medición confirmada · v{version}</p>
          <p className="text-muted-foreground text-xs">{fechaHora(medicion.registrada_at)} · todas las cotas coinciden</p>
          {medicion.nota ? <p className="mt-1">«{medicion.nota}»</p> : null}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="gap-1">
        <CardTitle className="text-base">
          Las medidas no coinciden con la v{version}
        </CardTitle>
        <p className="text-muted-foreground text-xs">{fechaHora(medicion.registrada_at)}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-col gap-1 text-sm">
          {distintas.map((i) => (
            <li key={i.cotizacion_item_id}>
              <span className="font-medium">{i.ubicacion ?? i.tipo}</span>:{" "}
              <span className="font-mono">
                {medida(i.ancho_cotizado)} × {medida(i.alto_cotizado)} → {medida(i.ancho_medido)} × {medida(i.alto_medido)}
              </span>
            </li>
          ))}
        </ul>
        {medicion.nota ? <p className="text-sm">«{medicion.nota}»</p> : null}
        {puedeRecotizar ? <RecotizarConMedidas proyectoId={proyectoId} items={medicion.items} /> : null}
      </CardContent>
    </Card>
  );
}

/**
 * «Recotizar con estas medidas» (C.2, decisión 28): la versión nueva nace con las cotas de obra y el motor recalcula.
 * Antes dice la consecuencia, que es la que el usuario eligió (`51-ui`). Si hay un borrador con líneas, el servidor
 * no lo toca (`BORRADOR_CON_LINEAS`) y su mensaje dice cómo seguir.
 */
function RecotizarConMedidas({ proyectoId, items }: { proyectoId: string; items: ItemMedido[] }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function recotizar() {
    setEnviando(true);
    setError(null);
    const respuesta = await pedir<Cotizacion>(`/api/v1/proyectos/${proyectoId}/cotizaciones`, {
      method: "POST",
      body: JSON.stringify({
        medidas: items.map((i) => ({ cotizacion_item_id: i.cotizacion_item_id, ancho_cm: i.ancho_medido, alto_cm: i.alto_medido })),
      }),
    });
    setEnviando(false);

    if (!respuesta.ok) {
      setError(mensajeDeError(respuesta.error));
      return;
    }

    toast.success(`v${respuesta.datos.version} con las medidas de obra`, { description: "Revísela y emítala: el cliente la aprueba de nuevo." });
    setAbierto(false);
    router.push(`/proyectos/${proyectoId}?pestana=cotizacion`);
    router.refresh();
  }

  return (
    <>
      <Button variant="brand" className="h-11 md:h-9" onClick={() => { setAbierto(true); setError(null); }}>
        Recotizar con estas medidas
      </Button>
      <PanelResponsivo
        abierto={abierto}
        alCambiar={setAbierto}
        titulo="Recotizar con las medidas de obra"
        descripcion="La versión nueva tendrá que aprobarla el cliente. El proyecto vuelve a Cotizado al emitirla; los cobros se conservan."
      >
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Cada ventana se recalcula con la medida de obra y los precios de hoy. Después de aprobarla, se confirma la
            medición otra vez: un toque, porque ya trae estas cotas.
          </p>
          {error ? <AvisoDeError>{error}</AvisoDeError> : null}
          <Button variant="brand" className="h-11 md:h-9" onClick={recotizar} disabled={enviando}>
            {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
            Abrir la versión con estas medidas
          </Button>
        </div>
      </PanelResponsivo>
    </>
  );
}
