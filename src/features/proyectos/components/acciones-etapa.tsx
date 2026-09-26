"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AvisoDeError } from "@/components/comunes/aviso-de-error";
import { BarraFijaMovil } from "@/components/comunes/barra-fija-movil";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AprobarCotizacion } from "@/features/proyectos/components/aprobar-cotizacion";
import { CotizarProyecto } from "@/features/proyectos/components/cotizar-proyecto";
import { EmitirCotizacion } from "@/features/proyectos/components/emitir-cotizacion";
import { PanelResponsivo } from "@/features/proyectos/components/panel-responsivo";
import { RecotizarProyecto } from "@/features/proyectos/components/recotizar-proyecto";
import { RegistrarCobro } from "@/features/proyectos/components/registrar-cobro";
import { ETAPAS } from "@/features/proyectos/textos";
import type { Advertencia, Etapa, ProyectoFicha } from "@/features/proyectos/types";
import { mensajeDeError, pedir } from "@/lib/api-cliente";

/**
 * La acción principal de cada etapa (`proyectos/51-ui` § la ficha). Lo que llega en las tajadas siguientes
 * —imprimir la lista de corte, tajada D— se ve INERTE y rotulado, nunca como un botón que lleva a un error: el
 * mismo criterio del menú del ERP. Registrar la aprobación llegó con B.3; la medición en obra, con C.2.
 */
const PRINCIPAL_PENDIENTE: Partial<Record<Etapa, { etiqueta: string; llega: string }>> = {
  produccion: { etiqueta: "Imprimir lista de corte", llega: "Llega con las listas del taller" },
};

/** Las que se piden con un motivo obligatorio (`P5`, `PRY-I04`) */
const CON_MOTIVO: Etapa[] = ["perdido", "anulado"];

const VERBO: Partial<Record<Etapa, string>> = {
  perdido: "Marcar perdido",
  anulado: "Anular proyecto",
  // Nunca se había ofrecido hasta C.2, y salía el nombre de la etapa en vez del verbo (recorrido de C.2)
  produccion: "Pasar a producción",
  instalacion: "Pasar a instalación",
  entregado: "Marcar entregado",
};

/**
 * Los botones de etapa. Salen de `transiciones`, que calcula el servidor: aquí no hay grafo. Pedirla
 * es un `POST /etapa` con la versión leída; un 409 dice que alguien cambió el proyecto y recarga.
 */
