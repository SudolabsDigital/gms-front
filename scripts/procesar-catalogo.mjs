import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ORIGEN = "C:\\Users\\USUARIO\\Documents\\!GMSINTEGRA\\F. SERVICIOS 1";
const DESTINO = path.join(process.cwd(), "public", "catalogo");
const DESTINO_CONFIG = path.join(process.cwd(), "src", "config", "catalogo-data.json");

// Mapeo de carpetas de origen a categorías canónicas
const MAPEO_CATEGORIAS = {
  "VENTANAS": {
    slug: "ventanas",
    nombre: "Ventanas de Aluminio y PVC",
    descripcion: "Ventanas herméticas, sistemas corredizos Serie 20, 25, 38, 80 europea, Sistema Nova, ventanas proyectantes y perfiles de PVC acústico.",
    icono: "Layers",
    destacado: true,
  },
  "MAMPARAS": {
    slug: "mamparas",
    nombre: "Mamparas de Cristal Templado",
    descripcion: "Mamparas monumentales Serie 80, correderas Sistema Nova, puertas vaivén con freno hidráulico y arenados decorativos.",
    icono: "Maximize2",
    destacado: true,
  },
  "PUERTAS": {
    slug: "puertas",
    nombre: "Puertas y Cabinas de Ducha",
    descripcion: "Puertas de cristal templado, aluminio compuesto ACP, puertas residenciales clásicas, mamparas y boxes de ducha tipo spa.",
    icono: "DoorOpen",
    destacado: true,
  },
  "FACHADAS": {
    slug: "fachadas-muros-cortina",
    nombre: "Fachadas Integrales y Muros Cortina",
    descripcion: "Muros cortina de silicona estructural, frentes comerciales, revestimiento con panel de aluminio compuesto (Alucobond/PAC).",
    icono: "Building2",
    destacado: true,
  },
  "BARANDAS": {
    slug: "barandas",
    nombre: "Barandas de Acero y Cristal",
    descripcion: "Barandas en acero inoxidable 304/316, perfiles de aluminio con cristal templado de seguridad y cortavientos para azoteas.",
    icono: "Shield",
    destacado: true,
  },
  "TECHOS EN POLICARBONATO": {
    slug: "techos-policarbonato",
    nombre: "Techos y Coberturas",
    descripcion: "Estructuras de aluminio y fierro con policarbonato alveolar y compacto, techos corredizos y tragaluces en cristal laminado.",
    icono: "Umbrella",
    destacado: true,
  },
  "DIVISIONES": {
    slug: "divisiones",
    nombre: "Divisiones de Oficina y Ambientes",
    descripcion: "Panelería vidriada acústica para oficinas corporativas, bancos, mamparas divisorias y salas de reuniones.",
    icono: "LayoutGrid",
    destacado: false,
  },
  "OBRAS": {
    slug: "obras-ejecutadas",
    nombre: "Registro de Obras Ejecutadas",
    descripcion: "Proyectos terminados en Huancayo, El Tambo, Chilca, Huallhuas, La Huaycha, Jauja y obras corporativas en Lima.",
    icono: "Hammer",
    destacado: true,
  },
  "SPIDER": {
    slug: "sistema-spider",
    nombre: "Sistema Spider y Fachadas Suspendidas",
    descripcion: "Herrajes spider de acero inoxidable, rótulas articuladas y muros cortina suspendidos por cables.",
    icono: "Grid",
    destacado: false,
  },
  "ESPEJOS-BICELADOS": {
    slug: "espejos-biselados",
    nombre: "Espejos Decorativos y Biselados",
    descripcion: "Espejos biselados a medida, espejos retroiluminados LED para baños spa, mosaicos y diseños geométricos.",
    icono: "Sparkles",
    destacado: false,
  },
  "DRYWALL-BALDOSAS": {
    slug: "drywall-baldosas",
    nombre: "Drywall y Cielos Rasos",
    descripcion: "Tabiquería de drywall, cielos rasos suspendidos, baldosas acústicas y detalles arquitectónicos con luz indirecta.",
    icono: "Square",
    destacado: false,
  },
  "MUEBLES": {
    slug: "muebles-melamine",
    nombre: "Muebles Comerciales y Melamina",
    descripcion: "Mostradores para boticas y farmacias, muebles de recepción, reposteros y mobiliario comercial en melamina Pelíkano/Vesto.",
    icono: "Inbox",
    destacado: false,
  },
  "REPOSTERO EN ALUMINIO": {
    slug: "reposteros-aluminio",
    nombre: "Reposteros en Aluminio",
    descripcion: "Muebles de cocina y reposteros 100% en perfilería de aluminio estructural, anticorrosivos y resistentes a la humedad.",
    icono: "Utensils",
    destacado: false,
  },
  "REPISAS": {
    slug: "repisas-cristal",
    nombre: "Repisas de Cristal Flotante",
    descripcion: "Repisas de vidrio templado de 8mm y 10mm con soportes tipo pelícano y herrajes de acero inoxidable.",
    icono: "Menu",
    destacado: false,
  },
  "PIZARRA TEMPLADO": {
    slug: "pizarras-cristal",
    nombre: "Pizarras en Cristal Templado",
    descripcion: "Pizarras magnéticas y traslúcidas en cristal templado para oficinas, directorios y salas de capacitación.",
    icono: "FileText",
    destacado: false,
  },
  "REJAS": {
    slug: "rejas-seguridad",
    nombre: "Rejas de Seguridad Metálica",
    descripcion: "Rejas de protección, portones y cerrajería metálica para viviendas y locales comerciales.",
    icono: "Lock",
    destacado: false,
  },
  "FOT.DISEÑOS": {
    slug: "disenos-renders",
    nombre: "Diseños 3D y Renders",
    descripcion: "Modelado 3D, planos arquitectónicos y propuestas visuales previas a la fabricación e instalación.",
    icono: "PenTool",
    destacado: false,
  },
  "F. MUESTRAS  GMS INNOVO": {
    slug: "catalogo-materiales",
    nombre: "Catálogo de Perfiles y Herrajes",
    descripcion: "Muestras físicas de perfilería, tipos de cristal (catedral, reflectivo, templado), tiradores de acero y cerraduras.",
    icono: "BookOpen",
    destacado: false,
  },
};

