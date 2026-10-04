import type { ReactNode } from "react";
import { ClipboardList, FileText, History, MessageCircle, Phone, Printer, Ruler, ShieldCheck, Wallet } from "lucide-react";

import { CabeceraDeSeccion } from "@/components/comunes/cabecera-de-seccion";
import { Enlace } from "@/components/comunes/enlace";
import type { Dato } from "@/components/comunes/insignia-de-dato";
import { PestanasDeSubruta } from "@/components/comunes/pestanas-de-subruta";
import { SinAcceso } from "@/components/comunes/sin-acceso";
import { BarraDeContexto } from "@/components/erp/barra-de-contexto";
import { MarcoDeTrabajo } from "@/components/erp/marco-de-trabajo";
import { PanelDeSeccion, type GrupoDePanel } from "@/components/erp/panel-de-seccion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { enlaceParaEscribirA } from "@/config/site-config";
import { AccionesEtapa } from "@/features/proyectos/components/acciones-etapa";
import { BorradorEnEdicion } from "@/features/proyectos/components/borrador-en-edicion";
import { EstadoDeEtapa } from "@/features/proyectos/components/estado-de-etapa";
import { leerDocumento, leerObra } from "@/features/proyectos/datos";
import { rutaDeSeccion, type Seccion } from "@/features/proyectos/pestanas";
import { CON_LISTA_DE_CORTE, ETAPAS, ETAPAS_CON_COBROS } from "@/features/proyectos/textos";
import type { ProyectoFicha } from "@/features/proyectos/types";
import { adelantar } from "@/lib/api-server";
import { moneda } from "@/lib/formato";
import { puede } from "@/lib/permisos";
import { exigirUsuario, type Usuario } from "@/lib/session";

/**
 * La obra como espacio (SEC.9b, decisión 76; `03-sistema-de-diseno/arquitectura-del-erp` § 3): lo que comparten todas
 * sus secciones, pedido **una vez** —el proyecto, con `cache`—. Al cambiar de sección Next conserva este layout y solo
 * pide la sección; tras una acción, `router.refresh()` lo rehace todo.
 *
 * - **La barra** dice la obra y su estado (`EstadoDeEtapa`, donde la referencia pone «Connect»).
 * - **El panel**, las secciones por asunto —General · Venta · Obra · Entrega— con su dato y, arriba, total y saldo.
 * - **El riel**, a la derecha en todas las secciones: lo que sigue en la etapa y el cliente para escribirle.
 * - **En el móvil**, donde ni la barra ni el panel se pintan: la cabecera con el estado y las secciones en pestañas.
 */
