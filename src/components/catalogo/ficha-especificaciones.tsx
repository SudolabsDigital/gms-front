import { Shield, CheckCircle2, Wrench } from "lucide-react";
import { siteConfig } from "@/config/site-config";

interface FichaProps {
  slug: string;
}

const FICHAS_POR_CATEGORIA: Record<
  string,
  {
    perfil: string;
    vidrio: string;
    acabados: string[];
    garantia: string;
    ventajas: string[];
  }
> = {
  ventanas: {
    perfil: "Aluminio aleación 6063-T5 (Series 20, 25, 38 Batiente, Serie 80 Europea) o PVC multicámara.",
    vidrio: "Monolítico 4mm–6mm, Templado 6mm–8mm o Doble Vidrio Hermético DVH (cámara de gas/aire 8–12mm).",
    acabados: ["Negro Mate Anodizado", "Natural Mate Satinado", "Blanco Termoesmaltado", "Champagne / Bronce", "Foliado Madera"],
    garantia: "1 Año de Garantía Escrita sobre hermeticidad, rodamientos y estanqueidad.",
    ventajas: [
      "Doble empaque perimetral EPDM para aislamiento acústico y térmico contra el frío andino.",
      "Troquelado milimétrico en taller con matrices de precisión para cierre hermético.",
      "Rodajes con rodamientos de aguja de alta durabilidad y deslizamiento suave.",
    ],
  },
  mamparas: {
    perfil: "Perfilería pesada monumental Serie 80 o Sistema Nova sin marcos perimetrales visibles.",
    vidrio: "Cristal templado de seguridad de 8mm a 10mm certificado con bordes pulidos brillantes.",
    acabados: ["Negro Mate Anodizado", "Natural Mate", "Acero Inox Brillante / Satinado", "Arenado decorativo a diseño"],
    garantia: "1 Año de Garantía en rodamientos, guías y fijaciones estructurales.",
    ventajas: [
      "Apertura monumental de piso a techo para máxima luminosidad y amplitud visual.",
      "Frenos hidráulicos de piso para puertas vaivén con retención a 90°.",
      "Cristal templado 5 veces más resistente al impacto que el vidrio convencional.",
    ],
  },
  puertas: {
    perfil: "Aluminio estructural tubular, panel compuesto ACP o cristal templado sin marco.",
    vidrio: "Cristal templado 8mm–10mm, acrílico texturado para baños o paneles opacos de aluminio.",
    acabados: ["Negro Mate", "Natural Mate", "Madera", "Blanco", "Panel ACP Cepillado"],
    garantia: "1 Año de Garantía en cerraduras, picaportes y rodamientos.",
    ventajas: [
      "Boxes y cabinas de ducha con perfiles de acero inox 304 resistentes al agua y la cal.",
      "Cerraduras de alta seguridad y manijas tubulares de acero inoxidable.",
      "Sellado con silicona neutra fungicida antihongos para zonas húmedas.",
    ],
  },
  "fachadas-muros-cortina": {
    perfil: "Montantes y travesaños estructurales de aluminio de 100mm a 150mm.",
    vidrio: "Cristal laminado de seguridad 4+4 / 5+5 con PVB acústico o vidrio con control solar reflectivo.",
    acabados: ["Negro Anodizado", "Gris Grafito", "Natural Anodizado", "Panel PAC Alucobond"],
    garantia: "Garantía estructural certificada con memoria de cálculo para resistencia eólica.",
    ventajas: [
      "Pegado de cristal con silicona estructural bicomponente certificada.",
      "Alta eficiencia energética reduciendo la carga de climatización interior.",
      "Imagen corporativa moderna de vanguardia para edificios y centros comerciales.",
    ],
  },
  barandas: {
    perfil: "Tubulares y postes en acero inoxidable AISI 304/316 o aluminio anodizado reforzado.",
    vidrio: "Cristal templado o laminado de 8mm a 12mm fijado con spigots, botones o pasamanos continuo.",
    acabados: ["Acero Inox Satinado / Pulido", "Negro Mate Anodizado", "Natural Mate"],
    garantia: "1 Año de Garantía en anclajes estructurales y durabilidad anticorrosiva.",
    ventajas: [
      "Anclaje químico Hilti / Fischer para máxima rigidez estructural en escaleras y balcones.",
      "Resistencia a impactos según norma técnica de edificación E.020.",
      "Diseño minimalista sin postes intermedios para vistas panorámicas limpias.",
    ],
  },
  "techos-policarbonato": {
    perfil: "Estructuras ligeras en aluminio estructural o vigas metálicas electro-soldadas.",
    vidrio: "Policarbonato alveolar 6–10mm con protección UV, policarbonato compacto o cristal laminado.",
    acabados: ["Esmaltado Blanco", "Negro Mate", "Gris", "Policarbonato Cristal / Opal / Bronce"],
    garantia: "Garantía contra filtraciones pluviales y degradación solar.",
    ventajas: [
      "Protección contra rayos UV al 99% con excelente transmisión de luz natural.",
      "Opciones de techos corredizos manuales o motorizados para ventilación controlada.",
      "Canaletas de drenaje pluvial integradas para evitar goteos y humedad en muros.",
    ],
  },
};

export function FichaEspecificaciones({ slug }: FichaProps) {
  const ficha = FICHAS_POR_CATEGORIA[slug] || FICHAS_POR_CATEGORIA.ventanas;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Wrench className="size-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">
            Especificaciones Técnicas & Calidad de Manufactura
          </h3>
          <p className="text-xs text-muted-foreground">
            Estándares aplicados en taller de {siteConfig.direccion.corta}, {siteConfig.direccion.ciudad}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Perfilería y Vidrio */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-muted/60 p-4 border border-border/50">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary block mb-1">
              Perfilería & Estructura
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {ficha.perfil}
            </p>
          </div>

          <div className="rounded-xl bg-muted/60 p-4 border border-border/50">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary block mb-1">
              Cristal & Vidriado Recomendado
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {ficha.vidrio}
            </p>
          </div>

          <div className="rounded-xl bg-muted/60 p-4 border border-border/50">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary block mb-1.5">
              Acabados Disponibles
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ficha.acabados.map((acabado) => (
                <span
                  key={acabado}
                  className="rounded-full bg-card border border-border px-2.5 py-1 text-[10px] font-bold text-slate-700"
                >
                  {acabado}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Ventajas y Garantía */}
        <div className="flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              Ventajas de Fabricación GMS Integra
            </span>
            {ficha.ventajas.map((v, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">{v}</p>
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-4 text-emerald-950">
            <Shield className="size-6 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-emerald-900">Garantía Escrita Certificada</span>
              <span className="text-emerald-800/80">{ficha.garantia}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
