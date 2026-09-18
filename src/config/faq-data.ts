import { siteConfig } from "@/config/site-config";

export interface FaqItem {
  num: string;
  q: string;
  a: string;
}

export const FAQS_VENDIBLES: FaqItem[] = [
  {
    num: "01",
    q: "¿Por qué elegir GMS Integra frente a un taller o vidriero informal?",
    a: `Porque somos fabricantes directos con taller propio en ${siteConfig.direccion.corta}. No tercerizamos: trabajamos con perfiles pesados de extrusión virgen (Miyasato/Alumex), corte milimétrico por matriz y te entregamos 1 Año de Garantía Escrita Formal respaldada con Factura legal.`,
  },
  {
    num: "02",
    q: "¿La visita técnica y medición en mi obra tiene algún costo en Huancayo?",
    a: "Es 100% gratuita y sin compromiso en Huancayo, El Tambo, Chilca y todo el Valle del Mantaro. Nuestro personal técnico acude con distanciómetros láser para verificar plomos, escuadras y entregarte una cotización transparente con precio cerrado sin costos ocultos.",
  },
  {
    num: "03",
    q: "¿Cómo garantizan que las ventanas y mamparas bloqueen el frío andino?",
    a: "Implementamos sistemas de empaques perimetrales EPDM de alta densidad, felpas hidrófugas con lámina central y sellado exterior con silicona estructural Sika. El resultado es un cierre hermético con tolerancia cero a corrientes de viento, polvo y filtraciones de lluvia.",
  },
  {
    num: "04",
    q: "¿Cuánto tiempo demora la fabricación y cómo se ejecuta el montaje?",
    a: "Fabricamos en nuestro taller en solo 5 a 8 días hábiles tras confirmar las medidas. La instalación en tu obra se ejecuta en una sola jornada limpia por técnicos especializados, dejando los vanos perfectamente nivelados, sellados y operativos al instante.",
  },
  {
    num: "05",
    q: "¿Qué cubre exactamente el 1 Año de Garantía Escrita Formal?",
    a: "Cubre cualquier desajuste mecánico de rodamientos o carretillas, estanqueidad del sellado contra lluvias, durabilidad de perfiles de aluminio y herrajes en acero inoxidable 304. Si requieres calibración o ajuste, nuestro equipo acude directamente a tu obra.",
  },
  {
    num: "06",
    q: "¿Cuáles son las condiciones de pago y facturación del proyecto?",
    a: "Iniciamos la manufactura con el 50% de anticipo para habilitado de materiales y el 50% saldo contra entrega e instalación conforme. Aceptamos transferencias bancarias, Yape/Plin, tarjetas y emitimos Factura o Boleta electrónica.",
  },
];
