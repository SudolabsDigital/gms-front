"use client";

import * as React from "react";
import { Check, Copy, Share2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FacebookIcon, WhatsAppIcon } from "@/components/landing/social-icons";
import {
  enlaceDeWhatsApp,
  enlaceParaCompartirEnWhatsApp,
  mensajeDeCotizacion,
} from "@/config/site-config";
import { cn } from "@/lib/utils";

/**
 * ACCIONES DE CONTENIDO — compartir y cotizar, una sola vez para todo el portal.
 *
 * Sustituye a cuatro implementaciones que resolvían lo mismo por separado: `blog/compartir.tsx`,
 * `catalogo/tarjeta-categoria.tsx`, `catalogo/galeria-catalogo.tsx` y `obras/galeria-obras.tsx`.
 * Cada una tenía sus canales, su orden y su forma de copiar el enlace.
 *
 * DOS INTENCIONES, NO UNA. «Cotizar» lleva al visitante a hablar con la empresa; «compartir»
 * reparte el contenido. Salen de funciones distintas y se rotulan distinto: confundirlas es
 * mandarle al cliente un mensaje escrito para otra persona.
 *
 * Y NO PESAN LO MISMO (v2). La primera versión las metió en el mismo desplegable de cinco entradas,
 * donde «Cotizar por WhatsApp» era una línea más de un menú que había que abrir primero. Donde la
 * página existe para que alguien actúe —una ficha, el visor— cotizar es un botón a la vista y
 * compartir es el secundario de al lado.
 *
 * LA VARIANTE `flotante` SE RETIRÓ. Era la píldora sobre la imagen de la tarjeta, y sobre la foto
 * ya no va nada: en una galería se elige y se entra, y la acción vive en la ficha.
 */

export interface AccionesDeContenidoProps {
  /** Qué se comparte o sobre qué se cotiza. Entra en el texto del mensaje. */
  titulo: string;
  /** Absoluta. Se construye desde `siteConfig.url`, nunca a mano. */
  url: string;
  /** Matiza el mensaje: «la línea de Ventanas», «la obra de La Huaycha». */
  contexto?: string;
  /** Muestra el canal de cotización. Por defecto sí. */
  cotizar?: boolean;
  /**
   * `dominante` = cotizar a la vista y compartir al lado · `compacta` = dos cuadrados para el pie de
   * una tarjeta · `en-linea` = un botón que abre el menú completo · `fila` = los canales a la vista,
   * sin menú.
   *
   * `fila` no estaba en la especificación y se añadió al migrar el blog: su carril de compartir
   * está SIEMPRE visible, y cambiarlo por un desplegable habría escondido la acción justo en la
   * página donde más se comparte. Preservarlo no cuesta lógica —los canales y los enlaces son los
   * mismos— solo una rama de pintado.
   */
  variante?: "dominante" | "compacta" | "en-linea" | "fila";
  /** Solo en `fila`: en pantallas anchas el carril lateral se apila. */
  orientacion?: "horizontal" | "vertical";
  className?: string;
}

