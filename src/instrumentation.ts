/**
 * Se ejecuta una vez al arrancar cada servidor de Next, antes de atender peticiones.
 *
 * Solo avisa: si falta `BACKEND_URL` en producción, lo dice en el log de arranque —donde mira
 * quien despliega— en vez de esperar a que un usuario intente entrar al ERP (`G-13`). No tumba el
 * servidor, a propósito: el portal público vive en la misma aplicación y no depende del backend.
 */
export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NODE_ENV === "production" &&
    !process.env.BACKEND_URL
  ) {
    console.error(
      "[ARRANQUE] BACKEND_URL no está definida: el portal funciona, el ERP no podrá hablar con Laravel.",
    );
  }
}
