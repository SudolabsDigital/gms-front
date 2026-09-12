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

export function enlaceDeWhatsApp(numero: string, mensaje?: string): string {
  return `https://wa.me/${numero}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ""}`;
}
