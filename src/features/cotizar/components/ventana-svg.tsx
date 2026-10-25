import type { MouseEvent } from "react";

import {
  esPlanoV2,
  type Coordenada,
  type CotaPlano,
  type Geometria,
  type GeometriaV1,
  type GeometriaV2,
  type PiezaPlano,
  type PiezaPlanoV2,
  type Posicion,
  type VidrioPlano,
} from "@/features/cotizar/types";

/**
 * El plano de la ventana.
 *
 * NO calcula nada: recibe del backend ejes, trazos, rectángulos y colores, y los pinta.
 * Es un componente de servidor puro —sin "use client", sin estado, sin efectos— para que
 * el mismo dibujo sirva en el ERP y, en cuanto se genere, dentro del PDF del cliente.
 * Elegir tocando el plano (`alElegir`) solo existe cuando lo pinta un componente de cliente.
 *
 * Dibuja las dos versiones del contrato: la v2 (la red de puntos, `disenos/50-api` § 1) y la
 * v1 que guardan las cotizaciones de antes, tal cual se pintaba (`disenos/51-ui` P10).
 *
 * Sistema de coordenadas: el motor entrega Y creciendo hacia ARRIBA (plano de taller) y
 * el SVG la tiene creciendo hacia abajo. La conversión ocurre en un único sitio: `sy()`.
 */

/** Margen alrededor de la ventana, en cm de modelo, para que quepan las cotas. */
const MARGEN = 46;

const GRIS_APAGADO = "#c9ccd1";

const ETIQUETA_VIDRIO: Record<VidrioPlano["clase"], string> = {
  fijo: "Fijo",
  corredizo: "Corrediza",
  puente: "Puente",
};

type PropiedadesDelPlano = {
  ancho: number;
  alto: number;
  mostrarCotas?: boolean;
  mostrarLeyenda?: boolean;
  /**
   * Qué significa el color de los perfiles.
   *
   * `insumo`  — el color de identificación que reparte el backend dentro del plano,
   * para reconocer cada pieza (decisión 59).
   * `acabado` — el `color_hex` de la tabla: el aluminio real. Hoy toda la serie Nova es
   * natural, así que son grises; servirá el día que haya blanco o madera y el cliente
   * quiera ver cómo le quedaría.
   */
  modoColor?: "insumo" | "acabado";
  /**
   * Código del insumo a aislar.
   *
   * Con un valor, esa pieza se REDIBUJA en la capa superior —así nada la tapa, aunque en
   * vista frontal quede detrás de otro perfil— con halo, mayor grosor y sus extremos
   * marcados, mientras el resto baja a gris tenue.
   */
  insumoResaltado?: string | null;
  /** Tocar una pieza la elige; tocar el fondo vuelve a la ventana entera (P7). Solo en el plano v2 */
  alElegir?: (insumo: string | null) => void;
  className?: string;
};

