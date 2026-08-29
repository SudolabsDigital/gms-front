/**
 * Configuración global del sitio — una sola fuente de verdad para URL, nombre
 * y datos de contacto. Se usa en el blog, el sitemap, los JSON-LD y las migas.
 */
export const siteConfig = {
  url: "https://gmsintegra.com",
  name: "GMS Integra",
  whatsapp: {
    numero: "51958413806",
    mensajeDefault: "Hola GMS Integra, vengo del blog y quiero más información.",
  },
} as const;

export function enlaceDeWhatsApp(numero: string, mensaje?: string): string {
  return `https://wa.me/${numero}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ""}`;
}
