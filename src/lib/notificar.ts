import { toast } from "sonner";

import type { TonoNotificacion } from "@/components/comunes/notificacion";

/**
 * Los avisos flotantes, con el mismo modelo que `<Notificacion>` (decisión 33): tono, título, texto y una acción.
 * Es el único sitio que habla con Sonner (`INV-N01` en `check-tokens`): así el tono, la duración y los iconos se
 * deciden una vez.
 *
 * Lo que sale mal o hay que leer con calma (error, advertencia) dura 10 s; lo que confirma, lo de Sonner.
 */
export function notificar({
  tono,
  titulo,
  descripcion,
  accion,
  duracion,
}: {
  tono: TonoNotificacion;
  titulo: string;
  descripcion?: string;
  accion?: { etiqueta: string; onClick: () => void };
  duracion?: number;
}) {
  const opciones = {
    description: descripcion,
    action: accion ? { label: accion.etiqueta, onClick: accion.onClick } : undefined,
    duration: duracion ?? (tono === "error" || tono === "advertencia" ? 10_000 : undefined),
  };

  switch (tono) {
    case "exito":
      return toast.success(titulo, opciones);
    case "error":
      return toast.error(titulo, opciones);
    case "advertencia":
      return toast.warning(titulo, opciones);
    case "info":
      return toast.info(titulo, opciones);
  }
}

/** El 409 (`P9`): otra persona cambió el proyecto; la pantalla se recarga y no se reintenta sola */
export function notificarConflicto() {
  notificar({
    tono: "error",
    titulo: "Alguien cambió este proyecto mientras lo tenía abierto.",
    descripcion: "Se recargó con lo que hay ahora: revíselo antes de volver a intentarlo.",
  });
}