export default async function ObraLayout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const peticion = adelantar(leerObra(id));

  const usuario = await exigirUsuario();

  if (!puede(usuario, "proyectos:ver")) {
    return (
      <MarcoDeTrabajo barra={<BarraDeContexto ruta={[{ etiqueta: "Proyectos" }]} />}>
        <SinAcceso que="proyectos" />
      </MarcoDeTrabajo>
    );
  }

  const proyecto = await peticion;

  // Lo siguiente de un lead con ítems es emitir: el riel necesita saber si el borrador ya se puede (B.2). Es la misma
  // lectura que hace la sección Cotización, y `cache` la sirve una vez
  const idBorrador = proyecto.versiones.find((v) => v.estado === "borrador")?.id;
  const puedeEmitir = puede(usuario, "cotizaciones:emitir");
  const borrador = idBorrador && puedeEmitir ? await leerDocumento(idBorrador) : null;

  const whatsapp = enlaceParaEscribirA(proyecto.cliente.telefono);
  const telefono = proyecto.cliente.telefono?.replace(/[^\d+]/g, "");
  const grupos = gruposDeLaObra(proyecto, usuario);
  const estado = (
    <EstadoDeEtapa
      etapa={proyecto.etapa}
      etapaDesde={proyecto.etapa_desde}
      creado={proyecto.created_at}
      historia={proyecto.historia}
    />
  );
  const accionesDeContacto = (
    <>
      {whatsapp ? (
        <Button asChild variant="outline" className="text-whatsapp h-11 md:h-8">
          <a href={whatsapp} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
        </Button>
      ) : null}
      {telefono ? (
        <Button asChild variant="outline" className="h-11 md:hidden">
          <a href={`tel:${telefono}`}>
            <Phone className="size-4" />
            Llamar
          </a>
        </Button>
      ) : null}
    </>
  );

  return (
    <MarcoDeTrabajo
      barra={
        <BarraDeContexto
          ruta={[{ etiqueta: "Proyectos", href: "/proyectos" }, { codigo: proyecto.codigo, etiqueta: proyecto.nombre, selector: "proyectos" }]}
          estado={estado}
        />
      }
      panel={<PanelDeSeccion cabecera={<Cifras proyecto={proyecto} />} grupos={grupos} />}
    >
      <BorradorEnEdicion>
        {/* Espacio abajo en el móvil: la barra fija de la acción de la etapa no debe tapar el contenido */}
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-28 md:pb-0 print:max-w-none print:pb-0">
          <div className="flex flex-col gap-3 md:hidden print:hidden">
            <CabeceraDeSeccion
              volver={{ href: "/proyectos", etiqueta: "Proyectos" }}
              titulo={proyecto.nombre}
              descripcion={`${proyecto.codigo} · ${proyecto.cliente.nombre}`}
              acciones={accionesDeContacto}
            />
            <div className="flex flex-wrap items-center gap-3">
              {estado}
              <Cifras proyecto={proyecto} enLinea />
            </div>
            <PestanasDeSubruta
              etiqueta="Secciones de la obra"
              prefetch
              opciones={grupos.flatMap((g) => g.items.filter((item) => !item.inerte))}
            />
          </div>

          <div className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1fr)_20rem] md:items-start lg:grid-cols-[minmax(0,1fr)_24rem] print:block">
            <div className="flex min-w-0 flex-col gap-4">{children}</div>

            {/* El riel: a la derecha en el escritorio; debajo del contenido en el móvil. En papel, nada */}
            <aside className="flex flex-col gap-4 md:sticky md:top-[calc(1rem+var(--alto-barra-contexto))] print:hidden">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {proyecto.etapa === "perdido" || proyecto.etapa === "anulado"
                      ? ETAPAS[proyecto.etapa]
                      : `${ETAPAS[proyecto.etapa]} · qué sigue`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AccionesEtapa
                    proyecto={proyecto}
                    puedeAvanzar={puede(usuario, "proyectos:avanzar")}
                    puedeCotizar={puede(usuario, "cotizaciones:crear")}
                    puedeAprobar={puede(usuario, "cotizaciones:aprobar")}
                    puedeCobrar={puede(usuario, "cobros:registrar")}
                    puedeMedir={puede(usuario, "medicion:registrar")}
                    puedeVerCorte={puede(usuario, "despiece:ver")}
                    // Con ítems, lo siguiente de un lead es emitir (`51-ui`: «Emitir» en la barra fija)
                    emitible={borrador && borrador.items.length > 0 ? borrador.id : null}
                  />
                </CardContent>
              </Card>

              {/* El cliente, para escribirle desde cualquier sección. En el móvil esto ya está en la cabecera */}
              <Card className="hidden md:flex">
                <CardHeader>
                  <CardTitle className="text-base">Cliente</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  <Enlace href={`/clientes/${proyecto.cliente.id}`} className="w-fit font-medium hover:underline">
                    {proyecto.cliente.nombre}
                  </Enlace>
                  {proyecto.cliente.telefono ? (
                    <span className="text-muted-foreground font-mono tabular-nums">{proyecto.cliente.telefono}</span>
                  ) : (
                    <span className="text-muted-foreground">Sin teléfono</span>
                  )}
                  {whatsapp ? <div>{accionesDeContacto}</div> : null}
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </BorradorEnEdicion>
    </MarcoDeTrabajo>
  );
}

/**
 * Total y saldo de la obra: arriba del panel en el escritorio y junto al estado en el móvil. Sin `costeo:ver` la clave
 * `saldo` no viaja (`CAL-04`) y aquí no se habla de dinero; antes del sí no se debe nada (recorrido UX.0, R15).
 */
