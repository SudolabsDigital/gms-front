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
import { enlaceDeWhatsApp, enlaceParaCompartirEnWhatsApp } from "@/config/site-config";
import { cn } from "@/lib/utils";

/**
 * ACCIONES DE CONTENIDO — compartir y cotizar, una sola vez para todo el portal.
 *
 * Sustituye a cuatro implementaciones que resolvían lo mismo por separado: `blog/compartir.tsx`,
 * `catalogo/tarjeta-categoria.tsx`, `catalogo/galeria-catalogo.tsx` y `obras/galeria-obras.tsx`.
 * Cada una tenía sus canales, su orden y su forma de copiar el enlace.
 *
 * DOS INTENCIONES, NO UNA. «Cotizar» lleva al visitante a hablar con la empresa; «compartir»
 * reparte el contenido. Van juntas en el mismo menú porque aparecen en el mismo sitio, pero salen
 * de funciones distintas y se rotulan distinto: confundirlas es mandarle al cliente un mensaje
 * escrito para otra persona.
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
   * `flotante` = píldora sobre la imagen · `en-linea` = botón con etiqueta · `fila` = los canales
   * a la vista, sin menú.
   *
   * `fila` no estaba en la especificación y se añadió al migrar el blog: su carril de compartir
   * está SIEMPRE visible, y cambiarlo por un desplegable habría escondido la acción justo en la
   * página donde más se comparte. Preservarlo no cuesta lógica —los canales y los enlaces son los
   * mismos— solo una rama de pintado.
   */
  variante?: "flotante" | "en-linea" | "fila";
  /** Solo en `fila`: en pantallas anchas el carril lateral se apila. */
  orientacion?: "horizontal" | "vertical";
  className?: string;
}

export function AccionesDeContenido({
  titulo,
  url,
  contexto,
  cotizar = true,
  variante = "flotante",
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

  const sobre = contexto ? `${titulo} (${contexto})` : titulo;
  const mensajeCotizar = `Hola GMS Integra, vi ${sobre} en la web (${url}) y deseo solicitar una cotización.`;
  const textoCompartir = `${titulo} — GMS Integra: ${url}`;

  const urlCotizar = enlaceDeWhatsApp(mensajeCotizar);
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

  /** Detiene el clic para que no dispare el enlace de la tarjeta que envuelve estas acciones. */
  const detener = (e: React.MouseEvent) => e.stopPropagation();

  const claseItem =
    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted cursor-pointer";

  const menu = (
    <DropdownMenuContent
      align={variante === "flotante" ? "start" : "end"}
      sideOffset={6}
      className="w-60 rounded-xl border border-border bg-popover p-1.5 shadow-xl"
      onClick={detener}
    >
      <DropdownMenuLabel className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
        {titulo}
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="my-1" />

      {cotizar && (
        <>
          <DropdownMenuItem asChild>
            <a
              href={urlCotizar}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
            >
              <WhatsAppIcon className="size-4 shrink-0 text-emerald-600" />
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
              <WhatsAppIcon className="size-5 text-emerald-600" />
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
            <WhatsAppIcon className="size-5 text-emerald-600" />
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

  return (
    <div
      className={cn(variante === "flotante" ? "absolute top-3.5 left-3.5 z-20" : "inline-flex", className)}
      onClick={detener}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Compartir o cotizar: ${titulo}`}
            onClick={detener}
            className={cn(
              "flex items-center justify-center transition-all duration-200 active:scale-95 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              variante === "flotante"
                ? "size-9 rounded-full border border-white/20 bg-black/70 text-white shadow-md backdrop-blur-md hover:scale-105 hover:bg-black/90"
                : "h-11 gap-2 rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground shadow-sm hover:border-primary/30 hover:shadow-md",
            )}
          >
            <Share2 className="size-4" />
            {variante === "en-linea" && <span>Compartir</span>}
          </button>
        </DropdownMenuTrigger>
        {menu}
      </DropdownMenu>

      {/* Solo entra en juego cuando el portapapeles no está disponible. */}
      <input ref={respaldo} readOnly value={url} className="sr-only" tabIndex={-1} aria-hidden />
    </div>
  );
}
