import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";
import { Galeria } from "@/components/blog/galeria";

/**
 * Componentes globales de MDX. Archivo OBLIGATORIO para `@next/mdx` con App
 * Router: sin él no compila, y va en la raíz del proyecto.
 *
 * Adaptado al tema claro "Aluminio Estructural" de GMS Integra:
 * fondos claros, textos oscuros, acento azul (#004AAD).
 *
 * ⚠️ En Next 16 `useMDXComponents()` **no recibe argumentos**.
 */

/**
 * Toda imagen del markdown se envuelve en un contenedor estructurado con pie opcional.
 * Se utilizan elementos `<span>` para garantizar que la estructura HTML sea válida
 * cuando Markdown envuelve imágenes dentro de etiquetas `<p>`, evitando errores de hidratación.
 */
function ImagenDeArticulo({ src, alt }: { src?: string; alt?: string }) {
  if (!src) return null;

  return (
    <span className="my-8 flex flex-col gap-3">
      <span className="relative mx-auto flex w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/50 p-3 shadow-sm sm:p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ""}
          className="mx-auto max-h-[460px] w-auto max-w-full rounded-xl object-contain shadow-md"
          loading="lazy"
        />
      </span>
      {alt ? (
        <span className="text-center text-xs font-medium text-muted-foreground sm:text-sm">
          {alt}
        </span>
      ) : null}
    </span>
  );
}

const components: MDXComponents = {
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "mt-14 mb-4 scroll-mt-28 text-2xl md:text-3xl font-black tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "mt-10 mb-3 scroll-mt-28 text-xl md:text-2xl font-bold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("my-5 text-[17px] leading-8 text-muted-foreground", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn(
        "font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/80",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("my-5 flex flex-col gap-2.5 pl-1", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("my-5 flex list-decimal flex-col gap-2.5 pl-6 marker:text-primary", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li
      className={cn(
        "text-[17px] leading-8 text-muted-foreground [ul>&]:relative [ul>&]:pl-6",
        "[ul>&]:before:absolute [ul>&]:before:left-1 [ul>&]:before:top-[15px]",
        "[ul>&]:before:h-1.5 [ul>&]:before:w-1.5 [ul>&]:before:rounded-full [ul>&]:before:bg-primary",
        className,
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-bold text-foreground", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "my-8 rounded-r-2xl border-l-4 border-primary/60 bg-muted py-4 pl-6 pr-5",
        "text-[17px] leading-8 text-foreground/80 italic",
        className,
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-primary",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "my-7 overflow-x-auto rounded-2xl border border-slate-700/50 bg-[#1e293b] p-5",
        "font-mono text-sm leading-7 text-slate-200",
        className,
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="my-8 overflow-x-auto rounded-2xl border border-border">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "border-b border-border bg-muted px-5 py-3 font-black uppercase",
        "tracking-wider text-[11px] text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn("border-b border-border/50 px-5 py-3.5 align-top text-muted-foreground", className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("my-12 border-border", className)} {...props} />
  ),
  img: ImagenDeArticulo,
  Galeria,
  Collage: Galeria,
  GaleriaCollage: Galeria,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
