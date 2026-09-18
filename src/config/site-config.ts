/**
 * Configuración global del sitio — una sola fuente de verdad para URL, nombre
 * y datos de contacto. Se usa en el blog, el sitemap, los JSON-LD y las migas.
 */
/** El número de la empresa, escrito UNA vez: de él salen el WhatsApp, el `tel:` y el texto visible. */
const NUMERO = "51958413806";

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
    numero: NUMERO,
    mensajeDefault: "Hola GMS Integra, vengo del blog y quiero más información.",
  },

  /*
   * DATOS DE CONTACTO — la única copia en `src/`.
   *
   * El 2026-09-12 había 40 copias repartidas en 12 archivos, y ya se contradecían: el horario
   * decía 6:30 pm en el formulario, 7:00 pm en el footer y en privacidad, y 19:00 en el JSON-LD.
   * INV-P07 en `scripts/check-tokens.mjs` impide que vuelvan a escribirse a mano.
   */
  /**
   * Decidido por el usuario el 2026-09-12 (D13). Convivían dos: este, en el formulario de contacto,
   * y `contacto@gmsintegra.com` en el JSON-LD, términos, privacidad y el post de privacidad del blog.
   */
  correo: "gmsintegra21@gmail.com",

  direccion: {
    calle: "Jr. Huánuco Nro. 1389",
    corta: "Jr. Huánuco 1389",
    ciudad: "Huancayo",
    region: "Junín",
    codigoPostal: "12001",
    pais: "PE",
    /** La búsqueda que ya situaba bien el taller en Google Maps; se conserva literal para no mover el pin. */
    busquedaMapa: "JR. HUANUCO NRO. 1389, Huancayo, Junin, Peru",
  },

  /** Decidido por el usuario el 2026-09-12: lunes a sábado, de 8:00 a 20:00. */
  horario: {
    dias: "Lunes a sábado",
    diasCortos: "Lun–Sáb",
    diasSchema: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    abre: "08:00",
    cierra: "20:00",
  },

  redes: {
    facebook: { url: "https://www.facebook.com/profile.php?id=100089261427668", usuario: "@GMSIntegra" },
    instagram: { url: "https://www.instagram.com/gms_integra", usuario: "@gms_integra" },
    tiktok: { url: "https://www.tiktok.com/@GMS_INTEGRA", usuario: "@GMS_INTEGRA" },
  },
} as const;

/** `+51 958 413 806`: el formato visible, derivado del número y no escrito aparte. */
export function telefonoVisible(): string {
  const n = siteConfig.whatsapp.numero;
  return `+${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
}

export function enlaceDeLlamada(): string {
  return `tel:+${siteConfig.whatsapp.numero}`;
}

export function enlaceDeCorreo(): string {
  return `mailto:${siteConfig.correo}`;
}

/** `Jr. Huánuco Nro. 1389, Huancayo, Junín` */
export function direccionCompleta(): string {
  const d = siteConfig.direccion;
  return `${d.calle}, ${d.ciudad}, ${d.region}`;
}

export function enlaceDeMapa(): string {
  return `https://maps.google.com/?q=${encodeURIComponent(siteConfig.direccion.busquedaMapa)}`;
}

export function enlaceDeMapaIncrustado(): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(siteConfig.direccion.busquedaMapa)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
}

/** `20:00` → `8:00 pm`. El dato se guarda en 24 h, que es lo que exige schema.org. */
function hora12(hora: string): string {
  const [hh, mm] = hora.split(":").map(Number);
  return `${hh % 12 || 12}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "pm" : "am"}`;
}

/** `Lunes a sábado · 8:00 am – 8:00 pm` */
export function horarioVisible(): string {
  const h = siteConfig.horario;
  return `${h.dias} · ${hora12(h.abre)} – ${hora12(h.cierra)}`;
}

/** `Lun–Sáb · 8:00 am – 8:00 pm` */
export function horarioCorto(): string {
  const h = siteConfig.horario;
  return `${h.diasCortos} · ${hora12(h.abre)} – ${hora12(h.cierra)}`;
}

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

/**
 * EL MENSAJE DE COTIZACIÓN — la estructura fija, escrita una sola vez.
 *
 * Un lead nace de algo concreto que el visitante vio: una foto, una línea, una obra, un artículo.
 * Por eso el mensaje lleva SIEMPRE qué es y dónde estaba, y por eso esto es una función y no una
 * plantilla que cada pantalla rellena a su manera: había 22 archivos redactando su propia frase,
 * así que el mismo producto pedía cotización de 22 formas distintas según por dónde se entrara.
 *
 * EL ENLACE VA SOLO EN SU LÍNEA. No es estética: WhatsApp genera la vista previa con la foto del
 * contenido cuando la URL está aislada, y no siempre lo hace cuando va embebida entre paréntesis
 * dentro de un párrafo — que era justo la forma anterior.
 *
 * Devuelve TEXTO PLANO. Codificarlo es cosa de `enlaceDeWhatsApp()`, que ya lo hace.
 *
 * SOLO CUBRE LA COTIZACIÓN. El contacto que NO nace de un contenido —la cabecera, el pie, el
 * botón flotante, el 404, las legales— sigue con su frase escrita a mano: en una ficha de
 * catálogo conviven hoy 4 redacciones, 1 de aquí y 3 de esos sitios. Su fábrica se escribe el
 * día que se migren, no antes: una función exportada que nadie llama no se distingue de una
 * muerta, y este repositorio tiene una puerta para eso.
 */
export function mensajeDeCotizacion(sobre: {
  titulo: string;
  url: string;
  /** Matiza de qué se habla: «la línea de Ventanas», «la obra de La Huaycha». */
  contexto?: string;
}): string {
  const que = sobre.contexto ? `${sobre.titulo} (${sobre.contexto})` : sobre.titulo;
  return [
    "Hola GMS Integra.",
    `Me interesa: ${que}`,
    `Lo vi aquí: ${sobre.url}`,
    "",
    "¿Me pueden cotizar?",
  ].join("\n");
}
