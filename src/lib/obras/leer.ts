import catalogoRaw from "@/config/catalogo-data.json";
import type { ObraItem, SubzonaInfo, ZonaInfo, ZonaSlug } from "./esquema";

interface RawItem {
  id: string;
  categoria: string;
  subcategoria: string;
  subcategoriaNombre: string;
  titulo: string;
  src: string;
  thumb: string;
  ancho: number;
  alto: number;
  destacado: boolean;
}

function clasificarObra(item: RawItem, index: number): ObraItem {
  const sub = item.subcategoriaNombre.toLowerCase();
  let zona: ZonaSlug = "huancayo";
  let zonaNombre = "Huancayo Metropolitano";
  let subzonaSlug = "san-carlos";
  let subzonaNombre = "San Carlos & Centro";
  let ubicacionDetalle = "San Carlos";
  let tipo: "residencial" | "comercial" | "institucional" = "residencial";
  let tipoNombre = "Residencial";
  let materiales = ["Cristal Templado", "Perfilería de Aluminio"];

  // ── HUALLHUAS ──
  if (sub.includes("huallhuas")) {
    zona = "huallhuas";
    zonaNombre = "Huallhuas";
    subzonaSlug = "residencial-huallhuas";
    subzonaNombre = "Residencias Huallhuas";
    ubicacionDetalle = "Residencial Huallhuas";
    materiales = ["Ventanas Herméticas Serie 38", "Mamparas Serie 80"];
  }
  // ── LA HUAYCHA ──
  else if (sub.includes("huaycha")) {
    zona = "la-huaycha";
    zonaNombre = "La Huaycha";
    if (sub.includes("grifo")) {
      subzonaSlug = "grifo-servicios";
      subzonaNombre = "Estación de Servicios Grifo";
      ubicacionDetalle = "Grifo La Huaycha";
      tipo = "comercial";
      tipoNombre = "Comercial / Servicios";
      materiales = ["Fachada Muro Cortina", "Panel Compuesto ACP"];
    } else {
      subzonaSlug = "residencias-campestres";
      subzonaNombre = "Residencias Campestres";
      ubicacionDetalle = "Residencia La Huaycha";
      materiales = ["Cerramiento Panorámico", "Vidrio DVH"];
    }
  }
  // ── JAUJA ──
  else if (sub.includes("jauja")) {
    zona = "jauja";
    zonaNombre = "Jauja";
    if (sub.includes("h jauja")) {
      subzonaSlug = "hospital-jauja";
      subzonaNombre = "Hospital de Jauja";
      ubicacionDetalle = "Hospital de Jauja";
      tipo = "institucional";
      tipoNombre = "Salud / Institucional";
    } else {
      subzonaSlug = "residencial-jauja";
      subzonaNombre = "Obras Residenciales";
      ubicacionDetalle = "Residencial Jauja";
    }
    materiales = ["Ventanas Acústicas", "Puertas de Cristal"];
  }
  // ── LIMA ──
  else if (sub.includes("lima") || sub.includes("usil") || sub.includes("ignacio")) {
    zona = "lima";
    zonaNombre = "Lima";
    if (sub.includes("usil") || sub.includes("ignacio")) {
      subzonaSlug = "usil";
      subzonaNombre = "Campus USIL";
      ubicacionDetalle = "Universidad San Ignacio de Loyola (USIL)";
      tipo = "institucional";
      tipoNombre = "Campus Universitario";
      materiales = ["Divisiones Acústicas", "Mamparas Templadas", "Barandas Inox"];
    } else {
      subzonaSlug = "obras-lima";
      subzonaNombre = "Obras Corporativas Lima";
      ubicacionDetalle = "Lima Metropolitana";
      tipo = "comercial";
      tipoNombre = "Comercial / Corporativo";
      materiales = ["Fachada Vidriada", "Mamparas Serie Monumental"];
    }
  }
  // ── HUANCAYO: UNCP ──
  else if (sub.includes("uncp")) {
    zona = "huancayo";
    zonaNombre = "Huancayo Metropolitano";
    subzonaSlug = "uncp";
    subzonaNombre = "Campus UNCP";
    ubicacionDetalle = "Universidad Nacional del Centro del Perú (UNCP)";
    tipo = "institucional";
    tipoNombre = "Educativo / Superior";
    materiales = ["Cielos Rasos", "Divisiones Modulares", "Ventanas Serie 25"];
  }
  // ── HUANCAYO: EL TAMBO & EVITAMIENTO ──
  else if (sub.includes("evitamiento") || sub.includes("13 noviembre") || sub.includes("genesis")) {
    zona = "huancayo";
    zonaNombre = "Huancayo Metropolitano";
    subzonaSlug = "el-tambo";
    subzonaNombre = "El Tambo & Evitamiento";
    ubicacionDetalle = sub.includes("evitamiento")
      ? "Av. Evitamiento El Tambo"
      : sub.includes("13 noviembre")
      ? "Av. 13 de Noviembre"
      : "Génesis El Tambo";
    tipo = sub.includes("evitamiento") ? "comercial" : "residencial";
    tipoNombre = sub.includes("evitamiento") ? "Comercial" : "Residencial";
    materiales = ["Fachada Vidriada", "Ventanas Corredizas"];
  }
  // ── HUANCAYO: CHILCA & AZAPAMPA ──
  else if (sub.includes("azapampa") || sub.includes("estructura") || sub.includes("raez")) {
    zona = "huancayo";
    zonaNombre = "Huancayo Metropolitano";
    subzonaSlug = "chilca-azapampa";
    subzonaNombre = "Chilca & Azapampa";
    ubicacionDetalle = sub.includes("azapampa") ? "Azapampa" : "Chilca Estructuras";
    materiales = ["Estructura Metálica", "Cerramiento Vidriado"];
  }
  // ── HUANCAYO: EDIFICIOS & CONDOMINIOS ──
  else if (sub.includes("cantuta") || sub.includes("santa rosa") || sub.includes("primavera") || sub.includes("esc  aco")) {
    zona = "huancayo";
    zonaNombre = "Huancayo Metropolitano";
    subzonaSlug = "edificios-condominios";
    subzonaNombre = "Edificios & Condominios";
    ubicacionDetalle = sub.includes("cantuta")
      ? "Edificio La Cantuta"
      : sub.includes("santa rosa")
      ? "Complejo Santa Rosa"
      : sub.includes("primavera")
      ? "Residencial Primavera"
      : "Escuela Aco";
    tipo = sub.includes("cantuta") || sub.includes("santa rosa") ? "comercial" : "residencial";
    tipoNombre = sub.includes("cantuta") ? "Edificio Multifamiliar" : "Comercial";
    materiales = ["Mamparas Panorámicas", "Ventanas Serie 38"];
  }
  // ── HUANCAYO: SAN CARLOS & CENTRO ──
  else {
    zona = "huancayo";
    zonaNombre = "Huancayo Metropolitano";
    subzonaSlug = "san-carlos";
    subzonaNombre = "San Carlos & Centro";
    ubicacionDetalle = "Residencial San Carlos";
    materiales = ["Línea Spazio Baños", "Mamparas Serie 80"];
  }

  // Jerarquía visual en bento
  let nivel: 1 | 2 | 3 = 2;
  if (index === 0 || index === 4 || index === 9 || index === 15 || index === 22 || (index % 12 === 0)) {
    nivel = 1; // 2 columnas hero
  } else if (index % 5 === 0) {
    nivel = 3;
  }

  // Título limpio y profesional
  const titulo = `Proyecto en ${ubicacionDetalle}`;

  return {
    id: item.id,
    titulo,
    zona,
    zonaNombre,
    subzonaSlug,
    subzonaNombre,
    ubicacionDetalle,
    tipo,
    tipoNombre,
    materiales,
    src: item.src,
    thumb: item.thumb,
    ancho: item.ancho,
    alto: item.alto,
    destacado: item.destacado,
    nivel,
  };
}

