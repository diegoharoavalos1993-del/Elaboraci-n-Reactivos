/**
 * Analizador Inteligente de Sílabos ESPOCH (Formato SAI - Instrumentos Académicos y Formatos Generales)
 * Soporta páginas verticales y páginas horizontales rotadas con matriz CTM (0 1 -1 0 595 0 cm) del SAI-ESPOCH.
 * Carrera de Gestión del Transporte - ESPOCH
 * Autores: Ing. Yolanda Telenchano, Ing. Marco Santillán, Ing. Diego Haro
 */

window.SyllabusParser = (function () {
  // Sílabo de ejemplo oficial precargado (solo se usa al iniciar o al pulsar el botón "Cargar Sílabo de Ejemplo")
  const EXAMPLE_SYLLABUS = {
    sede: "MATRIZ RIOBAMBA",
    facultad: "ADMINISTRACIÓN DE EMPRESAS",
    carrera: "GESTIÓN DEL TRANSPORTE",
    modalidad: "PRESENCIAL",
    asignatura: "INTRODUCCIÓN AL TRANSPORTE Y LA LOGÍSTICA",
    pao: "TERCERO (2 MARZO - 15 JULIO 2026)",
    paoNivel: "TERCERO",
    periodoAcademico: "2 MARZO - 15 JULIO 2026",
    unidadCurricular: "UNIDAD PROFESIONAL",
    codigo: "TRALP17",
    creditos: "144 / 3",
    profesor: "ING. DIEGO ALEXANDER HARO AVALOS",
    fechaPresentacion: new Date().toISOString().split("T")[0],
    resultadosCarrera: [
      {
        codigo: "RAC2",
        descripcion:
          "RAC2: Integrar equipos de trabajo multidisciplinarios tanto en investigaciones como en la toma de decisiones técnicas y/o económicas con solvencia, responsabilidad, conciencia ambiental y honestidad en el ámbito de transporte."
      },
      {
        codigo: "RAC3",
        descripcion:
          "RAC3: Aplicar los conocimientos de las ciencias básicas y del área profesionalizante para solucionar problemas de transporte, movilidad, logística y seguridad vial, mediante propuestas amigables con el medio ambiente."
      },
      {
        codigo: "RAC6",
        descripcion:
          "RAC6: Aplicar el razonamiento lógico, verbal, numérico y abstracto para enfrentar con éxito los retos que se le presenten en su ejercicio profesional."
      }
    ],
    unidades: [
      {
        numero: 1,
        titulo: "Introducción a la ingeniería del transporte",
        resultadoAprendizaje:
          "Define adecuadamente el área de estudio de la Ingeniería de Transporte con capacidad crítica, intelectual y personal.",
        temas: [
          "1: Transporte y sistemas de transporte",
          "1.1: Definición de transporte. Ejemplos prácticos.",
          "1.2: Definición de sistemas de transporte. Ejemplos prácticos.",
          "1.3: Desarrollo en el tiempo de los sistemas de transporte.",
          "1.4: Factores de crecimiento del transporte.",
          "2: Ingeniería del transporte.",
          "2.1: Fundamentos de la ingeniería del transporte.",
          "2.2: Objetivos de la ingeniería del transporte.",
          "2.3: Consideraciones y tipos de estudios de la ingeniería del transporte."
        ]
      },
      {
        numero: 2,
        titulo: "El transporte intermodal",
        resultadoAprendizaje:
          "Identifica con precisión los modos de transporte existentes y los beneficios sociales y económicos que traen consigo.",
        temas: [
          "1: Conceptos básicos",
          "1.1: Conceptos básicos del transporte intermodal.",
          "2: El transporte intermodal en el Ecuador.",
          "2.1: Intermodalidad en el transporte del país.",
          "2.2: Problemas del transporte en el Ecuador.",
          "2.3: Nuevas tendencias de transporte en el Ecuador.",
          "3: Los sistemas de transporte en el mundo.",
          "3.1: Diversificación de los sistemas de transporte.",
          "3.2: La intermodalidad en el mundo."
        ]
      },
      {
        numero: 3,
        titulo: "La logística y su importancia",
        resultadoAprendizaje:
          "Conoce con precisión la logística del transporte y sus aplicaciones dentro y fuera del país.",
        temas: [
          "1: Caracterización de la logística.",
          "1.1: Análisis de la logística.",
          "1.2: Conceptos generales de la logística.",
          "1.3: Características de la doctrina logística.",
          "1.4: Contacto y empleo del servicio de logística.",
          "2: Principios de la logística.",
          "2.1: Principios logísticos.",
          "2.2: Procesos logísticos.",
          "2.3: Instalaciones logísticas.",
          "2.4: Importancia de las instalaciones logísticas."
        ]
      },
      {
        numero: 4,
        titulo: "Procesos logísticos y la cadena de distribución",
        resultadoAprendizaje:
          "Conoce adecuadamente los procesos logísticos que se deben realizar para el traslado de diferentes tipos de carga.",
        temas: [
          "1: Ciclo logístico",
          "1.1: Conceptualización del ciclo logístico.",
          "1.2: Casos prácticos de los ciclos logísticos.",
          "1.3: Actividades específicas del transporte",
          "2: Los abastecimientos.",
          "2.1: Definición e importancia de los abastecimientos.",
          "2.2: Clasificación de los abastecimientos.",
          "2.3: Ciclo de abastecimiento.",
          "3: Índice de consumo.",
          "3.1: Diferencias nacionales e internacionales.",
          "3.2: Indicadores de consumo de un país.",
          "3.3: Relación del consumo del transporte."
        ]
      },
      {
        numero: 5,
        titulo: "Estrategia del transporte",
        resultadoAprendizaje:
          "Conoce con precisión las estrategias del transporte que se presentan en el país mediante el análisis de la infraestructura y los servicios para optimizar tiempo y recursos, para fomentar una movilidad sustentable y sostenible.",
        temas: [
          "1: Planteamiento de transportes.",
          "2: Principio del uso de transportes.",
          "3: Importancia de la planificación del transporte.",
          "4: Estrategias del proceso.",
          "5: Introducción a los planes de desarrollo.",
          "6: Introducción a los planes de movilidad.",
          "6.1: Valorización de vías y rutas."
        ]
      }
    ],
    bibliografia: {
      basica: [
        "Arenal, Carmen. (2022). Transporte de larga distancia. Recuperado de: https://elibro.net/es/ereader/espoch/226118"
      ],
      complementaria: [
        "Barros, Alvaro; Pazmay, Pablo. (2024). Derecho y planificacion del transporte. Recuperado de: https://elibro.net/es/ereader/espoch/283271",
        "Narayanaswami, Sundaravalli. (2023). Intelligent Transportation Systems: Concepts and Cases. Recuperado de: https://elibro.net/es/lc/espoch/titulos/227029"
      ]
    }
  };

  /**
   * Normaliza las coordenadas visuales (visualX de izquierda a derecha, visualY de arriba hacia abajo)
   * considerando tanto páginas verticales normales como páginas horizontales rotadas por CTM (0 1 -1 0 595 0 cm)
   * que genera el sistema SAI de la ESPOCH en las páginas 2 a 9 de los sílabos.
   */
  function normalizePdfItemCoordinates(item, viewBoxWidth, viewBoxHeight) {
    const t = item.transform || [1, 0, 0, 1, 0, 0];
    const a = t[0];
    const b = t[1];
    const c = t[2];
    const d = t[3];
    const tx = t[4];
    const ty = t[5];

    // Detectar si el texto está rotado 90 grados (matriz CTM [0, 1, -1, 0, 595, 0] usada por SAI-ESPOCH en páginas horizontales)
    const isRotated90 = Math.abs(a) < 0.01 && Math.abs(d) < 0.01 && Math.abs(b) > 0.01 && Math.abs(c) > 0.01;

    if (isRotated90) {
      if (b > 0 && c < 0) {
        // Rotación SAI-ESPOCH: tx crece de arriba hacia abajo (30..565), ty crece de izquierda a derecha (30..812)
        return {
          str: item.str || "",
          x: ty,
          y: tx,
          width: item.width || Math.abs(item.str?.length || 1) * 5,
          isLandscape: true
        };
      } else {
        return {
          str: item.str || "",
          x: viewBoxHeight - ty,
          y: viewBoxWidth - tx,
          width: item.width || Math.abs(item.str?.length || 1) * 5,
          isLandscape: true
        };
      }
    }

    // Página vertical normal: tx crece de izquierda a derecha (36..559), ty crece de abajo hacia arriba (36..806)
    return {
      str: item.str || "",
      x: tx,
      y: viewBoxHeight - ty,
      width: item.width || Math.abs(item.str?.length || 1) * 5,
      isLandscape: viewBoxWidth > viewBoxHeight
    };
  }

  /**
   * Agrupa elementos posicionados (x, y) en líneas ordenadas de arriba hacia abajo y de izquierda a derecha
   */
  function buildLinesFromPositionedItems(items, yTolerance = 4.5) {
    const valid = items.filter((it) => it.str && it.str.trim().length > 0);
    valid.sort((p, q) => {
      const yDiff = p.y - q.y;
      if (Math.abs(yDiff) > yTolerance) return yDiff;
      return p.x - q.x;
    });

    const lines = [];
    for (const it of valid) {
      const lastLine = lines[lines.length - 1];
      if (!lastLine || Math.abs(it.y - lastLine.y) > yTolerance) {
        lines.push({
          y: it.y,
          items: [it]
        });
      } else {
        lastLine.items.push(it);
      }
    }

    return lines.map((line) => {
      line.items.sort((p, q) => p.x - q.x);
      let text = "";
      let prevEndX = null;
      for (const it of line.items) {
        if (prevEndX !== null) {
          const gap = it.x - prevEndX;
          if (gap > 18) {
            text += " | ";
          } else if (gap > 1.5) {
            text += " ";
          }
        }
        text += it.str.trim();
        prevEndX = it.x + (it.width || it.str.length * 5);
      }
      return {
        y: line.y,
        minX: line.items[0].x,
        text: text.trim(),
        items: line.items
      };
    });
  }

  /**
   * Extrae tanto el texto estructurado como las columnas de tablas de un archivo PDF usando PDF.js
   */
  async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    if (!window.pdfjsLib) {
      throw new Error("La librería PDF.js no está disponible.");
    }

    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = "";
    const pagesStructured = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const viewBox = page.view || [0, 0, viewport.width || 595, viewport.height || 842];
      const vbWidth = viewBox[2] - viewBox[0] || 595;
      const vbHeight = viewBox[3] - viewBox[1] || 842;

      const textContent = await page.getTextContent();
      const normItems = textContent.items.map((item) => normalizePdfItemCoordinates(item, vbWidth, vbHeight));

      const pageLines = buildLinesFromPositionedItems(normItems, 4.5);
      const pageStr = pageLines.map((l) => l.text).join("\n");

      fullText += `\n--- PÁGINA ${pageNum} ---\n` + pageStr + "\n";

      pagesStructured.push({
        pageNum,
        items: normItems,
        lines: pageLines
      });
    }

    return {
      fullText,
      pagesStructured
    };
  }

  /**
   * Extrae texto de un archivo Word (.docx) usando Mammoth.js
   */
  async function extractTextFromDocx(file) {
    const arrayBuffer = await file.arrayBuffer();
    if (window.mammoth) {
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      return {
        fullText: result.value,
        pagesStructured: null
      };
    }
    throw new Error("No se pudo procesar el archivo DOCX.");
  }

  /**
   * Extrae las unidades directamente por coordenadas de columna cuando el PDF proviene del SAI-ESPOCH
   * En el SAI-ESPOCH:
   * - La columna izquierda (x < 225.5) contiene: "Unidad No.", "Título de la Unidad:" y todos los "TEMAS Y SUBTEMAS"
   * - La columna derecha (x >= 225.5) en la cabecera de unidad contiene: "RESULTADOS DE APRENDIZAJE:" y su descripción
   */
  function extractUnitsFromStructuredPages(pagesStructured) {
    if (!pagesStructured || !pagesStructured.length) return [];

    // Reunir todos los elementos con un eje Y global continuo a lo largo del documento
    const globalItems = [];
    let yOffset = 0;
    for (const p of pagesStructured) {
      for (const it of p.items) {
        const s = (it.str || "").trim();
        if (!s) continue;
        // Ignorar pies de página como "Página: 2 de 10"
        if (/^P[áa]gina:\s*\d+\s*de\s*\d+$/i.test(s)) continue;
        globalItems.push({
          ...it,
          str: s,
          globalY: yOffset + it.y,
          pageNum: p.pageNum
        });
      }
      yOffset += 1000;
    }

    // Encontrar dónde empieza la sección 3 ("3. Estructura y Desarrollo de la asignatura") y dónde termina ("4. Mecanismos de Evaluación")
    const allLines = buildLinesFromPositionedItems(
      globalItems.map((it) => ({ ...it, y: it.globalY })),
      4.5
    );

    let sec4GlobalY = Infinity;
    for (const line of allLines) {
      if (/4\.\s*Mecanismos\s+de\s+Evaluaci[óo]n/i.test(line.text)) {
        sec4GlobalY = line.y;
        break;
      }
    }

    // Buscar todas las cabeceras "Unidad No." antes de la sección 4
    const unitAnchors = [];
    for (const line of allLines) {
      if (line.y >= sec4GlobalY) break;
      const m = line.text.match(/Unidad\s*No\.?\s*\|?\s*(\d+)/i);
      if (m) {
        unitAnchors.push({
          numero: parseInt(m[1], 10),
          startY: line.y
        });
      }
    }

    if (unitAnchors.length === 0) return [];

    const extractedUnits = [];

    for (let i = 0; i < unitAnchors.length; i++) {
      const anchor = unitAnchors[i];
      const nextY = i + 1 < unitAnchors.length ? unitAnchors[i + 1].startY : sec4GlobalY;

      const sliceItems = globalItems.filter((it) => it.globalY >= anchor.startY - 3 && it.globalY < nextY - 3);

      // Encontrar la línea de cabecera de tabla "TEMAS Y SUBTEMAS" dentro de esta unidad
      const sliceLines = buildLinesFromPositionedItems(
        sliceItems.map((it) => ({ ...it, y: it.globalY })),
        4.5
      );

      let temasHeaderY = anchor.startY + 45;
      for (const l of sliceLines) {
        if (/TEMAS\s+Y\s+SUBTEMAS/i.test(l.text)) {
          temasHeaderY = l.y;
          break;
        }
      }

      // 1) Cabecera de la unidad (entre anchor.startY y temasHeaderY)
      const headerItems = sliceItems.filter((it) => it.globalY >= anchor.startY - 2 && it.globalY < temasHeaderY - 2);

      // En la cabecera:
      // - Título de la unidad está a la izquierda (x < 225)
      // - Resultado de aprendizaje de la unidad está a la derecha (x >= 225)
      const leftHeaderLines = buildLinesFromPositionedItems(
        headerItems.filter((it) => it.x < 225).map((it) => ({ ...it, y: it.globalY })),
        4.5
      );
      const rightHeaderLines = buildLinesFromPositionedItems(
        headerItems.filter((it) => it.x >= 225).map((it) => ({ ...it, y: it.globalY })),
        4.5
      );

      const leftHeaderText = leftHeaderLines.map((l) => l.text.replace(/\|/g, " ")).join(" ");
      let titulo = `Unidad ${anchor.numero}`;
      const tMatch = leftHeaderText.match(/T[íi]tulo\s+de\s+la\s+Unidad\s*:?\s*(.+)$/i);
      if (tMatch && tMatch[1]) {
        titulo = tMatch[1].replace(/\s+/g, " ").trim();
      } else {
        const cleanedLeft = leftHeaderText.replace(/Unidad\s*No\.?\s*\d+/i, "").replace(/T[íi]tulo\s+de\s+la\s+Unidad\s*:?/i, "").trim();
        if (cleanedLeft) titulo = cleanedLeft;
      }

      const rightHeaderText = rightHeaderLines.map((l) => l.text.replace(/\|/g, " ")).join(" ");
      let raUnidad = rightHeaderText
        .replace(/RESULTADOS?\s+DE\s+APRENDIZAJE\s*:?/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      // 2) Cuerpo de la unidad: TEMAS Y SUBTEMAS (estrictamente columna izquierda x < 225.5 debajo de temasHeaderY)
      const bodyLeftItems = sliceItems.filter((it) => it.globalY > temasHeaderY + 4 && it.x < 225.5);
      const bodyLeftLines = buildLinesFromPositionedItems(
        bodyLeftItems.map((it) => ({ ...it, y: it.globalY })),
        4.5
      );

      // Reconstruir temas (uniendo líneas que son continuación del tema anterior en la primera columna)
      const temas = [];
      let currentTema = "";
      for (const l of bodyLeftLines) {
        const lineStr = l.text.replace(/\|/g, " ").trim();
        if (!lineStr) continue;
        // Ignorar encabezados repetidos si la tabla cruza de página
        if (/^(TEMAS\s+Y\s+SUBTEMAS|M[ÉE]TODOS|ESTRATEGIAS|RECURSOS|AMBIENTES|[ÁA]ulicos|Pr[áa]cticos|Virtuales)/i.test(lineStr)) {
          continue;
        }
        // Si inicia con numeración (ej. "1:", "1.1:", "1.1.", "1.1 ", "• ", "- ")
        if (/^(\d+(?:\.\d+)*\s*[:.-]|\d+\.\d+\s+|[•\-]\s+)/.test(lineStr)) {
          if (currentTema) temas.push(currentTema.trim());
          currentTema = lineStr;
        } else {
          if (currentTema) {
            currentTema += " " + lineStr;
          } else {
            currentTema = lineStr;
          }
        }
      }
      if (currentTema) temas.push(currentTema.trim());

      extractedUnits.push({
        numero: anchor.numero,
        titulo: titulo.replace(/\.$/, "").trim(),
        resultadoAprendizaje: raUnidad || `Aplica los conocimientos técnicos de ${titulo}.`,
        temas: temas.length > 0 ? temas : [`1: Fundamentos de ${titulo}`, `1.1: Análisis y aplicación de ${titulo}`]
      });
    }

    return extractedUnits;
  }

  /**
   * Analiza el contenido extraído de cualquier Sílabo (PDF, DOCX o Texto) y estructura todos sus componentes
   */
  function parseSyllabusText(extractionResult, fileName = "") {
    const rawText = typeof extractionResult === "string" ? extractionResult : extractionResult.fullText || "";
    const pagesStructured = typeof extractionResult === "object" && extractionResult ? extractionResult.pagesStructured : null;

    const text = rawText.replace(/\r/g, "");
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    const parsed = {
      sede: "MATRIZ RIOBAMBA",
      facultad: "ADMINISTRACIÓN DE EMPRESAS",
      carrera: "GESTIÓN DEL TRANSPORTE",
      modalidad: "PRESENCIAL",
      asignatura: "",
      pao: "",
      paoNivel: "",
      periodoAcademico: "",
      unidadCurricular: "UNIDAD PROFESIONAL",
      codigo: "",
      profesor: "",
      fechaPresentacion: new Date().toISOString().split("T")[0],
      resultadosCarrera: [],
      unidades: [],
      bibliografia: {
        basica: [],
        complementaria: []
      },
      rawText: rawText,
      fileName: fileName
    };

    // 1. Extraer ASIGNATURA (buscando la fila de tabla "ASIGNATURA | ..." o "ASIGNATURA ..." en mayúsculas, evitando "1. Datos generales... de la asignatura")
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^1\.\s*Datos\s+generales/i.test(line)) continue;

      const rowMatch = line.match(/^ASIGNATURA\s*(?:\||:)\s*(.+)$/i) || line.match(/^ASIGNATURA\s+([A-ZÁÉÍÓÚÑ0-9\s,.:()-]{3,})$/);
      if (rowMatch && rowMatch[1]) {
        const candidate = rowMatch[1].replace(/^\|+|\|+$/g, "").trim();
        if (candidate && !/^PAO|PERIODO|NIVEL/i.test(candidate)) {
          parsed.asignatura = candidate;
          break;
        }
      }
      if (/^ASIGNATURA\s*:?$/i.test(line) && lines[i + 1]) {
        parsed.asignatura = lines[i + 1].replace(/^\|+|\|+$/g, "").trim();
        break;
      }
    }

    // Respaldo de Asignatura desde el pie de firma ("PROFESOR DE [ASIGNATURA]")
    if (!parsed.asignatura) {
      const profDeMatch = text.match(/PROFESOR(?:\s*\/?\s*A)?\s+DE\s+([A-ZÁÉÍÓÚÑ0-9\s,()-]{4,100})/i);
      if (profDeMatch && profDeMatch[1]) {
        parsed.asignatura = profDeMatch[1].split("\n")[0].replace(/\|/g, "").trim();
      }
    }

    if (!parsed.asignatura && fileName) {
      parsed.asignatura = fileName
        .replace(/\.(pdf|docx|doc|txt)$/i, "")
        .replace(/[_-]+/g, " ")
        .toUpperCase();
    }

    // 2. Extraer PAO y PERÍODO ACADÉMICO
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^PAO\b/i.test(line)) {
        const cleaned = line
          .replace(/^PAO\s*(?:\(PER[ÍI]ODO\s+ACAD[ÉE]MICO(?:\s+ORDINARIO)?\))?/i, "")
          .replace(/\|/g, " ")
          .replace(/:/g, " ")
          .trim();
        if (cleaned && !/^ORDINARIO\)$/i.test(cleaned)) {
          parsed.paoNivel = cleaned;
        } else if (lines[i + 1]) {
          const nextClean = lines[i + 1].replace(/ORDINARIO\)/i, "").replace(/\|/g, " ").trim();
          if (nextClean && !/^PER[ÍI]ODO/i.test(nextClean)) {
            parsed.paoNivel = nextClean;
          } else if (lines[i + 2] && !/^PER[ÍI]ODO/i.test(lines[i + 2])) {
            parsed.paoNivel = lines[i + 2].replace(/\|/g, " ").trim();
          }
        }
      }

      if (/^PER[ÍI]ODO\s+ACAD[ÉE]MICO(?!\s+ORDINARIO)/i.test(line)) {
        const perClean = line
          .replace(/^PER[ÍI]ODO\s+ACAD[ÉE]MICO/i, "")
          .replace(/\|/g, " ")
          .replace(/:/g, " ")
          .trim();
        if (perClean) {
          parsed.periodoAcademico = perClean;
        } else if (lines[i + 1] && !/^UNIDAD/i.test(lines[i + 1])) {
          parsed.periodoAcademico = lines[i + 1].replace(/\|/g, " ").trim();
        }
      }
    }

    parsed.pao = [parsed.paoNivel, parsed.periodoAcademico].filter(Boolean).join(" (") + (parsed.paoNivel && parsed.periodoAcademico ? ")" : "");
    if (!parsed.pao) parsed.pao = "VIGENTE 2026";

    // 3. Unidad de Organización Curricular y Código
    if (/UNIDAD\s+B[ÁA]SICA/i.test(text)) {
      parsed.unidadCurricular = "UNIDAD BÁSICA";
    } else if (/UNIDAD\s+DE\s+INTEGRACI[ÓO]N\s+CURRICULAR|TITULACI[ÓO]N/i.test(text)) {
      parsed.unidadCurricular = "UNIDAD DE INTEGRACIÓN CURRICULAR";
    } else {
      parsed.unidadCurricular = "UNIDAD PROFESIONAL";
    }

    const codMatch = text.match(/UNIDAD\s+(?:PROFESIONAL|B[ÁA]SICA|DE\s+INTEGRACI[ÓO]N\s+CURRICULAR)\s*(?:\|\s*)?([A-Z0-9-]{4,12})/i) || text.match(/\b([A-Z]{4,6}\d{2,4})\b/);
    if (codMatch && codMatch[1]) {
      parsed.codigo = codMatch[1].trim();
    }

    // 4. Extraer Nombre del Profesor
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^NOMBRES?\s+DEL\s+PROFESOR/i.test(line)) {
        const namePart = line
          .replace(/^NOMBRES?\s+DEL\s+PROFESOR/i, "")
          .replace(/\|/g, " ")
          .replace(/:/g, " ")
          .trim();
        if (namePart.length > 3) {
          parsed.profesor = namePart;
          break;
        } else if (lines[i + 1] && !/^N[ÚU]MERO|^CORREO/i.test(lines[i + 1])) {
          parsed.profesor = lines[i + 1].replace(/\|/g, " ").trim();
          break;
        }
      }
    }

    // Respaldo de Profesor desde la página de firmas ("ELABORADO POR:")
    if (!parsed.profesor) {
      for (let i = 0; i < lines.length; i++) {
        if (/^PROFESOR(?:\s*\/?\s*A)?\s+DE\s+/i.test(lines[i]) && i > 0) {
          for (let j = i - 1; j >= Math.max(0, i - 4); j--) {
            const prev = lines[j].replace(/[_|]/g, "").trim();
            if (prev.length > 6 && !/ELABORADO|FIRMADO|VALIDAR|QR/i.test(prev)) {
              parsed.profesor = prev;
              break;
            }
          }
          if (parsed.profesor) break;
        }
      }
    }
    if (!parsed.profesor) {
      parsed.profesor = "DOCENTE DE LA ASIGNATURA";
    }

    // 5. Extraer Resultados de Aprendizaje de la Carrera (RAC)
    const sec2Match = text.match(/2\.\s*Resultado\/?s\s+de\s+aprendizaje\s+de\s+la\s+carrera[\s\S]*?(?=3\.\s*Estructura|Unidad\s*No)/i);
    const sec2Text = sec2Match ? sec2Match[0] : text;

    const racRegex = /(RAC\s*\d+|RA\s*\d+|R\.A\.\s*\d+)\s*[:.-]\s*([^\n]+(?:\n(?!RAC\s*\d+|RA\s*\d+|3\.\s*Estructura|Unidad\s*No|--- P[ÁA]GINA)[^\n]+)*)/gi;
    let racMatch;
    while ((racMatch = racRegex.exec(sec2Text)) !== null) {
      const codigo = racMatch[1].replace(/\s+/g, "").toUpperCase();
      const desc = (codigo + ": " + racMatch[2].replace(/\|/g, " ").replace(/\s+/g, " ").trim()).slice(0, 450);
      parsed.resultadosCarrera.push({
        codigo,
        descripcion: desc
      });
    }

    if (parsed.resultadosCarrera.length === 0 && sec2Match) {
      const rawRacLines = sec2Text
        .split("\n")
        .map((l) => l.replace(/\|/g, " ").trim())
        .filter((l) => l.length > 25 && !/2\.\s*Resultado|--- P[ÁA]GINA|P[áa]gina:\s*\d+/i.test(l));
      if (rawRacLines.length > 0) {
        parsed.resultadosCarrera.push({
          codigo: "RAC1",
          descripcion: rawRacLines.join(" ")
        });
      }
    }

    // 6. Extraer Unidades, Resultados de Aprendizaje de Unidad y Temas/Subtemas
    // Primero intentar la extracción geométrica por columnas (exacta para todos los PDFs del SAI-ESPOCH)
    if (pagesStructured && pagesStructured.length > 0) {
      parsed.unidades = extractUnitsFromStructuredPages(pagesStructured);
    }

    // Si es un DOCX o un PDF con otro diseño donde no se detectó por coordenadas, usar analizador textual flexible
    if (parsed.unidades.length === 0) {
      const unitBlocks = text.split(/(?=Unidad\s*(?:No\.?|N°|#)?\s*\|?\s*\d+)/i);
      for (const block of unitBlocks) {
        const uNumMatch = block.match(/Unidad\s*(?:No\.?|N°|#)?\s*\|?\s*(\d+)/i);
        if (!uNumMatch) continue;
        const numero = parseInt(uNumMatch[1], 10);

        let titulo = `Unidad ${numero}`;
        const titleMatch = block.match(/T[íi]tulo\s+de\s+la\s+Unidad\s*[:|]*\s*([^\n|]+)/i);
        if (titleMatch && titleMatch[1]) {
          titulo = titleMatch[1].replace(/RESULTADOS?\s+DE\s+APRENDIZAJE.*$/i, "").trim();
        }

        let raUnidad = "";
        const raMatch = block.match(/RESULTADOS?\s+DE\s*APRENDIZAJE\s*[:|]*\s*([^\n]+)/i);
        if (raMatch && raMatch[1]) {
          raUnidad = raMatch[1].replace(/T[íi]tulo\s+de\s+la\s+Unidad.*$/i, "").trim();
        }

        const temas = [];
        const bLines = block.split("\n");
        for (const rawLine of bLines) {
          const leftPart = rawLine.split("|")[0].trim();
          const topicMatch = leftPart.match(/^(\d+(?:\.\d+)*)\s*[:.-]?\s+([A-ZÁÉÍÓÚÑa-záéíóúñ].{3,140})/);
          if (topicMatch) {
            const candidate = `${topicMatch[1]}: ${topicMatch[2].trim()}`;
            if (!/Datos\s+generales|Resultado\/?s\s+de\s+aprendizaje|Estructura\s+y\s+Desarrollo|Mecanismos\s+de\s+Evaluaci|Bibliograf|Perfil\s+del\s+profesor/i.test(candidate)) {
              temas.push(candidate);
            }
          }
        }

        parsed.unidades.push({
          numero,
          titulo: titulo || `Unidad ${numero}`,
          resultadoAprendizaje: raUnidad || `Aplica los fundamentos técnicos de ${titulo || "la Unidad " + numero}.`,
          temas: temas.length > 0 ? temas : [`1: Conceptos fundamentales de ${titulo}`, `1.1: Aplicaciones de ${titulo}`]
        });
      }
    }

    // 7. Extraer Bibliografía Básica y Complementaria (de la sección 5 del sílabo subido)
    const bibSectionMatch = text.match(/5\.\s*Bibliograf[íi]a[\s\S]*?(?=6\.\s*Perfil|ELABORADO\s+POR|$)/i);
    if (bibSectionMatch) {
      const bibText = bibSectionMatch[0].replace(/--- P[ÁA]GINA \d+ ---/gi, "").replace(/P[áa]gina:\s*\d+\s*de\s*\d+/gi, "");
      const compSplit = bibText.split(/COMPLEMENTARIA/i);
      const basicaText = compSplit[0] || "";
      const compText = compSplit[1] || "";

      const extractCitations = (str) => {
        const results = [];
        const bLines = str
          .split("\n")
          .map((l) => l.replace(/\|/g, " ").trim())
          .filter((l) => l.length > 4 && !/^(5\.\s*Bibliograf|B[ÁA]SICA|COMPLEMENTARIA|PREPARACI[ÓO]N|TOTAL\s+10)/i.test(l));

        let current = "";
        for (const l of bLines) {
          if (/^\d+\.\s*$/.test(l)) continue;
          if (/^\d+\.\s+/.test(l) || (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+,\s+[A-ZÁÉÍÓÚÑ]/.test(l) && /\(\d{4}\)/.test(l))) {
            if (current) results.push(current.trim());
            current = l.replace(/^\d+\.\s*/, "");
          } else {
            current += (current ? " " : "") + l.replace(/^\d+\.\s*/, "");
          }
        }
        if (current) results.push(current.trim());
        return results.filter((r) => r.length > 12);
      };

      parsed.bibliografia.basica = extractCitations(basicaText);
      parsed.bibliografia.complementaria = extractCitations(compText);
    }

    // Si el documento subido no tenía estructura estándar, crear unidades basadas en el propio documento (NUNCA usar EXAMPLE_SYLLABUS)
    if (parsed.unidades.length === 0) {
      const fallbackTitle = parsed.asignatura || "la Asignatura";
      parsed.unidades = [
        {
          numero: 1,
          titulo: `Fundamentos de ${fallbackTitle}`,
          resultadoAprendizaje: `Analiza los conceptos y principios fundamentales de ${fallbackTitle}.`,
          temas: [`1.1: Conceptos generales de ${fallbackTitle}`, `1.2: Marco teórico y normativo de ${fallbackTitle}`]
        },
        {
          numero: 2,
          titulo: `Aplicaciones y Procesos de ${fallbackTitle}`,
          resultadoAprendizaje: `Aplica métodos y procedimientos técnicos de ${fallbackTitle} en la resolución de problemas.`,
          temas: [`2.1: Metodologías y procesos operativos en ${fallbackTitle}`, `2.2: Casos prácticos aplicados a ${fallbackTitle}`]
        }
      ];
    }

    if (parsed.resultadosCarrera.length === 0) {
      parsed.resultadosCarrera = [
        {
          codigo: "RAC",
          descripcion: `Aplicar los conocimientos teóricos y prácticos de ${parsed.asignatura || "la asignatura"} para solucionar problemas en el ámbito de la Gestión del Transporte.`
        }
      ];
    }

    if (parsed.bibliografia.basica.length === 0 && parsed.bibliografia.complementaria.length === 0) {
      parsed.bibliografia.basica = [`Bibliografía básica declarada en el sílabo de la asignatura ${parsed.asignatura || ""}.`];
    }

    return parsed;
  }

  return {
    EXAMPLE_SYLLABUS,
    extractTextFromPDF,
    extractTextFromDocx,
    parseSyllabusText,
    getExampleSyllabus: function () {
      const copy = JSON.parse(JSON.stringify(EXAMPLE_SYLLABUS));
      copy.fechaPresentacion = new Date().toISOString().split("T")[0];
      return copy;
    }
  };
})();
