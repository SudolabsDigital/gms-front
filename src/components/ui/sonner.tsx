"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  // El tema FORZADO manda: con `theme` («system») Sonner seguía al sistema operativo y, en modo oscuro,
  // pintaba la descripción en gris claro sobre el fondo blanco del sitio (1,2:1, sesión 24)
  const { forcedTheme, resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={(forcedTheme ?? resolvedTheme ?? "light") as ToasterProps["theme"]}
      className="toaster group"
      // En el móvil, por encima de la barra fija del ERP: el aviso de «Agregado» tapaba «Emitir», que es justo
      // lo siguiente que se pulsa (recorrido de B.2). La barra publica su altura real —no es fija: en `aprobado`
      // lleva un rótulo y un 5rem la tapaba 9 px (B.3)—; sin barra, el aviso queda sobre el área segura
      mobileOffset={{ bottom: "calc(var(--alto-barra-fija, env(safe-area-inset-bottom)) + 0.75rem)" }}
      // Los mismos iconos y tonos FUERTES que `<Notificacion>` (decisión 32): un aviso flotante y uno en la pantalla
      // se leen igual. Se llama siempre por `notificar()`, no a `toast` directo (`INV-N01`)
      icons={{
        success: (
          <CircleCheckIcon className="text-success-fuerte size-4" />
        ),
        info: (
          <InfoIcon className="text-primary size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="text-warning-fuerte size-4" />
        ),
        error: (
          <OctagonXIcon className="text-destructive-fuerte size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
