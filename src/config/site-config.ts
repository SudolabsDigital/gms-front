/**
 * Configuración global del sitio — una sola fuente de verdad para URL, nombre
 * y datos de contacto. Se usa en el blog, el sitemap, los JSON-LD y las migas.
 */
export const siteConfig = {
  /**
   * Dominio canónico. LLEVA `www` A PROPÓSITO.
   *
   * Vercel sirve `www.gmsintegra.com` con 200 y redirige el apex con un 308 permanente.
   * Mientras esta constante dijo `https://gmsintegra.com`, cada canonical, cada `@id` del
   * JSON-LD y cada `<loc>` del sitemap apuntaban a la URL que redirige: Google recibía una
   * página que se declaraba canónica de una redirección hacia sí misma, y una página con
   * redirección no es indexable. Las 49 URLs del sitemap eran 49 redirecciones.
   *
   * Si algún día el apex pasa a ser el principal en Vercel, se cambia AQUÍ y en ningún otro
   * sitio: `metadataBase` y `robots.ts` derivan de esta línea.
   */
  url: "https://www.gmsintegra.com",
  name: "GMS Integra",
  whatsapp: {
    numero: "51958413806",
    mensajeDefault: "Hola GMS Integra, vengo del blog y quiero más información.",
  },
} as const;

/**
 * Enlace para ESCRIBIRLE a GMS Integra (cotizar, consultar, coordinar).
 *
 * El número no se pasa como argumento a propósito: es un dato de la empresa, no de quien llama.
 * Antes de esta fábrica había 35 enlaces construidos a mano y **18 de ellos llevaban el número
 * escrito dentro de la URL**, así que cambiar el WhatsApp de la empresa eran 18 ediciones repartidas
 * por el código. Ahora es una línea, aquí arriba.
 *
 * El mensaje se pasa en TEXTO PLANO. Codificarlo es responsabilidad de esta función: los enlaces
 * viejos traían `%20` escritos a mano, y un texto ya codificado que vuelve a pasar por
 * `encodeURIComponent` llega al chat con los `%20` a la vista.
 */
export function enlaceDeWhatsApp(mensaje?: string): string {
  const base = `https://wa.me/${siteConfig.whatsapp.numero}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

/**
 * Enlace para COMPARTIR con cualquier contacto — sin destinatario, lo elige quien comparte.
 *
 * Es otra función y no un parámetro opcional de la anterior porque son dos intenciones distintas:
 * una lleva al visitante a hablar con la empresa, la otra reparte el contenido. Un booleano en la
 * firma obligaría a leer la llamada para saber cuál de las dos está ocurriendo.
 */
export function enlaceParaCompartirEnWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
