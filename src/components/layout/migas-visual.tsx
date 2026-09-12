import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";

export interface Miga {
  nombre: string;
  href?: string;
}

export interface MigasVisualProps {
  items: Miga[];
  variante?: "oscura" | "clara";
  className?: string;
}

/**
 * Componente visual puro de migas de pan para cabeceras y subheroes.
 * Exclusivamente orientado a la navegación visual y accesibilidad en el DOM.
 * Los microdatos estructurados (JSON-LD BreadcrumbList) se delegan al componente BreadcrumbSchema.
 */
export function MigasVisual({
  items,
  variante = "oscura",
  className,
}: MigasVisualProps) {
  const esOscura = variante === "oscura";

  return (
    <nav aria-label="Ruta de navegación" className={cn("min-w-0", className)}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-2",
          esOscura
            ? "rounded-xl bg-black/40 px-3.5 py-2 backdrop-blur-md border border-white/15 shadow-sm inline-flex"
            : ""
        )}
      >
        {items.map((item, i) => {
          const ultima = i === items.length - 1;
          const esInicio = i === 0;

          return (
            <li key={`${item.nombre}-${i}`} className="flex min-w-0 items-center gap-2">
              {i > 0 && (
                <ChevronRight
                  className={cn(
                    "size-3.5 shrink-0",
                    esOscura ? "text-[#00C9FF]" : "text-muted-foreground/60"
                  )}
                />
              )}

              {ultima || !item.href ? (
                <span
                  aria-current="page"
                  className={cn(
                    "max-w-[16rem] truncate text-xs font-black uppercase tracking-wider sm:max-w-sm",
                    esOscura ? "text-white" : "text-foreground"
                  )}
                >
                  {item.nombre}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors",
                    esOscura
                      ? "text-slate-200 hover:text-[#00C9FF]"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {esInicio && <Home className="size-3.5 text-[#00C9FF]" />}
                  <span>{item.nombre}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Alias de conveniencia
export { MigasVisual as Migas };
