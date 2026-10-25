/**
 * Parámetros de interfaz del ERP (SEC.6): el alto de un control se decide aquí, no en cada pantalla.
 *
 * En el táctil, 44 px: el área que pide una pantalla que se usa con el dedo. En el escritorio, 36 px para los campos y las
 * acciones del contenido, y 32 px para las acciones que viven en una barra o en una fila, donde manda la densidad.
 * `Button`, `Input` y `SelectTrigger` los toman por `size="control"` y `size="control-compacto"`; lo que no es uno de esos
 * componentes —un `<select>` nativo, una pestaña, un enlace con forma de botón— usa estas constantes. El par escrito a mano
 * lo cuenta `INV-E09`.
 */
export const ALTO_DE_CONTROL = "h-11 md:h-9";
export const ALTO_DE_CONTROL_COMPACTO = "h-11 md:h-8";