function Cifras({ proyecto, enLinea = false }: { proyecto: ProyectoFicha; enLinea?: boolean }) {
  if (!("saldo" in proyecto)) return null;

  const total = proyecto.vigente?.total ?? null;
  const conSaldo = ETAPAS_CON_COBROS.includes(proyecto.etapa) && proyecto.saldo !== null && proyecto.saldo !== undefined;
  const cifras: [string, string, boolean][] = [
    ["Total", total === null ? "sin cotizar" : moneda(total), false],
    ...(conSaldo ? ([["Saldo", moneda(proyecto.saldo ?? 0), (proyecto.saldo ?? 0) > 0]] as [string, string, boolean][]) : []),
  ];

  return (
    <dl className={enLinea ? "text-muted-foreground flex gap-4 text-sm" : "grid grid-cols-2 gap-x-3 gap-y-0.5"}>
      {cifras.map(([etiqueta, valor, debe]) => (
        <div key={etiqueta} className={enLinea ? "flex gap-1.5" : undefined}>
          <dt className={enLinea ? undefined : "text-muted-foreground text-[11px]"}>{etiqueta}</dt>
          <dd className={`font-mono font-semibold tabular-nums ${debe ? "text-warning-fuerte" : "text-foreground"}`}>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Las secciones de la obra por asunto, cada una con lo que deja ver sin entrar (`componentes-del-armazon` § 5) */
function gruposDeLaObra(proyecto: ProyectoFicha, usuario: Usuario): GrupoDePanel[] {
  const ruta = (seccion: Seccion | "corte") => rutaDeSeccion(proyecto.id, seccion);
  const icono = "size-4 shrink-0";
  const vigente = proyecto.vigente;
  const borrador = proyecto.versiones.find((v) => v.estado === "borrador");
  const conSaldo = "saldo" in proyecto && ETAPAS_CON_COBROS.includes(proyecto.etapa) && proyecto.saldo !== null;
  const saldo = proyecto.saldo ?? 0;

  const datoCotizacion: Dato | undefined = vigente
    ? { texto: `v${vigente.version} ${vigente.estado}`, tono: vigente.estado === "aprobada" ? "ok" : "neutro" }
    : borrador
      ? { texto: `v${borrador.version} en borrador` }
      : undefined;
  const datoCobros: Dato | undefined = !conSaldo
    ? undefined
    : saldo > 0
      ? { texto: `debe ${moneda(saldo)}`, tono: "aviso" }
      : saldo < 0
        ? { texto: `a favor ${moneda(-saldo)}` }
        : { texto: "al día", tono: "ok" };
  const datoMedicion: Dato | undefined = proyecto.medicion
    ? { texto: "medida", tono: "ok" }
    : proyecto.etapa === "aprobado"
      ? { texto: "por medir", tono: "aviso" }
      : undefined;

  return [
    {
      titulo: "General",
      items: [
        { href: ruta("resumen"), etiqueta: "Resumen", icono: <ClipboardList className={icono} /> },
        {
          href: ruta("historia"),
          etiqueta: "Historia",
          icono: <History className={icono} />,
          dato: { texto: String(proyecto.historia.length) },
        },
      ],
    },
    {
      titulo: "Venta",
      items: [
        { href: ruta("cotizacion"), etiqueta: "Cotización", icono: <FileText className={icono} />, dato: datoCotizacion },
        { href: ruta("cobros"), etiqueta: "Cobros", icono: <Wallet className={icono} />, dato: datoCobros },
      ],
    },
    {
      titulo: "Obra",
      items: [
        { href: ruta("obra"), etiqueta: "Medición", icono: <Ruler className={icono} />, dato: datoMedicion },
        ...(puede(usuario, "despiece:ver")
          ? [
              {
                href: ruta("corte"),
                etiqueta: "Lista de corte",
                icono: <Printer className={icono} />,
                inerte: CON_LISTA_DE_CORTE.includes(proyecto.etapa) ? undefined : "al producir",
              },
            ]
          : []),
      ],
    },
    {
      // El certificado de garantía aún no existe (`G-65`): se ve rotulado, no como un enlace que falla
      titulo: "Entrega",
      items: [
        {
          href: `/proyectos/${proyecto.id}/garantia`,
          etiqueta: "Garantía",
          icono: <ShieldCheck className={icono} />,
          inerte: "pronto",
        },
      ],
    },
  ];
}
