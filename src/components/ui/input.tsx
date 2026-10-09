import * as React from "react"

import { ALTO_DE_CONTROL, ALTO_DE_CONTROL_COMPACTO } from "@/lib/interfaz"
import { cn } from "@/lib/utils"

// `size`: el alto de los campos del ERP (SEC.6) —`control`, o `control-compacto` dentro de una fila—. Sustituye al
// `size` nativo, que mide en caracteres
const ALTOS = { default: "h-8", control: ALTO_DE_CONTROL, "control-compacto": ALTO_DE_CONTROL_COMPACTO } as const

function Input({
  className,
  type,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & { size?: keyof typeof ALTOS }) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      suppressHydrationWarning
      className={cn(
        ALTOS[size],
        "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