export function AccionesDeContenido({
  titulo,
  url,
  contexto,
  cotizar = true,
  variante = "dominante",
  orientacion = "vertical",
  className,
}: AccionesDeContenidoProps) {
  const [copiado, setCopiado] = React.useState(false);
  const respaldo = React.useRef<HTMLInputElement>(null);

  /**
   * ¿Existe la hoja de compartir del sistema? Es un dato del navegador, no del servidor.
   *
   * Se lee con `useSyncExternalStore` y no con `useState` + `useEffect`: en el servidor no hay
   * `navigator`, así que decidirlo durante el render pintaría un menú en el HTML y otro en el
   * navegador, y React rompe la hidratación por esa diferencia. La instantánea del servidor
   * devuelve `false` y la del cliente la verdad, que es justo el contrato de este hook — y además
   * `react-hooks/set-state-in-effect` prohíbe la vía del efecto, con razón.
   *
   * La suscripción está vacía a propósito: el soporte no cambia mientras la página vive.
   */
  const hayCompartirNativo = React.useSyncExternalStore(
    () => () => {},
    () => typeof navigator !== "undefined" && typeof navigator.share === "function",
    () => false,
  );

  /* La prosa del mensaje no se escribe aquí: sale de la fábrica, que es la única del portal. */
  const textoCompartir = `${titulo} — GMS Integra: ${url}`;

  const urlCotizar = enlaceDeWhatsApp(mensajeDeCotizacion({ titulo, url, contexto }));
  const urlCompartirWa = enlaceParaCompartirEnWhatsApp(textoCompartir);
  const urlCompartirFb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  /**
   * El portapapeles solo existe en contexto seguro. Si falla —http, permiso denegado, navegador
   * viejo— se selecciona el texto de respaldo para que se pueda copiar a mano, en vez de que el
   * botón no haga nada y el visitante no sepa por qué.
   */
  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      respaldo.current?.select();
    }
  }

  async function compartirNativo() {
    try {
      await navigator.share({ title: titulo, text: textoCompartir, url });
    } catch {
      /* El visitante cerró la hoja de compartir: no es un error. */
    }
  }

  /** Detiene el clic para que no dispare un enlace que envuelva a estas acciones. */
  const detener = (e: React.MouseEvent) => e.stopPropagation();

  const claseItem =
    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted cursor-pointer";

  const menu = (
    <DropdownMenuContent
      align="end"
      sideOffset={6}
      className="w-60 rounded-xl border border-border bg-popover p-1.5 shadow-xl"
      onClick={detener}
    >
      <DropdownMenuLabel className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
        {titulo}
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="my-1" />

      {/* En `dominante` la cotización ya es un botón a la vista: repetirla aquí sería decir dos
          veces lo mismo en la misma esquina. */}
      {cotizar && variante === "en-linea" && (
        <>
          <DropdownMenuItem asChild>
            <a
              href={urlCotizar}
              target="_blank"
              rel="noopener noreferrer"
              className="text-whatsapp hover:text-whatsapp-hover hover:bg-whatsapp/10 flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold transition-colors"
            >
              <WhatsAppIcon className="text-whatsapp size-4 shrink-0" />
              <span>Cotizar por WhatsApp</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />
        </>
      )}

      {hayCompartirNativo && (
        <DropdownMenuItem onClick={compartirNativo} className={claseItem}>
          <Share2 className="size-3.5 shrink-0 text-muted-foreground" />
          <span>Compartir…</span>
        </DropdownMenuItem>
      )}

      <DropdownMenuItem asChild>
        <a href={urlCompartirWa} target="_blank" rel="noopener noreferrer" className={claseItem}>
          <WhatsAppIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span>Compartir por WhatsApp</span>
        </a>
      </DropdownMenuItem>

      <DropdownMenuItem asChild>
        <a href={urlCompartirFb} target="_blank" rel="noopener noreferrer" className={claseItem}>
          <FacebookIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span>Compartir en Facebook</span>
        </a>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="my-1" />

      <DropdownMenuItem onClick={copiar} className={claseItem}>
        {copiado ? (
          <Check className="size-3.5 shrink-0 text-success" />
        ) : (
          <Copy className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span>{copiado ? "¡Enlace copiado!" : "Copiar enlace"}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  /**
   * DOS CUADRADOS EN EL PIE DE LA TARJETA — compartir y cotizar, sin tocar la foto.
   *
   * Pedido del usuario el 2026-09-18. No contradice la foto limpia: estos botones viven en la banda
   * blanca, a la derecha del nombre, y la imagen sigue con cero capas encima. Lo que la decisión de
   * la foto limpia prohibía era la píldora flotando SOBRE la imagen, que es otra cosa.
   *
   * El lenguaje visual es el de los cuadrados del footer —radio corto, color pleno y una sombra dura
   * abajo que se hunde al pulsar—, que es lo que este sitio ya usa para decir «esto se toca».
   *
   * Cotizar es un enlace directo, no una entrada de menú: en una retícula de líneas, obligar a abrir
   * un desplegable para llegar a la única acción que da dinero es una pulsación de más.
   */
  if (variante === "compacta") {
    const claseCuadrado =
      "focus-visible:ring-ring flex size-10 items-center justify-center rounded text-white shadow-md transition-all active:translate-y-0.5 active:shadow-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";

    return (
      <div className={cn("flex items-center gap-2", className)} onClick={detener}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Compartir: ${titulo}`}
              onClick={detener}
              className={cn(
                claseCuadrado,
                "bg-brand hover:bg-primary-dark shadow-[0_3px_0_var(--primary-dark)]",
              )}
            >
              <Share2 className="size-4" />
            </button>
          </DropdownMenuTrigger>
          {menu}
        </DropdownMenu>

        {cotizar && (
          <a
            href={urlCotizar}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Cotizar por WhatsApp: ${titulo}`}
            className={cn(
              claseCuadrado,
              "bg-whatsapp hover:bg-whatsapp-hover shadow-[0_3px_0_var(--whatsapp-hover)]",
            )}
          >
            <WhatsAppIcon className="size-4" />
          </a>
        )}

        {/* Solo entra en juego cuando el portapapeles no está disponible. */}
        <input ref={respaldo} readOnly value={url} className="sr-only" tabIndex={-1} aria-hidden />
      </div>
    );
  }

  if (variante === "fila") {
    const claseBoton =
      "flex size-11 items-center justify-center rounded-xl border border-border bg-card shadow-sm transition-all hover:scale-105 hover:border-primary/30 hover:shadow-md focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none";

    return (
      <div className={cn("flex flex-col gap-3", className)} onClick={detener}>
        <p className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase">
          Compartir
        </p>

        <div
          className={cn(
            "flex gap-2.5",
            orientacion === "vertical" ? "flex-row lg:flex-col" : "flex-row flex-wrap",
          )}
        >
          {cotizar && (
            <a
              href={urlCotizar}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Cotizar por WhatsApp: ${titulo}`}
              className={claseBoton}
            >
              <WhatsAppIcon className="text-whatsapp size-5" />
            </a>
          )}

          {hayCompartirNativo && (
            <button
              type="button"
              onClick={compartirNativo}
              aria-label="Compartir con otra aplicación"
              className={claseBoton}
            >
              <Share2 className="size-[18px] text-foreground" />
            </button>
          )}

          <a
            href={urlCompartirWa}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir por WhatsApp"
            className={claseBoton}
          >
            <WhatsAppIcon className="text-whatsapp size-5" />
          </a>

          <a
            href={urlCompartirFb}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir en Facebook"
            className={claseBoton}
          >
            <FacebookIcon className="size-5 text-[#1877F2]" />
          </a>

          <button
            type="button"
            onClick={copiar}
            aria-label={`Copiar el enlace de ${titulo}`}
            className={cn(claseBoton, copiado && "border-success/50 bg-success/10")}
          >
            {copiado ? (
              <Check className="size-[18px] text-success" />
            ) : (
              <Copy className="size-[18px] text-foreground" />
            )}
          </button>
        </div>

        {copiado && <span className="text-[11px] font-bold text-success">Enlace copiado</span>}

        <input ref={respaldo} readOnly value={url} className="sr-only" tabIndex={-1} aria-hidden />
      </div>
    );
  }

  const esDominante = variante === "dominante";

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)} onClick={detener}>
      {/*
        La acción del negocio, a la vista y con su etiqueta: nadie tiene que abrir un menú para
        encontrarla. El verde sale del token, no de la paleta cruda — `emerald-600` sobre texto
        blanco daba 3,65:1 y no pasa AA; `--whatsapp` da 5,48:1 y para eso se decidió.
      */}
      {esDominante && cotizar && (
        <a
          href={urlCotizar}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-whatsapp hover:bg-whatsapp-hover focus-visible:ring-ring inline-flex h-11 grow items-center justify-center gap-2 rounded-xl px-5 text-xs font-black tracking-wider text-white uppercase shadow-md transition-colors focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98]"
        >
          <WhatsAppIcon className="size-4 shrink-0 text-white" />
          <span>Cotizar por WhatsApp</span>
        </a>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={esDominante ? `Compartir: ${titulo}` : `Compartir o cotizar: ${titulo}`}
            onClick={detener}
            className={cn(
              "border-border bg-card text-foreground hover:border-primary/30 focus-visible:ring-ring flex h-11 items-center justify-center rounded-xl border text-xs font-bold shadow-sm transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none active:scale-95",
              esDominante ? "w-11" : "gap-2 px-4",
            )}
          >
            <Share2 className="size-4" />
            {!esDominante && <span>Compartir</span>}
          </button>
        </DropdownMenuTrigger>
        {menu}
      </DropdownMenu>

      {/* Solo entra en juego cuando el portapapeles no está disponible. */}
      <input ref={respaldo} readOnly value={url} className="sr-only" tabIndex={-1} aria-hidden />
    </div>
  );
}