let obrasCache: ObraItem[] | null = null;

export function obtenerTodasLasObras(): ObraItem[] {
  if (obrasCache) return obrasCache;

  const rawItems = (catalogoRaw.items as RawItem[]).filter(
    (i) => i.categoria === "obras-ejecutadas"
  );

  obrasCache = rawItems.map((item, idx) => clasificarObra(item, idx));
  return obrasCache;
}

export function obtenerZonas(): ZonaInfo[] {
  const obras = obtenerTodasLasObras();

  const extraerSubzonas = (obrasDeZona: ObraItem[]): SubzonaInfo[] => {
    const mapa: Record<string, { nombre: string; total: number }> = {};
    obrasDeZona.forEach((o) => {
      if (!mapa[o.subzonaSlug]) {
        mapa[o.subzonaSlug] = { nombre: o.subzonaNombre, total: 0 };
      }
      mapa[o.subzonaSlug].total += 1;
    });

    return Object.entries(mapa).map(([slug, val]) => ({
      slug,
      nombre: val.nombre,
      total: val.total,
    }));
  };

  const huancayoObras = obras.filter((o) => o.zona === "huancayo");
  const huaychaObras = obras.filter((o) => o.zona === "la-huaycha");
  const limaObras = obras.filter((o) => o.zona === "lima");
  const jaujaObras = obras.filter((o) => o.zona === "jauja");
  const huallhuasObras = obras.filter((o) => o.zona === "huallhuas");

  return [
    {
      slug: "todas",
      nombre: "Todas las Zonas",
      descripcion: "Portafolio general de proyectos ejecutados en la región central y Lima.",
      total: obras.length,
      subzonas: [
        { slug: "todas", nombre: "Todas las Ubicaciones", total: obras.length },
        { slug: "san-carlos", nombre: "San Carlos & Centro", total: obras.filter((o) => o.subzonaSlug === "san-carlos").length },
        { slug: "el-tambo", nombre: "El Tambo & Evitamiento", total: obras.filter((o) => o.subzonaSlug === "el-tambo").length },
        { slug: "uncp", nombre: "Campus UNCP", total: obras.filter((o) => o.subzonaSlug === "uncp").length },
        { slug: "grifo-servicios", nombre: "La Huaycha (Grifo)", total: obras.filter((o) => o.subzonaSlug === "grifo-servicios").length },
        { slug: "usil", nombre: "Lima (USIL)", total: obras.filter((o) => o.subzonaSlug === "usil").length },
        { slug: "edificios-condominios", nombre: "Edificios & Condominios", total: obras.filter((o) => o.subzonaSlug === "edificios-condominios").length },
        { slug: "residencial-jauja", nombre: "Jauja", total: obras.filter((o) => o.subzonaSlug === "residencial-jauja").length },
        { slug: "residencial-huallhuas", nombre: "Huallhuas", total: obras.filter((o) => o.subzonaSlug === "residencial-huallhuas").length },
        { slug: "chilca-azapampa", nombre: "Chilca & Azapampa", total: obras.filter((o) => o.subzonaSlug === "chilca-azapampa").length },
      ],
    },
    {
      slug: "huancayo",
      nombre: "Huancayo Metropolitano",
      descripcion: "San Carlos, El Tambo, Chilca, UNCP, Cantuta, Evitamiento y Azapampa.",
      total: huancayoObras.length,
      subzonas: [
        { slug: "todas", nombre: "Todo Huancayo", total: huancayoObras.length },
        ...extraerSubzonas(huancayoObras),
      ],
    },
    {
      slug: "la-huaycha",
      nombre: "La Huaycha",
      descripcion: "Grifos de servicio, estaciones comerciales y residencias campestres.",
      total: huaychaObras.length,
      subzonas: [
        { slug: "todas", nombre: "Toda La Huaycha", total: huaychaObras.length },
        ...extraerSubzonas(huaychaObras),
      ],
    },
    {
      slug: "lima",
      nombre: "Lima & USIL",
      descripcion: "Instalaciones corporativas y campus universitario de la USIL.",
      total: limaObras.length,
      subzonas: [
        { slug: "todas", nombre: "Todo Lima", total: limaObras.length },
        ...extraerSubzonas(limaObras),
      ],
    },
    {
      slug: "jauja",
      nombre: "Jauja",
      descripcion: "Proyectos hospitalarios, comerciales y viviendas en Jauja.",
      total: jaujaObras.length,
      subzonas: [
        { slug: "todas", nombre: "Todo Jauja", total: jaujaObras.length },
        ...extraerSubzonas(jaujaObras),
      ],
    },
    {
      slug: "huallhuas",
      nombre: "Huallhuas",
      descripcion: "Obras residenciales de gran formato y cerramientos de terrazas.",
      total: huallhuasObras.length,
      subzonas: [
        { slug: "todas", nombre: "Todo Huallhuas", total: huallhuasObras.length },
        ...extraerSubzonas(huallhuasObras),
      ],
    },
  ];
}

/**
 * Obtiene una obra específica por su ID único.
 */
export function obtenerObraPorId(id: string): ObraItem | undefined {
  return obtenerTodasLasObras().find((o) => o.id === id);
}

/**
 * Obtiene la lista de IDs para generación de rutas estáticas.
 */
export function obtenerSlugsDeObras(): { id: string }[] {
  return obtenerTodasLasObras().map((o) => ({ id: o.id }));
}