function aSlug(texto) {
  return texto
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function limpiarTitulo(nombreArchivo, subcarpeta) {
  let limpio = path.basename(nombreArchivo, path.extname(nombreArchivo));
  limpio = limpio
    .replace(/FB_IMG_\d+/gi, "")
    .replace(/IMG_\d+_\d+/gi, "")
    .replace(/Screenshot_\d+-\d+/gi, "")
    .replace(/WhatsApp Video [^.]+/gi, "Video de Obra")
    .replace(/WhatsApp Image [^.]+/gi, "")
    .replace(/VID_\d+_\d+/gi, "Video de Obra")
    .replace(/DSC\d+/gi, "")
    .replace(/P100\d+/gi, "")
    .replace(/[-_]+/g, " ")
    .trim();

  if (!limpio || limpio.length < 3) {
    limpio = subcarpeta && subcarpeta !== "root" ? `${subcarpeta}` : "Modelo / Instalación";
  }

  // Capitalizar
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

const EXT_IMAGENES = new Set([".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP"]);

async function procesar() {
  console.log("🚀 Iniciando procesamiento de catálogo desde:", ORIGEN);

  if (!fs.existsSync(DESTINO)) {
    fs.mkdirSync(DESTINO, { recursive: true });
  }

  const itemsCatalogo = [];
  const estadisticas = {};

  const carpetas = fs.readdirSync(ORIGEN, { withFileTypes: true });

  for (const carpeta of carpetas) {
    if (!carpeta.isDirectory()) continue;
    const nombreCarpeta = carpeta.name;
    const infoCat = MAPEO_CATEGORIAS[nombreCarpeta];

    if (!infoCat) {
      console.log(`⚠️ Carpeta no mapeada: ${nombreCarpeta}, omitiendo.`);
      continue;
    }

    const catSlug = infoCat.slug;
    const dirDestinoCat = path.join(DESTINO, catSlug);
    const dirDestinoThumbs = path.join(dirDestinoCat, "thumbs");
    fs.mkdirSync(dirDestinoThumbs, { recursive: true });

    estadisticas[catSlug] = { total: 0, fotos: 0, videos: 0 };

    // Explorar recursivamente
    const rutaCarpetaOrigen = path.join(ORIGEN, nombreCarpeta);
    const todosLosArchivos = obtenerArchivosRecursivos(rutaCarpetaOrigen);

    console.log(`📁 Procesando [${infoCat.nombre}] - ${todosLosArchivos.length} archivos encontrados.`);

    let indiceEnCat = 0;

    for (const arch of todosLosArchivos) {
      const ext = path.extname(arch.rutaAbsoluta).toLowerCase();
      const esImg = EXT_IMAGENES.has(ext);

      if (!esImg) continue; // Solo procesamos fotos reales 100% verificadas

      indiceEnCat++;
      const subcarpetaSlug = aSlug(arch.subcarpeta || "general");
      const id = `${catSlug}-${subcarpetaSlug}-${indiceEnCat}`;
      const nombreArchivoLimpio = `${subcarpetaSlug}-${indiceEnCat}.webp`;

      const rutaDestinoWebp = path.join(dirDestinoCat, nombreArchivoLimpio);
      const rutaDestinoThumb = path.join(dirDestinoThumbs, nombreArchivoLimpio);

      const urlWebp = `/catalogo/${catSlug}/${nombreArchivoLimpio}`;
      const urlThumb = `/catalogo/${catSlug}/thumbs/${nombreArchivoLimpio}`;

      let ancho = 1200;
      let alto = 900;

      try {
        // Procesar con sharp.
        // ORIENTACIÓN: `metadata()` da las dimensiones del sensor, sin aplicar el EXIF, y sin `.rotate()` sharp
        // tampoco lo aplica al procesar. Hasta el 2026-09-17 este script no lo hacía: 188 de 1.533 fotos (las
        // de móvil tomadas en vertical) se publicaron de lado. Las orientaciones 5-8 giran 90°: se intercambian
        // las dimensiones para que describan la foto como se ve.
        const metadata = await sharp(arch.rutaAbsoluta).metadata();
        const girada90 = (metadata.orientation ?? 1) >= 5;
        ancho = (girada90 ? metadata.height : metadata.width) || 1200;
        alto = (girada90 ? metadata.width : metadata.height) || 900;

        // Imagen principal max 1200px
        await sharp(arch.rutaAbsoluta)
          .rotate()
          .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toFile(rutaDestinoWebp);

        // Thumbnail max 450px
        await sharp(arch.rutaAbsoluta)
          .rotate()
          .resize({ width: 450, height: 450, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 75, effort: 3 })
          .toFile(rutaDestinoThumb);

        estadisticas[catSlug].fotos++;
      } catch (err) {
        console.error(`❌ Error procesando imagen ${arch.rutaAbsoluta}:`, err.message);
        continue;
      }

      const item = {
        id,
        categoria: catSlug,
        subcategoria: subcarpetaSlug,
        subcategoriaNombre: arch.subcarpeta ? arch.subcarpeta.replace(/[-_.]/g, " ").trim() : "General",
        titulo: arch.titulo || limpiarTitulo(arch.nombre, arch.subcarpeta),
        src: urlWebp,
        thumb: urlThumb,
        ancho,
        alto,
        destacado: indiceEnCat <= 3, // Las primeras de cada categoría son destacadas
      };

      itemsCatalogo.push(item);
      estadisticas[catSlug].total++;
    }
  }

  // Estructurar el objeto final
  const categoriasArray = Object.values(MAPEO_CATEGORIAS).map((cat) => {
    const itemsDeCat = itemsCatalogo.filter((i) => i.categoria === cat.slug);
    const subcats = [...new Set(itemsDeCat.map((i) => i.subcategoria))].map((slug) => {
      const primerItem = itemsDeCat.find((i) => i.subcategoria === slug);
      return {
        slug,
        nombre: primerItem ? primerItem.subcategoriaNombre : slug,
        total: itemsDeCat.filter((i) => i.subcategoria === slug).length,
      };
    });

    const portada = itemsDeCat[0]?.src || "/og-image.png";

    return {
      slug: cat.slug,
      nombre: cat.nombre,
      descripcion: cat.descripcion,
      icono: cat.icono,
      destacado: cat.destacado,
      portada,
      totalItems: itemsDeCat.length,
      subcategorias: subcats,
    };
  });

  const resultado = {
    generadoEn: new Date().toISOString(),
    totalGeneral: itemsCatalogo.length,
    categorias: categoriasArray,
    items: itemsCatalogo,
  };

  fs.mkdirSync(path.dirname(DESTINO_CONFIG), { recursive: true });
  fs.writeFileSync(DESTINO_CONFIG, JSON.stringify(resultado, null, 2), "utf8");

  console.log("\n==================================================");
  console.log(`✅ Catálogo generado con éxito!`);
  console.log(`📊 Total items procesados: ${itemsCatalogo.length}`);
  console.log(`📁 Metadata guardada en: ${DESTINO_CONFIG}`);
  console.log("==================================================");
  console.table(estadisticas);
}

function obtenerArchivosRecursivos(directorioRaiz, subcarpetaActual = "") {
  const resultados = [];
  const entradas = fs.readdirSync(directorioRaiz, { withFileTypes: true });

  for (const ent of entradas) {
    const rutaCompleta = path.join(directorioRaiz, ent.name);
    if (ent.isDirectory()) {
      const nuevaSub = subcarpetaActual ? `${subcarpetaActual} / ${ent.name}` : ent.name;
      resultados.push(...obtenerArchivosRecursivos(rutaCompleta, nuevaSub));
    } else {
      resultados.push({
        nombre: ent.name,
        rutaAbsoluta: rutaCompleta,
        subcarpeta: subcarpetaActual,
      });
    }
  }

  return resultados;
}

procesar().catch(console.error);
