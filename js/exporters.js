/**
 * Módulo Exportador Dual:
 * 1) Formato Word Oficial ESPOCH (.docx) basado exactamente en el modelo institucional adjunto
 * 2) Formato Moodle XML (.xml) compatible con el Banco de Preguntas del Aula Virtual Moodle ESPOCH
 * Carrera de Gestión del Transporte - ESPOCH
 * Autores: Ing. Yolanda Telenchano, Ing. Marco Santillán, Ing. Diego Haro
 */

window.Exporters = (function () {
  /**
   * Escapa caracteres especiales para XML
   */
  function escapeXml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /**
   * Genera un bloque de casilla de verificación (checkbox) nativo de Word (w:sdt + w14:checkbox)
   */
  function buildWordCheckboxXml(label, isChecked, idBase) {
    const checkedVal = isChecked ? "1" : "0";
    const symbol = isChecked ? "☒" : "☐";
    const safeId = Math.abs((idBase * 9301 + 49297) % 2147483647);

    return `
      <w:sdt>
        <w:sdtPr>
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
          </w:rPr>
          <w:id w:val="${safeId}"/>
          <w14:checkbox>
            <w14:checked w14:val="${checkedVal}"/>
            <w14:checkedState w14:val="2612" w14:font="Verdana"/>
            <w14:uncheckedState w14:val="2610" w14:font="Verdana"/>
          </w14:checkbox>
        </w:sdtPr>
        <w:sdtContent>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Segoe UI Symbol" w:hAnsi="Segoe UI Symbol" w:cs="Segoe UI Symbol"/>
              ${isChecked ? "<w:b/>" : ""}
            </w:rPr>
            <w:t>${symbol}</w:t>
          </w:r>
        </w:sdtContent>
      </w:sdt>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
          ${isChecked ? "<w:b/>" : ""}
        </w:rPr>
        <w:t xml:space="preserve"> ${escapeXml(label)}         </w:t>
      </w:r>`;
  }

  /**
   * Convierte texto (posiblemente multilínea) en uno o varios párrafos <w:p> de Word
   */
  function buildTextParagraphsXml(text, options = {}) {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l, idx, arr) => l.length > 0 || arr.length === 1);

    const isBold = options.bold ? "<w:b/>" : "";
    const isItalic = options.italic ? "<w:i/>" : "";
    const jc = options.align ? `<w:jc w:val="${options.align}"/>` : '<w:jc w:val="both"/>';
    const indent = options.indent ? `<w:ind w:left="${options.indent}"/>` : "";

    return lines
      .map(
        (line) => `
      <w:p>
        <w:pPr>
          <w:spacing w:before="40" w:after="40" w:line="240" w:lineRule="auto"/>
          ${indent}
          ${jc}
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
            ${isBold}
            ${isItalic}
            <w:sz w:val="22"/>
            <w:szCs w:val="22"/>
          </w:rPr>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
            ${isBold}
            ${isItalic}
            <w:sz w:val="22"/>
            <w:szCs w:val="22"/>
          </w:rPr>
          <w:t xml:space="preserve">${escapeXml(line)}</w:t>
        </w:r>
      </w:p>`
      )
      .join("");
  }

  /**
   * Construye una fila <w:tr> de la tabla de reactivo siguiendo exactamente el modelo Word adjunto
   */
  function buildTableRowXml(labelXmlText, rightCellContentXml, minHeight = 560, isLabelItalic = false) {
    return `
      <w:tr>
        <w:trPr>
          <w:trHeight w:val="${minHeight}"/>
        </w:trPr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="2802" w:type="dxa"/>
            <w:vAlign w:val="center"/>
          </w:tcPr>
          <w:p>
            <w:pPr>
              <w:spacing w:before="40" w:after="40" w:line="240" w:lineRule="auto"/>
              <w:rPr>
                <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
                <w:b/>
                ${isLabelItalic ? "<w:i/><w:iCs/>" : ""}
              </w:rPr>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
                <w:b/>
                ${isLabelItalic ? "<w:i/><w:iCs/>" : ""}
              </w:rPr>
              <w:t xml:space="preserve">${escapeXml(labelXmlText)}</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="5918" w:type="dxa"/>
            <w:vAlign w:val="center"/>
          </w:tcPr>
          ${rightCellContentXml}
        </w:tc>
      </w:tr>`;
  }

  /**
   * Construye la tabla <w:tbl> completa para un reactivo individual
   */
  function buildQuestionTableXml(q, index) {
    const idSeed = (index + 1) * 100;

    // Fila 3: NIVEL TAXONÓMICO con casillas de verificación (Conocimiento, Comprensión, Aplicación)
    const taxNorm = (q.nivelTaxonomico || "Conocimiento").toLowerCase();
    const isConocimiento = taxNorm.includes("conocimiento");
    const isComprension = taxNorm.includes("comprensi");
    const isAplicacion = taxNorm.includes("aplicaci");

    const nivelTaxonomicoCellXml = `
      <w:p>
        <w:pPr>
          <w:spacing w:before="60" w:after="60" w:line="240" w:lineRule="auto"/>
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
          </w:rPr>
        </w:pPr>
        ${buildWordCheckboxXml("Conocimiento", isConocimiento, idSeed + 1)}
        ${buildWordCheckboxXml("Comprensión", isComprension, idSeed + 2)}
        ${buildWordCheckboxXml("Aplicación", isAplicacion, idSeed + 3)}
      </w:p>`;

    // Fila 6: DISTRACTORES (OPCIONES DE RESPUESTA)
    const opcionesLines = (q.opciones || []).map((opt) => `${opt.letra}) ${opt.texto}`);
    const distractoresCellXml = buildTextParagraphsXml(opcionesLines.join("\n"), {
      align: "left",
      indent: 240
    });

    // Fila 7: RESPUESTA CORRECTA (con justificación técnica según Guía Académica 5.4)
    const respLines = [`Opción correcta: ${q.respuestaCorrectaLetra}) ${q.respuestaCorrectaTexto}`];
    if (q.justificacion && q.justificacion.trim()) {
      respLines.push(`Justificación: ${q.justificacion.trim()}`);
    }
    const respuestaCellXml = buildTextParagraphsXml(respLines.join("\n"), { align: "both" });

    // Fila 8: DIFICULTAD con casillas de verificación (Alto, Medio, Bajo)
    const difNorm = (q.dificultad || "Medio").toLowerCase();
    const isAlto = difNorm.includes("alto") || difNorm.includes("alta");
    const isMedio = difNorm.includes("medio") || difNorm.includes("media");
    const isBajo = difNorm.includes("bajo") || difNorm.includes("baja");

    const dificultadCellXml = `
      <w:p>
        <w:pPr>
          <w:spacing w:before="60" w:after="60" w:line="240" w:lineRule="auto"/>
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
          </w:rPr>
        </w:pPr>
        ${buildWordCheckboxXml("Alto", isAlto, idSeed + 4)}
        ${buildWordCheckboxXml("Medio", isMedio, idSeed + 5)}
        ${buildWordCheckboxXml("Bajo", isBajo, idSeed + 6)}
      </w:p>`;

    return `
      <w:p>
        <w:pPr>
          <w:spacing w:before="200" w:after="80" w:line="240" w:lineRule="auto"/>
          <w:keepNext/>
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
            <w:b/>
          </w:rPr>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
            <w:b/>
          </w:rPr>
          <w:t>REACTIVO: ${index + 1}</w:t>
        </w:r>
      </w:p>
      <w:tbl>
        <w:tblPr>
          <w:tblStyle w:val="Tablaconcuadrcula"/>
          <w:tblW w:w="0" w:type="auto"/>
          <w:tblBorders>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          </w:tblBorders>
          <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
        </w:tblPr>
        <w:tblGrid>
          <w:gridCol w:w="2802"/>
          <w:gridCol w:w="5918"/>
        </w:tblGrid>
        ${buildTableRowXml("UNIDAD-TEMA:  ", buildTextParagraphsXml(q.unidadTema), 550)}
        ${buildTableRowXml("RESULTADO DE APRENDIZAJE A MEDIR: ", buildTextParagraphsXml(q.resultadoAprendizaje), 550)}
        ${buildTableRowXml("NIVEL TAXONÓMICO: ", nivelTaxonomicoCellXml, 550)}
        ${buildTableRowXml("Instrucción", buildTextParagraphsXml(q.instruccion), 550)}
        ${buildTableRowXml("ENUNCIADO:  ", buildTextParagraphsXml(q.enunciado), 900)}
        ${buildTableRowXml("DISTRACTORES (OPCIONES DE RESPUESTA):", distractoresCellXml, 1100)}
        ${buildTableRowXml("RESPUESTA CORRECTA:  ", respuestaCellXml, 650)}
        ${buildTableRowXml("DIFICULTAD", dificultadCellXml, 550, true)}
        ${buildTableRowXml("TIEMPO ESTIMADO DE RESPUESTA", buildTextParagraphsXml(q.tiempoEstimado), 500, true)}
        ${buildTableRowXml("BIBLIOGRAFÍA:", buildTextParagraphsXml(q.bibliografia), 550)}
      </w:tbl>`;
  }

  /**
   * Construye un párrafo de metadatos superiores ("ETIQUETA: Valor")
   */
  function buildHeaderMetadataParagraphXml(label, value) {
    return `
      <w:p>
        <w:pPr>
          <w:spacing w:after="40" w:line="240" w:lineRule="auto"/>
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
          </w:rPr>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
            <w:b/>
          </w:rPr>
          <w:t xml:space="preserve">${escapeXml(label)} </w:t>
        </w:r>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
          </w:rPr>
          <w:t xml:space="preserve">${escapeXml(value)}</w:t>
        </w:r>
      </w:p>`;
  }

  /**
   * Genera el contenido completo de word/document.xml conservando el diseño, encabezado y pie de página del modelo
   */
  function buildWordDocumentXml(metadata, questions) {
    const headerMetaXml = [
      buildHeaderMetadataParagraphXml("ASIGNATURA:", metadata.asignatura || ""),
      buildHeaderMetadataParagraphXml("NOMBRE DEL PROFESOR:", metadata.profesor || ""),
      buildHeaderMetadataParagraphXml("PERIODO ACADÉMICO (PAO):", metadata.pao || ""),
      buildHeaderMetadataParagraphXml("FECHA:", metadata.fecha || ""),
      buildHeaderMetadataParagraphXml("NÚMERO DE REACTIVOS:", String(questions.length))
    ].join("");

    const tablesXml = questions.map((q, idx) => buildQuestionTableXml(q, idx)).join("");

    // Bloque final de firma de responsabilidad y créditos de autores del programa
    const signatureBlockXml = `
      <w:p>
        <w:pPr><w:spacing w:before="360" w:after="120"/></w:pPr>
      </w:p>
      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
          <w:spacing w:before="240" w:after="40"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
            <w:b/>
          </w:rPr>
          <w:t>____________________________________________</w:t>
        </w:r>
      </w:p>
      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
          <w:spacing w:after="20"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
            <w:b/>
          </w:rPr>
          <w:t>${escapeXml(metadata.profesor || "DOCENTE DE LA ASIGNATURA")}</w:t>
        </w:r>
      </w:p>
      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
          <w:spacing w:after="200"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
            <w:sz w:val="18"/>
          </w:rPr>
          <w:t>PROFESOR/A DE ${escapeXml(metadata.asignatura || "LA ASIGNATURA")}</w:t>
        </w:r>
      </w:p>
      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
          <w:spacing w:before="120" w:after="0"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="Arabic Typesetting"/>
            <w:i/>
            <w:color w:val="555555"/>
            <w:sz w:val="16"/>
          </w:rPr>
          <w:t>Sistema de Generación de Reactivos — Carrera de Gestión del Transporte (ESPOCH) | Autores: Ing. Yolanda Telenchano, Ing. Marco Santillán, Ing. Diego Haro</w:t>
        </w:r>
      </w:p>`;

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex" xmlns:cx1="http://schemas.microsoft.com/office/drawing/2015/9/8/chartex" xmlns:cx2="http://schemas.microsoft.com/office/drawing/2015/10/21/chartex" xmlns:cx3="http://schemas.microsoft.com/office/drawing/2016/5/9/chartex" xmlns:cx4="http://schemas.microsoft.com/office/drawing/2016/5/10/chartex" xmlns:cx5="http://schemas.microsoft.com/office/drawing/2016/5/11/chartex" xmlns:cx6="http://schemas.microsoft.com/office/drawing/2016/5/12/chartex" xmlns:cx7="http://schemas.microsoft.com/office/drawing/2016/5/13/chartex" xmlns:cx8="http://schemas.microsoft.com/office/drawing/2016/5/14/chartex" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink" xmlns:am3d="http://schemas.microsoft.com/office/drawing/2017/model3d" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:oel="http://schemas.microsoft.com/office/2019/extlst" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex" xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid" xmlns:w16="http://schemas.microsoft.com/office/word/2018/wordml" xmlns:w16du="http://schemas.microsoft.com/office/word/2023/wordml/word16du" xmlns:w16sdtdh="http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash" xmlns:w16sdtfl="http://schemas.microsoft.com/office/word/2024/wordml/sdtformatlock" xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14">
  <w:body>
    ${headerMetaXml}
    ${tablesXml}
    ${signatureBlockXml}
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rId11"/>
      <w:footerReference w:type="default" r:id="rId12"/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1417" w:right="1701" w:bottom="1417" w:left="1701" w:header="708" w:footer="708" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`;
  }

  /**
   * Genera el archivo Word (.docx) como un Blob a partir del modelo institucional base64
   */
  async function generateWordBlob(metadata, questions) {
    if (!window.JSZip) {
      throw new Error("JSZip no está cargado.");
    }
    if (!window.ESPOCH_ASSETS || !window.ESPOCH_ASSETS.docxTemplateBase64) {
      throw new Error("No se encontró la plantilla base64 del modelo Word institucional.");
    }

    const zip = await window.JSZip.loadAsync(window.ESPOCH_ASSETS.docxTemplateBase64, { base64: true });
    const newDocumentXml = buildWordDocumentXml(metadata, questions);
    zip.file("word/document.xml", newDocumentXml);

    return await zip.generateAsync({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      compression: "DEFLATE"
    });
  }

  /**
   * Genera el contenido XML en formato Moodle XML oficial con las mismas preguntas del documento Word
   */
  function buildMoodleXmlString(metadata, questions) {
    const asignaturaClean = (metadata.asignatura || "ASIGNATURA").trim();
    const paoClean = (metadata.pao || "2026").trim();
    const profesorClean = (metadata.profesor || "DOCENTE").trim();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<!-- ===================================================================== -->\n`;
    xml += `<!-- BANCO DE REACTIVOS PARA EVALUACIÓN DE RESULTADOS DE APRENDIZAJE       -->\n`;
    xml += `<!-- ESCUELA SUPERIOR POLITÉCNICA DE CHIMBORAZO (ESPOCH)                   -->\n`;
    xml += `<!-- CARRERA DE GESTIÓN DEL TRANSPORTE                                     -->\n`;
    xml += `<!-- Asignatura: ${escapeXml(asignaturaClean)}                             -->\n`;
    xml += `<!-- Profesor: ${escapeXml(profesorClean)}                                 -->\n`;
    xml += `<!-- PAO: ${escapeXml(paoClean)} | Fecha: ${escapeXml(metadata.fecha)}     -->\n`;
    xml += `<!-- Autores del Sistema: Ing. Yolanda Telenchano, Ing. Marco Santillán, Ing. Diego Haro -->\n`;
    xml += `<!-- ===================================================================== -->\n`;
    xml += `<quiz>\n`;

    // Categoría principal en Moodle
    xml += `  <question type="category">\n`;
    xml += `    <category>\n`;
    xml += `      <text>$course$/top/Evaluación Resultados de Aprendizaje/${escapeXml(asignaturaClean)}</text>\n`;
    xml += `    </category>\n`;
    xml += `    <info format="html">\n`;
    xml += `      <text><![CDATA[<p>Banco de reactivos de la asignatura <strong>${escapeXml(asignaturaClean)}</strong> (${escapeXml(paoClean)}) elaborado por <strong>${escapeXml(profesorClean)}</strong> para la Evaluación de Resultados de Aprendizaje de la Carrera de Gestión del Transporte - ESPOCH.</p>]]></text>\n`;
    xml += `    </info>\n`;
    xml += `    <idnumber></idnumber>\n`;
    xml += `  </question>\n\n`;

    questions.forEach((q, idx) => {
      const qNum = idx + 1;
      const questionName = `Reactivo ${String(qNum).padStart(2, "0")} [${q.dificultad} - ${q.nivelTaxonomico}] - ${q.unidadTema.slice(0, 75)}`;

      // Formatear enunciado con saltos de línea HTML
      const formattedStem = String(q.enunciado || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<p>${escapeXml(line)}</p>`)
        .join("");

      const questionHtml =
        `<div class="espoch-reactivo">` +
        `<p><em>${escapeXml(q.instruccion)}</em></p>` +
        `${formattedStem}` +
        `</div>`;

      const generalFeedbackHtml =
        `<p><strong>Respuesta correcta:</strong> ${escapeXml(q.respuestaCorrectaLetra)}) ${escapeXml(q.respuestaCorrectaTexto)}</p>` +
        `<p><strong>Justificación técnica:</strong> ${escapeXml(q.justificacion || "")}</p>` +
        `<p><strong>Unidad / Tema:</strong> ${escapeXml(q.unidadTema)}</p>` +
        `<p><strong>Resultado de Aprendizaje:</strong> ${escapeXml(q.resultadoAprendizaje)}</p>` +
        `<p><strong>Nivel Taxonómico:</strong> ${escapeXml(q.nivelTaxonomico)} | <strong>Dificultad:</strong> ${escapeXml(q.dificultad)} | <strong>Tiempo estimado:</strong> ${escapeXml(q.tiempoEstimado)}</p>` +
        `<p><strong>Bibliografía:</strong> ${escapeXml(q.bibliografia)}</p>`;

      xml += `  <!-- Reactivo ${qNum}: ${escapeXml(q.unidadTema)} -->\n`;
      xml += `  <question type="multichoice">\n`;
      xml += `    <name>\n`;
      xml += `      <text>${escapeXml(questionName)}</text>\n`;
      xml += `    </name>\n`;
      xml += `    <questiontext format="html">\n`;
      xml += `      <text><![CDATA[${questionHtml}]]></text>\n`;
      xml += `    </questiontext>\n`;
      xml += `    <generalfeedback format="html">\n`;
      xml += `      <text><![CDATA[${generalFeedbackHtml}]]></text>\n`;
      xml += `    </generalfeedback>\n`;
      xml += `    <defaultgrade>1.0000000</defaultgrade>\n`;
      xml += `    <penalty>0.3333333</penalty>\n`;
      xml += `    <hidden>0</hidden>\n`;
      xml += `    <idnumber>ESPOCH_TR_${qNum}_${escapeXml(q.dificultad.toUpperCase())}</idnumber>\n`;
      xml += `    <single>true</single>\n`;
      xml += `    <shuffleanswers>true</shuffleanswers>\n`;
      xml += `    <answernumbering>abc</answernumbering>\n`;
      xml += `    <showstandardinstruction>0</showstandardinstruction>\n`;
      xml += `    <correctfeedback format="html">\n`;
      xml += `      <text><![CDATA[<p>Respuesta correcta.</p>]]></text>\n`;
      xml += `    </correctfeedback>\n`;
      xml += `    <partiallycorrectfeedback format="html">\n`;
      xml += `      <text><![CDATA[<p>Respuesta parcialmente correcta.</p>]]></text>\n`;
      xml += `    </partiallycorrectfeedback>\n`;
      xml += `    <incorrectfeedback format="html">\n`;
      xml += `      <text><![CDATA[<p>Respuesta incorrecta.</p>]]></text>\n`;
      xml += `    </incorrectfeedback>\n`;
      xml += `    <shownumcorrect/>\n`;

      (q.opciones || []).forEach((opt) => {
        const isCorrect = opt.esCorrecta || opt.letra === q.respuestaCorrectaLetra;
        const fraction = isCorrect ? "100" : "0";
        const feedbackText = isCorrect
          ? `<p>¡Correcto! ${escapeXml(q.justificacion || "")}</p>`
          : `<p>Opción incorrecta. Revise los fundamentos de ${escapeXml(q.unidadTema)} en la bibliografía del sílabo.</p>`;

        xml += `    <answer fraction="${fraction}" format="html">\n`;
        xml += `      <text><![CDATA[<p>${escapeXml(opt.texto)}</p>]]></text>\n`;
        xml += `      <feedback format="html">\n`;
        xml += `        <text><![CDATA[${feedbackText}]]></text>\n`;
        xml += `      </feedback>\n`;
        xml += `    </answer>\n`;
      });

      xml += `    <tags>\n`;
      xml += `      <tag><text>Dificultad:${escapeXml(q.dificultad)}</text></tag>\n`;
      xml += `      <tag><text>Taxonomia:${escapeXml(q.nivelTaxonomico)}</text></tag>\n`;
      xml += `      <tag><text>${escapeXml(q.tipoPregunta)}</text></tag>\n`;
      xml += `    </tags>\n`;
      xml += `  </question>\n\n`;
    });

    xml += `</quiz>\n`;
    return xml;
  }

  /**
   * Dispara la descarga de un Blob en el navegador
   */
  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  }

  /**
   * Normaliza un nombre de archivo seguro
   */
  function sanitizeFilename(str) {
    return String(str || "Reactivos")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 60);
  }

  /**
   * Descarga el archivo Word (.docx)
   */
  async function downloadWordFile(metadata, questions) {
    const blob = await generateWordBlob(metadata, questions);
    const baseName = sanitizeFilename(metadata.asignatura);
    const filename = `Reactivos_${baseName}_ESPOCH.docx`;
    triggerDownload(blob, filename);
    return filename;
  }

  /**
   * Descarga el archivo Moodle XML (.xml)
   */
  function downloadMoodleXmlFile(metadata, questions) {
    const xmlStr = buildMoodleXmlString(metadata, questions);
    const blob = new Blob([xmlStr], { type: "application/xml;charset=utf-8" });
    const baseName = sanitizeFilename(metadata.asignatura);
    const filename = `Reactivos_${baseName}_Moodle.xml`;
    triggerDownload(blob, filename);
    return filename;
  }

  /**
   * Descarga ambos archivos simultáneamente (Word .docx + Moodle .xml)
   */
  async function downloadBothFiles(metadata, questions) {
    const wordFilename = await downloadWordFile(metadata, questions);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const xmlFilename = downloadMoodleXmlFile(metadata, questions);
    return { wordFilename, xmlFilename };
  }

  return {
    buildWordDocumentXml,
    generateWordBlob,
    buildMoodleXmlString,
    downloadWordFile,
    downloadMoodleXmlFile,
    downloadBothFiles
  };
})();