export function VentanaSVG({ geometria, ...resto }: PropiedadesDelPlano & { geometria: Geometria }) {
  return esPlanoV2(geometria) ? <PlanoV2 geometria={geometria} {...resto} /> : <PlanoV1 geometria={geometria} {...resto} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// v2 · la red de puntos: toda pieza se elige y se ve, con su certeza en el trazo (decisión 55)
// ─────────────────────────────────────────────────────────────────────────────

/** La certeza de la posición va en el trazo (`52-brief-plano` § 4), en cm de modelo para que escale con la ventana */
const TRAZO_POR_POSICION: Record<Posicion, (t: number) => string | undefined> = {
  confirmada: () => undefined,
  deducida: (t) => `${t * 6} ${t * 4}`,
  hipotesis: (t) => `${t * 0.1} ${t * 4}`,
};

/** El anfitrión de una felpa elegida: gris medio, para que la felpa se lea DENTRO */
const GRIS_ANFITRION = "#94a3b8";

function PlanoV2({
  geometria,
  ancho,
  alto,
  mostrarCotas = true,
  modoColor = "insumo",
  insumoResaltado = null,
  alElegir,
  className,
}: PropiedadesDelPlano & { geometria: GeometriaV2 }) {
  const sy = (y: number) => alto - y;
  const t = Math.max(ancho, alto) / 300;
  const hay = insumoResaltado !== null;

  // Una felpa no se dibuja a la vista: al elegirla se ilumina dentro de las piezas de su anfitrión
  const alojada = hay
    ? geometria.piezas.find((p) => p.forma === "alojada" && p.insumo === insumoResaltado)
    : undefined;
  const encendida = (p: PiezaPlanoV2) =>
    p.insumo === insumoResaltado || (alojada !== undefined && p.insumo === alojada.anfitrion);

  const colorDe = (p: PiezaPlanoV2) => (modoColor === "acabado" ? (p.color_acabado ?? "#7C8794") : p.color);
  const trazado = (tramo: Coordenada[]) => tramo.map(([x, y], i) => `${i ? "L" : "M"}${x} ${sy(y)}`).join(" ");
  const tocar = (insumo: string) =>
    alElegir
      ? (evento: MouseEvent) => {
          evento.stopPropagation();
          alElegir(insumo);
        }
      : undefined;

  const rectangulos = geometria.piezas.filter((p) => p.forma === "rectangulo");
  const caminos = geometria.piezas.filter((p) => p.forma === "camino");
  const puntos = geometria.piezas.filter((p) => p.forma === "punto");

  const vista = { x: -MARGEN, y: -MARGEN * 0.5, ancho: ancho + MARGEN * 1.5, alto: alto + MARGEN * 1.2 };

  return (
    <svg
      viewBox={`${vista.x} ${vista.y} ${vista.ancho} ${vista.alto}`}
      className={className}
      role="img"
      aria-label={
        hay
          ? `Plano de la ventana de ${ancho} por ${alto} centímetros, con el insumo ${insumoResaltado} resaltado`
          : `Plano de la ventana de ${ancho} por ${alto} centímetros`
      }
      preserveAspectRatio="xMidYMid meet"
      onClick={alElegir ? () => alElegir(null) : undefined}
    >
      <FlechaDeCota />

      {/* Vidrios, primero: los perfiles van encima */}
      {rectangulos.map((p) => {
        const [[x1, y1], [x2, y2]] = p.esquinas ?? [[0, 0], [0, 0]];
        const activa = !hay || p.insumo === insumoResaltado;
        const ancho_ = p.ancho ?? 0;
        const alto_ = p.alto ?? 0;

        return (
          <g key={p.id}>
            <rect
              x={Math.min(x1, x2)}
              y={sy(Math.max(y1, y2))}
              width={ancho_}
              height={alto_}
              fill={activa ? colorDe(p) : GRIS_APAGADO}
              fillOpacity={hay && activa ? 0.8 : 0.55}
              stroke={activa ? "#7FA8C4" : GRIS_APAGADO}
              strokeWidth={t * (hay && activa ? 1.2 : 0.4)}
              strokeDasharray={TRAZO_POR_POSICION[p.posicion](t)}
            >
              <title>{`${p.insumo}${p.rol ? ` · ${p.rol}` : ""} · ${redondear(ancho_)} × ${redondear(alto_)} cm`}</title>
            </rect>
            {ancho_ > 40 && alto_ > 25 ? (
              <text
                x={Math.min(x1, x2) + ancho_ / 2}
                y={sy(Math.min(y1, y2) + alto_ / 2)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(ancho_, alto_) * 0.14}
                fill="#33556B"
                opacity={activa ? 0.85 : 0.4}
              >
                {`${redondear(ancho_)}×${redondear(alto_)}`}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* Perfiles a la vista, o apagados si hay otra pieza elegida */}
      {caminos.flatMap((p) =>
        hay && encendida(p)
          ? []
          : (p.tramos ?? []).map((tramo, i) => (
              <path
                key={`${p.id}-${i}`}
                d={trazado(tramo)}
                fill="none"
                stroke={hay ? GRIS_APAGADO : colorDe(p)}
                // La hipótesis se distingue por el punteado, no por la transparencia: al 75 % medía 2,3:1 (decisión 64)
                strokeOpacity={hay ? 0.55 : 1}
                strokeWidth={t * 2.6}
                strokeDasharray={TRAZO_POR_POSICION[p.posicion](t)}
                strokeLinecap={p.posicion === "hipotesis" ? "round" : "square"}
                strokeLinejoin="round"
              >
                <title>{rotuloDeCamino(p, i)}</title>
              </path>
            )),
      )}

      {/* Marcadores: las ruedas, sobre el riel */}
      {puntos.flatMap((p) => {
        const activa = !hay || p.insumo === insumoResaltado;

        return (p.anclas ?? []).map(([x, y], i) => (
          <circle
            key={`${p.id}-${i}`}
            cx={x}
            cy={sy(y) - t * 3}
            r={t * (hay && activa ? 4.2 : 3)}
            fill={activa ? colorDe(p) : GRIS_APAGADO}
            stroke="#ffffff"
            strokeWidth={t * 1.2}
          >
            <title>{`${p.insumo}${p.rol ? ` · ${p.rol}` : ""}`}</title>
          </circle>
        ));
      })}

      {/* …y ENCIMA de todo, lo elegido */}
      {caminos.filter((p) => hay && encendida(p)).flatMap((p) =>
        (p.tramos ?? []).map((tramo, i) =>
          alojada ? (
            <g key={`a-${p.id}-${i}`}>
              <path d={trazado(tramo)} fill="none" stroke={GRIS_ANFITRION} strokeWidth={t * 4} strokeLinejoin="round" />
              <path
                d={trazado(tramo)}
                fill="none"
                stroke={colorDe(alojada)}
                strokeWidth={t * 1.6}
                strokeDasharray={`${t * 3} ${t * 1.5}`}
                strokeLinejoin="round"
              >
                <title>{`${alojada.insumo}${alojada.rol ? ` · ${alojada.rol}` : ""} · dentro del ${p.insumo}`}</title>
              </path>
            </g>
          ) : (
            <g key={`a-${p.id}-${i}`}>
              <path
                d={trazado(tramo)}
                fill="none"
                stroke={colorDe(p)}
                strokeOpacity={0.22}
                strokeWidth={t * 10}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={trazado(tramo)}
                fill="none"
                stroke={colorDe(p)}
                strokeWidth={t * 4}
                strokeDasharray={TRAZO_POR_POSICION[p.posicion](t)}
                strokeLinecap={p.posicion === "hipotesis" ? "round" : "square"}
                strokeLinejoin="round"
              >
                <title>{rotuloDeCamino(p, i)}</title>
              </path>
              {/* Extremos: dónde EMPIEZA y dónde ACABA, que es lo que no se deduce cuando dos piezas comparten línea */}
              {[tramo[0], tramo[tramo.length - 1]].map(([x, y], extremo) => (
                <circle
                  key={extremo}
                  cx={x}
                  cy={sy(y)}
                  r={t * 3.2}
                  fill="#ffffff"
                  stroke={colorDe(p)}
                  strokeWidth={t * 1.6}
                />
              ))}
            </g>
          ),
        ),
      )}

      {/* «×2»: piezas iguales una detrás de otra se dibujan una vez (los dos rieles de D-D) */}
      {caminos
        .filter((p) => p.multiplicidad > 1 && (!hay || encendida(p)))
        .flatMap((p) =>
          (p.tramos ?? []).map((tramo, i) => {
            const [xa, ya] = tramo[0];
            const [xb, yb] = tramo[tramo.length - 1];

            return (
              <text
                key={`m-${p.id}-${i}`}
                x={(xa + xb) / 2}
                y={sy((ya + yb) / 2) + t * 9}
                fontSize={t * 9}
                textAnchor="middle"
                fontWeight={600}
                fill="#334155"
              >
                {`×${p.multiplicidad}`}
              </text>
            );
          }),
        )}

      {mostrarCotas ? <Cotas cotas={geometria.cotas} ancho={ancho} alto={alto} apagadas={hay} /> : null}

      {/* Zonas de toque: 24 px de pantalla alrededor de cada línea, que mide 2–3 px (P7) */}
      {alElegir ? (
        <g aria-hidden>
          {caminos.flatMap((p) =>
            (p.tramos ?? []).map((tramo, i) => (
              <path
                key={`t-${p.id}-${i}`}
                d={trazado(tramo)}
                fill="none"
                stroke="transparent"
                strokeWidth={24}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                pointerEvents="stroke"
                className="cursor-pointer"
                onClick={tocar(p.insumo)}
              />
            )),
          )}
          {/* Un punto de trazo redondo que no escala: 28 px de pantalla, midan lo que midan la ventana y el plano */}
          {puntos.flatMap((p) =>
            (p.anclas ?? []).map(([x, y], i) => (
              <path
                key={`t-${p.id}-${i}`}
                d={`M${x} ${sy(y) - t * 3}h0.01`}
                fill="none"
                stroke="transparent"
                strokeWidth={28}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                pointerEvents="stroke"
                className="cursor-pointer"
                onClick={tocar(p.insumo)}
              />
            )),
          )}
        </g>
      ) : null}
    </svg>
  );
}

/** «8115 · portafelpa de hoja · 140 cm»: lo que mide ESTE tramo lo dice el servidor */
function rotuloDeCamino(p: PiezaPlanoV2, tramo: number): string {
  const largo = p.corte === "junto" ? p.largo : p.largos?.[tramo];
  const certeza = p.posicion === "hipotesis" ? " · hipótesis, no se corta" : p.posicion === "deducida" ? " · deducida" : "";

  return `${p.insumo}${p.rol ? ` · ${p.rol}` : ""}${largo !== undefined ? ` · ${redondear(largo)} cm` : ""}${certeza}`;
}

/** La punta de las cotas. Cada plano lleva la suya: puede haber dos en la página (Modelo y Perfiles) */
function FlechaDeCota() {
  return (
    <defs>
      <marker id="flechaCota" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
      </marker>
    </defs>
  );
}

/** Las cotas, iguales en las dos versiones: las deriva el motor de los ejes */
function Cotas({ cotas, ancho, alto, apagadas }: { cotas: CotaPlano[]; ancho: number; alto: number; apagadas: boolean }) {
  const sy = (y: number) => alto - y;
  const trazo = Math.max(ancho, alto) / 300;

  return (
    <g className="text-muted-foreground" fill="currentColor" stroke="currentColor" opacity={apagadas ? 0.45 : 1}>
      {cotas.map((cota, indice) => {
        const grosor = trazo * (cota.principal ? 0.5 : 0.35);
        const tamanoTexto = Math.max(ancho, alto) * (cota.principal ? 0.038 : 0.03);

        if (cota.orientacion === "horizontal") {
          const y = sy(cota.desplazamiento);

          return (
            <g key={`c-${indice}`}>
              <line
                x1={cota.desde}
                y1={y}
                x2={cota.hasta}
                y2={y}
                strokeWidth={grosor}
                markerStart="url(#flechaCota)"
                markerEnd="url(#flechaCota)"
              />
              <text x={(cota.desde + cota.hasta) / 2} y={y - tamanoTexto * 0.45} textAnchor="middle" fontSize={tamanoTexto} stroke="none">
                {cota.etiqueta}
              </text>
            </g>
          );
        }

        const x = cota.desplazamiento;
        const medio = sy((cota.desde + cota.hasta) / 2);

        return (
          <g key={`c-${indice}`}>
            <line
              x1={x}
              y1={sy(cota.desde)}
              x2={x}
              y2={sy(cota.hasta)}
              strokeWidth={grosor}
              markerStart="url(#flechaCota)"
              markerEnd="url(#flechaCota)"
            />
            <text
              x={x - tamanoTexto * 0.4}
              y={medio}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={tamanoTexto}
              stroke="none"
              transform={`rotate(-90 ${x - tamanoTexto * 0.4} ${medio})`}
            >
              {cota.etiqueta}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// v1 · las reglas: lo guardado antes de DIS.2 se pinta exactamente como se pintaba
// ─────────────────────────────────────────────────────────────────────────────

function PlanoV1({
  geometria,
  ancho,
  alto,
  mostrarCotas = true,
  mostrarLeyenda = false,
  modoColor = "insumo",
  insumoResaltado = null,
  className,
}: PropiedadesDelPlano & { geometria: GeometriaV1 }) {
  // Invierte la Y del modelo a la del SVG
  const sy = (y: number) => alto - y;

  const hayResaltado = insumoResaltado !== null;

  const vista = {
    x: -MARGEN,
    y: -MARGEN * 0.5,
    ancho: ancho + MARGEN * 1.5,
    alto: alto + MARGEN * 1.2,
  };

  // El grosor de línea se expresa en cm de modelo para que el trazo se vea igual de
  // fino sin importar si la ventana mide 120 o 360 cm
  const trazo = Math.max(ancho, alto) / 300;

  /*
   * Dos listas, no una.
   *
   * Si la pieza aislada se dibujara en su posición original de la lista, cualquier perfil
   * posterior que pase por encima la taparía: en una ventana el riel inferior y el marco
   * comparten borde, y el 3210 y el 5415 se dibujan sobre la misma línea del puente. Al
   * separarlas, lo resaltado se pinta al final y queda siempre visible.
   */
  const aisladas = hayResaltado
    ? geometria.piezas.filter((pieza) => pieza.insumo === insumoResaltado)
    : [];

  const resto = hayResaltado
    ? geometria.piezas.filter((pieza) => pieza.insumo !== insumoResaltado)
    : geometria.piezas;

  const colorDe = (pieza: PiezaPlano) =>
    modoColor === "acabado" ? (pieza.color_acabado ?? "#7C8794") : pieza.color;

  return (
    <svg
      viewBox={`${vista.x} ${vista.y} ${vista.ancho} ${vista.alto}`}
      className={className}
      role="img"
      aria-label={
        hayResaltado
          ? `Plano de la ventana de ${ancho} por ${alto} centímetros, con el insumo ${insumoResaltado} resaltado`
          : `Plano de la ventana de ${ancho} por ${alto} centímetros`
      }
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <marker
          id="flechaCota"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>

      {/* Paños de vidrio, primero: los perfiles se dibujan encima */}
      {geometria.vidrios.map((vidrio, indice) => {
        const activo = !hayResaltado || vidrio.insumo === insumoResaltado;

        return (
          <g key={`v-${indice}`} opacity={activo ? 1 : 0.3}>
            <rect
              x={vidrio.x}
              y={sy(vidrio.y + vidrio.alto)}
              width={vidrio.ancho}
              height={vidrio.alto}
              fill={activo ? vidrio.color : GRIS_APAGADO}
              fillOpacity={0.55}
              stroke={activo ? "#7FA8C4" : GRIS_APAGADO}
              strokeWidth={trazo * 0.4}
            />
            {vidrio.ancho > 40 && vidrio.alto > 25 ? (
              <text
                x={vidrio.x + vidrio.ancho / 2}
                y={sy(vidrio.y + vidrio.alto / 2)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(vidrio.ancho, vidrio.alto) * 0.14}
                fill="#33556B"
                opacity={0.85}
              >
                {`${redondear(vidrio.ancho)}×${redondear(vidrio.alto)}`}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* Perfiles: primero lo que NO está aislado */}
      {resto.map((pieza, indice) => (
        <line
          key={`p-${indice}`}
          x1={pieza.x1}
          y1={sy(pieza.y1)}
          x2={pieza.x2}
          y2={sy(pieza.y2)}
          stroke={hayResaltado ? GRIS_APAGADO : colorDe(pieza)}
          strokeOpacity={hayResaltado ? 0.5 : 1}
          strokeWidth={trazo * 2.6}
          strokeLinecap="square"
        >
          <title>{`${pieza.insumo}${pieza.rol ? ` · ${pieza.rol}` : ""} · ${redondear(pieza.largo)} cm`}</title>
        </line>
      ))}

      {/* …y ENCIMA de todo, la pieza aislada */}
      {aisladas.map((pieza, indice) => {
        const color = colorDe(pieza);

        return (
          <g key={`a-${indice}`}>
            <line
              x1={pieza.x1}
              y1={sy(pieza.y1)}
              x2={pieza.x2}
              y2={sy(pieza.y2)}
              stroke={color}
              strokeOpacity={0.22}
              strokeWidth={trazo * 10}
              strokeLinecap="round"
            />

            <line
              x1={pieza.x1}
              y1={sy(pieza.y1)}
              x2={pieza.x2}
              y2={sy(pieza.y2)}
              stroke={color}
              strokeWidth={trazo * 4}
              strokeLinecap="square"
            >
              <title>{`${pieza.insumo}${pieza.rol ? ` · ${pieza.rol}` : ""} · ${redondear(pieza.largo)} cm`}</title>
            </line>

            {/* Extremos: dicen dónde EMPIEZA y dónde ACABA la pieza, que es lo que no se
                puede deducir cuando dos perfiles comparten la misma línea */}
            {[
              [pieza.x1, pieza.y1],
              [pieza.x2, pieza.y2],
            ].map(([x, y], extremo) => (
              <circle
                key={extremo}
                cx={x}
                cy={sy(y)}
                r={trazo * 3.2}
                fill="#ffffff"
                stroke={color}
                strokeWidth={trazo * 1.6}
              />
            ))}
          </g>
        );
      })}

      {mostrarCotas ? (
        <g
          className="text-muted-foreground"
          fill="currentColor"
          stroke="currentColor"
          opacity={hayResaltado ? 0.45 : 1}
        >
          {geometria.cotas.map((cota, indice) => {
            const grosor = trazo * (cota.principal ? 0.5 : 0.35);
            const tamanoTexto = Math.max(ancho, alto) * (cota.principal ? 0.038 : 0.03);

            if (cota.orientacion === "horizontal") {
              const y = sy(cota.desplazamiento);

              return (
                <g key={`c-${indice}`}>
                  <line
                    x1={cota.desde}
                    y1={y}
                    x2={cota.hasta}
                    y2={y}
                    strokeWidth={grosor}
                    markerStart="url(#flechaCota)"
                    markerEnd="url(#flechaCota)"
                  />
                  <text
                    x={(cota.desde + cota.hasta) / 2}
                    y={y - tamanoTexto * 0.45}
                    textAnchor="middle"
                    fontSize={tamanoTexto}
                    stroke="none"
                  >
                    {cota.etiqueta}
                  </text>
                </g>
              );
            }

            const x = cota.desplazamiento;

            return (
              <g key={`c-${indice}`}>
                <line
                  x1={x}
                  y1={sy(cota.desde)}
                  x2={x}
                  y2={sy(cota.hasta)}
                  strokeWidth={grosor}
                  markerStart="url(#flechaCota)"
                  markerEnd="url(#flechaCota)"
                />
                <text
                  x={x - tamanoTexto * 0.4}
                  y={sy((cota.desde + cota.hasta) / 2)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={tamanoTexto}
                  stroke="none"
                  transform={`rotate(-90 ${x - tamanoTexto * 0.4} ${sy((cota.desde + cota.hasta) / 2)})`}
                >
                  {cota.etiqueta}
                </text>
              </g>
            );
          })}
        </g>
      ) : null}

      {mostrarLeyenda ? <Leyenda geometria={geometria} ancho={ancho} alto={alto} /> : null}
    </svg>
  );
}

/**
 * Leyenda de vidrios DENTRO del SVG.
 *
 * Solo se usa cuando el dibujo viaja solo —el PDF del cliente—, donde no hay HTML
 * alrededor que pueda explicarlo. En pantalla se prefiere la lista en HTML: es
 * seleccionable, la lee un lector de pantalla y permite pulsar para aislar.
 */
function Leyenda({
  geometria,
  ancho,
  alto,
}: {
  geometria: GeometriaV1;
  ancho: number;
  alto: number;
}) {
  const clases = Array.from(new Set(geometria.vidrios.map((v) => v.clase)));

  if (clases.length === 0) return null;

  const tamano = Math.max(ancho, alto) * 0.03;
  const y = alto + MARGEN * 0.55;

  return (
    <g>
      {clases.map((clase, indice) => {
        const muestra = geometria.vidrios.find((v) => v.clase === clase);

        return (
          <g key={clase} transform={`translate(${indice * (ancho / 3.2)}, ${y})`}>
            <rect
              width={tamano}
              height={tamano}
              fill={muestra?.color ?? GRIS_APAGADO}
              fillOpacity={0.55}
              stroke="#7FA8C4"
              strokeWidth={tamano * 0.06}
            />
            <text
              x={tamano * 1.5}
              y={tamano * 0.8}
              fontSize={tamano * 0.95}
              fill="currentColor"
              className="text-muted-foreground"
            >
              {ETIQUETA_VIDRIO[clase]}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function redondear(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}