export function AccionesEtapa({
  proyecto,
  puedeAvanzar,
  puedeCotizar,
  puedeAprobar,
  puedeCobrar,
  puedeMedir,
  emitible = null,
}: {
  proyecto: ProyectoFicha;
  puedeAvanzar: boolean;
  /** `cotizaciones:crear`: en `lead`, la acción principal es cotizar (tajada B.1); en `cotizado` y `aprobado`, recotizar (B.3) */
  puedeCotizar: boolean;
  /** `cotizaciones:aprobar`: en `cotizado`, la acción principal es registrar la aprobación (B.3) */
  puedeAprobar: boolean;
  /** `cobros:registrar`: desde `aprobado` se cobra; en `entregado` con saldo, cobrarlo es lo principal (C.1) */
  puedeCobrar: boolean;
  /** `medicion:registrar`: en `aprobado`, sin medición confirmada, lo principal es medir en obra (C.2) */
  puedeMedir: boolean;
  /** El borrador que ya se puede emitir —con ítems y con `cotizaciones:emitir`—: entonces la principal es emitir (B.2) */
  emitible?: string | null;
}) {
  const router = useRouter();
  const [pidiendo, setPidiendo] = useState<Etapa | null>(null);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Producción exige la última medición de la vigente confirmada (`P8`, `PRY-I25`): sin ella no se pinta, y el
  // servidor la rechazaría con `SIN_MEDICION_CONFIRMADA`
  const medida = proyecto.medicion?.estado === "confirmada";
  const posibles = puedeAvanzar ? proyecto.transiciones.filter((etapa) => etapa !== "produccion" || medida) : [];
  const confirmarMedicion = proyecto.etapa === "aprobado" && !medida && puedeMedir;
  const pendiente = PRINCIPAL_PENDIENTE[proyecto.etapa];
  // En lead lo siguiente no es una etapa que se pida: `cotizado` lo mueve el documento al emitirse
  const cotizar = proyecto.etapa === "lead" && puedeCotizar;
  const hayBorrador = proyecto.versiones.some((v) => v.estado === "borrador");
  const vigente = proyecto.vigente;
  // En cotizado lo siguiente tampoco se pide: `aprobado` lo mueve el documento al registrar el sí (B.3)
  const aprobar = proyecto.etapa === "cotizado" && puedeAprobar && vigente?.estado === "emitida" ? vigente : null;
  // Recotizar solo existe hasta `aprobado` (`10-modelo`): después lo que cambia es obra, no oferta
  const recotizar =
    puedeCotizar && vigente && (proyecto.etapa === "cotizado" || proyecto.etapa === "aprobado") ? (
      <RecotizarProyecto
        proyectoId={proyecto.id}
        etapa={proyecto.etapa}
        versionVigente={vigente.version}
        hayBorrador={hayBorrador}
      />
    ) : null;
  // Cobrar (C.1, `51-ui`): el anticipo en `aprobado`, un cobro en obra, y el saldo como lo único que queda al entregar
  const cobrosVivos = proyecto.cobros.some((c) => c.anulado_at === null);
  const cobrarSaldo = proyecto.etapa === "entregado" && puedeCobrar && (proyecto.saldo ?? 0) > 0;
  const cobrar =
    puedeCobrar && (proyecto.etapa === "aprobado" || proyecto.etapa === "produccion" || proyecto.etapa === "instalacion") ? (
      <RegistrarCobro proyecto={proyecto} etiqueta={cobrosVivos ? "Registrar cobro" : "Registrar anticipo"} />
    ) : null;
  const principalDirecta =
    !pendiente && !cotizar && !aprobar && !cobrarSaldo && !confirmarMedicion ? posibles.find((e) => !CON_MOTIVO.includes(e)) : undefined;
  const secundarias = posibles.filter((e) => e !== principalDirecta);

  function abrir(etapa: Etapa) {
    setPidiendo(etapa);
    setMotivo("");
    setError(null);
  }

  async function confirmar() {
    if (!pidiendo) return;
    setEnviando(true);
    setError(null);

    const respuesta = await pedir<ProyectoFicha & { advertencias: Advertencia[] }>(
      `/api/v1/proyectos/${proyecto.id}/etapa`,
      {
        method: "POST",
        body: JSON.stringify({
          etapa: pidiendo,
          motivo: motivo.trim() || null,
          updated_at: proyecto.updated_at,
        }),
      },
    );

    setEnviando(false);

    if (!respuesta.ok) {
      if (respuesta.error.estado === 409) {
        toast.error("Alguien cambió este proyecto mientras lo tenía abierto.", {
          description: "Se recargó con lo que hay ahora: revíselo antes de volver a intentarlo.",
        });
        setPidiendo(null);
        router.refresh();
        return;
      }
      setError(mensajeDeError(respuesta.error));
      return;
    }

    toast.success(`${proyecto.codigo}: ${ETAPAS[respuesta.datos.etapa]}`);
    for (const aviso of respuesta.datos.advertencias) {
      toast.warning(aviso.mensaje, { duration: 10_000 });
    }
    setPidiendo(null);
    router.refresh();
  }

  const exigeMotivo = pidiendo !== null && CON_MOTIVO.includes(pidiendo);

  // `#medir`: estando ya en Obra, la barra lleva al formulario en vez de no hacer nada
  const botonPrincipal = confirmarMedicion ? (
    <Button asChild variant="brand" className="h-11 w-full md:h-9">
      <Link href={`/proyectos/${proyecto.id}?pestana=obra#medir`}>
        {proyecto.medicion ? "Volver a medir" : "Confirmar medición"}
      </Link>
    </Button>
  ) : aprobar ? (
    <AprobarCotizacion vigente={aprobar} />
  ) : cobrarSaldo ? (
    <RegistrarCobro proyecto={proyecto} etiqueta="Registrar saldo" variante="brand" className="h-11 w-full md:h-9" />
  ) : cotizar && emitible ? (
    <EmitirCotizacion cotizacionId={emitible} />
  ) : cotizar ? (
    <CotizarProyecto proyectoId={proyecto.id} etiqueta={hayBorrador ? "Seguir cotizando" : "Cotizar"} />
  ) : pendiente ? (
    <div className="flex flex-col gap-1">
      <Button variant="brand" className="h-11 w-full md:h-9" disabled>
        {pendiente.etiqueta}
      </Button>
      <p className="text-muted-foreground text-center text-xs">{pendiente.llega}</p>
    </div>
  ) : principalDirecta ? (
    <Button variant="brand" className="h-11 w-full md:h-9" onClick={() => abrir(principalDirecta)}>
      {VERBO[principalDirecta] ?? ETAPAS[principalDirecta]}
    </Button>
  ) : null;

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* En el escritorio la principal va aquí; en el móvil, en la barra fija de abajo */}
        <div className="hidden md:block">{botonPrincipal}</div>
        {recotizar}
        {cobrar}
        {secundarias.map((etapa) => (
          <Button
            key={etapa}
            variant="outline"
            className="h-11 md:h-9"
            onClick={() => abrir(etapa)}
          >
            {VERBO[etapa] ?? ETAPAS[etapa]}
          </Button>
        ))}
        {!botonPrincipal && !recotizar && !cobrar && secundarias.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {proyecto.transiciones.length === 0
              ? "Proyecto cerrado: su etapa ya no cambia."
              : "No hay acciones de etapa disponibles para su usuario."}
          </p>
        ) : null}
      </div>

      {botonPrincipal ? (
        <BarraFijaMovil>{botonPrincipal}</BarraFijaMovil>
      ) : null}

      <PanelResponsivo
        abierto={pidiendo !== null}
        alCambiar={(abierto) => !abierto && setPidiendo(null)}
        titulo={pidiendo ? `${VERBO[pidiendo] ?? ETAPAS[pidiendo]} · ${proyecto.codigo}` : ""}
        descripcion={
          exigeMotivo
            ? `El proyecto se cierra y ya no vuelve a moverse. El motivo queda en la historia: es lo que dirá, dentro de meses, por qué se ${pidiendo === "anulado" ? "anuló" : "perdió"}.${
                // Un documento no se anula suelto: se anula con su proyecto (decisión 26, `PRY-I29`)
                pidiendo === "anulado" && vigente ? ` La cotización vigente (v${vigente.version}) queda anulada con el mismo motivo.` : ""
              }`
            : `El proyecto pasa a ${pidiendo ? ETAPAS[pidiendo] : ""}.`
        }
      >
        <div className="flex flex-col gap-4">
          {exigeMotivo ? (
            <div className="space-y-1.5">
              <Label htmlFor="etapa-motivo">Motivo</Label>
              <Textarea
                id="etapa-motivo"
                rows={3}
                maxLength={500}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Eligió otra empresa · No respondió · Se quedó sin presupuesto…"
              />
            </div>
          ) : null}

          {error ? <AvisoDeError>{error}</AvisoDeError> : null}

          <Button
            variant={exigeMotivo ? "destructive" : "brand"}
            className="h-11 md:h-9"
            onClick={confirmar}
            // Sin motivo el botón no se habilita; el servidor lo exige igual (`MOTIVO_REQUERIDO`)
            disabled={enviando || (exigeMotivo && motivo.trim() === "")}
          >
            {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
            {pidiendo ? (VERBO[pidiendo] ?? ETAPAS[pidiendo]) : ""}
          </Button>
        </div>
      </PanelResponsivo>
    </>
  );
}
