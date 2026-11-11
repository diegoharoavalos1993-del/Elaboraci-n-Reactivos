/**
 * Controlador Principal de la Aplicación (UI + Flujo de Trabajo Docente)
 * Evaluación de Resultados de Aprendizaje - Carrera de Gestión del Transporte (ESPOCH)
 * Autores: Ing. Yolanda Telenchano, Ing. Marco Santillán, Ing. Diego Haro
 */

(function () {
  const state = {
    syllabus: null,
    selectedUnits: [1, 2, 3, 4, 5],
    cantBajo: 2,
    cantMedio: 2,
    cantAlto: 2,
    tiposSeleccionados: [
      "Selección Múltiple",
      "De complementación, completación, mutiladas",
      "De asociación o emparejamiento",
      "De ordenación"
    ],
    questions: [],
    previewMode: "word" // "word" | "edit" | "xml"
  };

  // Inicialización al cargar el DOM
  document.addEventListener("DOMContentLoaded", () => {
    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "lib/pdf.worker.min.js";
    }
    initLogos();
    bindStaticEvents();
    // Cargar por defecto el Sílabo de Ejemplo adjunto para que el docente/coordinador vea todo funcional de inmediato
    loadSyllabusData(
      window.SyllabusParser.getExampleSyllabus(),
      "Sílabo de Ejemplo cargado (Introducción al Transporte y la Logística)",
      false
    );
  });

  function initLogos() {
    if (window.ESPOCH_ASSETS) {
      const headerImgs = document.querySelectorAll(".js-header-logo");
      headerImgs.forEach((img) => {
        img.src = window.ESPOCH_ASSETS.headerLogoDataUrl;
      });
      const footerImgs = document.querySelectorAll(".js-footer-logo");
      footerImgs.forEach((img) => {
        img.src = window.ESPOCH_ASSETS.footerLogoDataUrl;
      });
    }
  }

  function showToast(message) {
    const toast = document.getElementById("toastNotification");
    if (!toast) return;
    toast.innerHTML = message;
    toast.classList.add("show");
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 4200);
  }

  function bindStaticEvents() {
    // Dropzone y selector de archivo de Sílabo
    const dropzone = document.getElementById("syllabusDropzone");
    const fileInput = document.getElementById("syllabusFileInput");
    const btnSelectFile = document.getElementById("btnSelectFile");
    const btnLoadExample = document.getElementById("btnLoadExample");

    if (btnSelectFile && fileInput) {
      btnSelectFile.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON") {
          fileInput.click();
        }
      });

      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });

      dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
      });

      dropzone.addEventListener("drop", async (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
          await handleSyllabusFileUpload(files[0]);
        }
      });

      fileInput.addEventListener("change", async (e) => {
        if (e.target.files && e.target.files.length > 0) {
          await handleSyllabusFileUpload(e.target.files[0]);
        }
      });
    }

    if (btnLoadExample) {
      btnLoadExample.addEventListener("click", (e) => {
        e.stopPropagation();
        const ex = window.SyllabusParser.getExampleSyllabus();
        loadSyllabusData(ex, "Se cargó el Sílabo de Ejemplo: Introducción al Transporte y la Logística (Ing. Diego Haro).");
      });
    }

    // Inputs de metadatos del sílabo
    ["metaAsignatura", "metaProfesor", "metaPao", "metaFecha", "metaUnidadCurricular"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => {
          syncMetadataFromInputs();
          renderPreview();
        });
      }
    });

    // Contadores de dificultad (+ / -)
    document.querySelectorAll(".js-counter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-target");
        const delta = parseInt(btn.getAttribute("data-delta"), 10);
        const input = document.getElementById(target);
        if (input) {
          const nextVal = Math.max(0, Math.min(50, (parseInt(input.value, 10) || 0) + delta));
          input.value = nextVal;
          syncDifficultyCounts();
          generatePreviewQuestions(false);
        }
      });
    });

    ["inputCantBajo", "inputCantMedio", "inputCantAlto"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => {
          syncDifficultyCounts();
          generatePreviewQuestions(false);
        });
      }
    });

    // Botones de plantillas rápidas (Presets)
    document.querySelectorAll(".js-preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".js-preset-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const bajo = parseInt(btn.getAttribute("data-bajo"), 10);
        const medio = parseInt(btn.getAttribute("data-medio"), 10);
        const alto = parseInt(btn.getAttribute("data-alto"), 10);
        document.getElementById("inputCantBajo").value = bajo;
        document.getElementById("inputCantMedio").value = medio;
        document.getElementById("inputCantAlto").value = alto;
        syncDifficultyCounts();
        generatePreviewQuestions(false);
      });
    });

    // Checkboxes de tipos de pregunta
    document.querySelectorAll(".js-question-type-cb").forEach((cb) => {
      cb.addEventListener("change", () => {
        const card = cb.closest(".type-checkbox-card");
        if (card) {
          card.classList.toggle("checked", cb.checked);
        }
        const selected = Array.from(document.querySelectorAll(".js-question-type-cb:checked")).map((el) => el.value);
        if (selected.length === 0) {
          cb.checked = true;
          if (card) card.classList.add("checked");
          showToast("⚠️ Debe mantener seleccionado al menos un tipo de reactivo.");
          return;
        }
        state.tiposSeleccionados = selected;
        generatePreviewQuestions(false);
      });
    });

    // Botón Generar Vista Previa
    const btnGeneratePreview = document.getElementById("btnGeneratePreview");
    if (btnGeneratePreview) {
      btnGeneratePreview.addEventListener("click", async () => {
        await generatePreviewQuestions(true);
      });
    }

    // Tabs de modo de vista previa
    document.querySelectorAll(".js-view-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".js-view-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        state.previewMode = tab.getAttribute("data-mode");
        renderPreview();
      });
    });

    // Botón Agregar Reactivo Manual
    const btnAddManualQuestion = document.getElementById("btnAddManualQuestion");
    if (btnAddManualQuestion) {
      btnAddManualQuestion.addEventListener("click", () => {
        addManualQuestion();
      });
    }

    // Botones de Aceptar y Descargar (Word + Moodle XML)
    const btnAcceptAndGenerateBoth = document.getElementById("btnAcceptAndGenerateBoth");
    if (btnAcceptAndGenerateBoth) {
      btnAcceptAndGenerateBoth.addEventListener("click", async () => {
        await handleExportBoth();
      });
    }

    const btnExportWordOnly = document.getElementById("btnExportWordOnly");
    if (btnExportWordOnly) {
      btnExportWordOnly.addEventListener("click", async () => {
        await handleExportWord();
      });
    }

    const btnExportMoodleOnly = document.getElementById("btnExportMoodleOnly");
    if (btnExportMoodleOnly) {
      btnExportMoodleOnly.addEventListener("click", () => {
        handleExportMoodle();
      });
    }
  }

  /**
   * Procesa el archivo PDF o DOCX subido por el docente
   */
  async function handleSyllabusFileUpload(file) {
    const statusEl = document.getElementById("uploadStatusBadge");
    const fileInput = document.getElementById("syllabusFileInput");
    if (statusEl) {
      statusEl.innerHTML = `⏳ Analizando archivo: <strong>${escapeHtml(file.name)}</strong>...`;
      statusEl.style.background = "#fef3c7";
      statusEl.style.color = "#b45309";
    }

    try {
      let extractionResult = null;
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "pdf") {
        extractionResult = await window.SyllabusParser.extractTextFromPDF(file);
      } else if (ext === "docx") {
        extractionResult = await window.SyllabusParser.extractTextFromDocx(file);
      } else {
        const text = await file.text();
        extractionResult = { fullText: text, pagesStructured: [] };
      }

      const parsed = window.SyllabusParser.parseSyllabusText(extractionResult, file.name);
      parsed._uploadedFileName = file.name;
      await loadSyllabusData(
        parsed,
        `✅ Sílabo "${file.name}" cargado: ${parsed.asignatura} (${parsed.unidades.length} unidades actualizadas).`,
        true
      );
    } catch (err) {
      console.error("Error al leer el sílabo:", err);
      showToast("❌ No se pudo leer el archivo automáticamente. Verifique que sea un PDF o DOCX válido.");
      if (statusEl) {
        statusEl.textContent = "Error al leer archivo. Puede editar los campos manualmente.";
        statusEl.style.background = "#fee2e2";
        statusEl.style.color = "#991b1b";
      }
    } finally {
      if (fileInput) {
        fileInput.value = "";
      }
    }
  }

  /**
   * Carga los datos del sílabo en el estado y actualiza la interfaz
   */
  async function loadSyllabusData(syllabusObj, toastMsg, highlightChanges = false) {
    // Clonar para evitar mutaciones cruzadas entre sílabos
    state.syllabus = JSON.parse(JSON.stringify(syllabusObj));
    state.selectedUnits = (state.syllabus.unidades || []).map((u) => u.numero);

    // Poblar campos de metadatos
    const metaIds = ["metaAsignatura", "metaProfesor", "metaPao", "metaFecha", "metaUnidadCurricular"];
    document.getElementById("metaAsignatura").value = state.syllabus.asignatura || "";
    document.getElementById("metaProfesor").value = state.syllabus.profesor || "";
    document.getElementById("metaPao").value = state.syllabus.pao || "";
    document.getElementById("metaFecha").value =
      state.syllabus.fechaPresentacion || new Date().toISOString().split("T")[0];
    document.getElementById("metaUnidadCurricular").value =
      state.syllabus.unidadCurricular || "UNIDAD PROFESIONAL";

    const statusEl = document.getElementById("uploadStatusBadge");
    if (statusEl) {
      const fileTag = state.syllabus._uploadedFileName
        ? `<span style="font-weight:400; color:#047857;">[${escapeHtml(state.syllabus._uploadedFileName)}]</span> — `
        : "";
      statusEl.innerHTML = `✔ Sílabo activo: ${fileTag}<strong>${escapeHtml(state.syllabus.asignatura)}</strong> | Docente: <strong>${escapeHtml(state.syllabus.profesor || "Por definir")}</strong> (${state.syllabus.unidades.length} Unidades | ${(state.syllabus.bibliografia?.basica?.length || 0) + (state.syllabus.bibliografia?.complementaria?.length || 0)} Referencias bibliográficas)`;
      statusEl.style.background = "#eef9f2";
      statusEl.style.color = "#16793b";
    }

    renderSyllabusUnitsAndRac();
    syncDifficultyCounts();
    await generatePreviewQuestions(false);

    if (highlightChanges) {
      metaIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.style.transition = "background-color 0.4s ease, border-color 0.4s ease";
          el.style.backgroundColor = "#ecfdf5";
          el.style.borderColor = "#10b981";
          setTimeout(() => {
            el.style.backgroundColor = "";
            el.style.borderColor = "";
          }, 1800);
        }
      });
    }

    if (toastMsg) {
      showToast(toastMsg);
    }
  }

  function syncMetadataFromInputs() {
    if (!state.syllabus) return;
    state.syllabus.asignatura = document.getElementById("metaAsignatura").value.trim();
    state.syllabus.profesor = document.getElementById("metaProfesor").value.trim();
    state.syllabus.pao = document.getElementById("metaPao").value.trim();
    state.syllabus.fechaPresentacion = document.getElementById("metaFecha").value.trim();
    state.syllabus.unidadCurricular = document.getElementById("metaUnidadCurricular").value;
  }

  /**
   * Renderiza los chips de Unidades y el resumen de Resultados de Aprendizaje y Bibliografía extraídos del sílabo
   */
  function renderSyllabusUnitsAndRac() {
    const unitsContainer = document.getElementById("syllabusUnitsContainer");
    const racContainer = document.getElementById("syllabusRacContainer");
    const bibContainer = document.getElementById("syllabusBibContainer");

    if (unitsContainer && state.syllabus) {
      unitsContainer.innerHTML = "";
      (state.syllabus.unidades || []).forEach((u) => {
        const isChecked = state.selectedUnits.includes(u.numero);
        const label = document.createElement("label");
        label.className = `unit-chip ${isChecked ? "selected" : ""}`;
        label.innerHTML = `
          <input type="checkbox" value="${u.numero}" ${isChecked ? "checked" : ""}/>
          <span><strong>Unidad ${u.numero}:</strong> ${escapeHtml(u.titulo)} <small style="color:#64748b">(${(u.temas || []).length} temas)</small></span>
        `;
        const cb = label.querySelector("input");
        cb.addEventListener("change", () => {
          const val = parseInt(cb.value, 10);
          if (cb.checked) {
            if (!state.selectedUnits.includes(val)) state.selectedUnits.push(val);
            label.classList.add("selected");
          } else {
            if (state.selectedUnits.length <= 1) {
              cb.checked = true;
              showToast("⚠️ Debe seleccionar al menos una unidad del sílabo.");
              return;
            }
            state.selectedUnits = state.selectedUnits.filter((item) => item !== val);
            label.classList.remove("selected");
          }
          state.selectedUnits.sort((a, b) => a - b);
          generatePreviewQuestions(false);
        });
        unitsContainer.appendChild(label);
      });
    }

    if (racContainer && state.syllabus) {
      const racs = state.syllabus.resultadosCarrera || [];
      racContainer.innerHTML = racs
        .map(
          (r) =>
            `<div style="font-size:0.8rem; color:#334155; padding:4px 0; border-bottom:1px dashed #e2e8f0;">• ${escapeHtml(r.descripcion)}</div>`
        )
        .join("");
    }

    if (bibContainer && state.syllabus) {
      const allBibs = [].concat(
        (state.syllabus.bibliografia?.basica || []).map((b) => `[Básica] ${b}`),
        (state.syllabus.bibliografia?.complementaria || []).map((b) => `[Complementaria] ${b}`)
      );
      bibContainer.innerHTML = allBibs
        .map((b) => `<div style="font-size:0.78rem; color:#475569; padding:3px 0;">📖 ${escapeHtml(b)}</div>`)
        .join("");
    }
  }

  function syncDifficultyCounts() {
    state.cantBajo = Math.max(0, parseInt(document.getElementById("inputCantBajo").value || 0, 10));
    state.cantMedio = Math.max(0, parseInt(document.getElementById("inputCantMedio").value || 0, 10));
    state.cantAlto = Math.max(0, parseInt(document.getElementById("inputCantAlto").value || 0, 10));
    const total = state.cantBajo + state.cantMedio + state.cantAlto;

    const totalBadge = document.getElementById("totalQuestionsBadge");
    if (totalBadge) {
      totalBadge.textContent = `${total} Reactivo${total === 1 ? "" : "s"} (${state.cantBajo} Bajo, ${state.cantMedio} Medio, ${state.cantAlto} Alto)`;
    }
  }

  /**
   * Genera la vista previa de preguntas según la configuración actual
   */
  async function generatePreviewQuestions(scrollToPreview = false) {
    syncMetadataFromInputs();
    syncDifficultyCounts();

    const total = state.cantBajo + state.cantMedio + state.cantAlto;
    if (total <= 0) {
      showToast("⚠️ Seleccione al menos 1 reactivo en los niveles de dificultad (Bajo, Medio o Alto).");
      return;
    }

    const apiKeyInput = document.getElementById("geminiApiKeyInput");
    const apiKey = apiKeyInput ? apiKeyInput.value.trim() : "";

    const config = {
      cantBajo: state.cantBajo,
      cantMedio: state.cantMedio,
      cantAlto: state.cantAlto,
      tiposSeleccionados: state.tiposSeleccionados,
      unidadesSeleccionadas: state.selectedUnits
    };

    if (apiKey) {
      const btn = document.getElementById("btnGeneratePreview");
      const prevText = btn ? btn.innerHTML : "";
      try {
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = "⏳ Generando reactivos con IA Gemini...";
        }
        state.questions = await window.QuestionGenerator.generateQuestionsWithGeminiAI(state.syllabus, config, apiKey);
        showToast(`✨ Se generaron ${state.questions.length} reactivos mediante IA Gemini.`);
      } catch (err) {
        console.warn("Fallback a motor pedagógico local:", err);
        state.questions = window.QuestionGenerator.generateQuestions(state.syllabus, config);
        showToast(`✔ Se generaron ${state.questions.length} reactivos con el Motor Pedagógico ESPOCH.`);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = prevText;
        }
      }
    } else {
      state.questions = window.QuestionGenerator.generateQuestions(state.syllabus, config);
      if (scrollToPreview) {
        showToast(`✔ Vista previa actualizada: ${state.questions.length} reactivos generados (${state.cantBajo} Bajo, ${state.cantMedio} Medio, ${state.cantAlto} Alto).`);
      }
    }

    renderPreview();

    if (scrollToPreview) {
      const previewSec = document.getElementById("previewSection");
      if (previewSec) {
        previewSec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  /**
   * Renderiza la sección de Vista Previa (Modo Word Oficial, Modo Edición de Tarjetas o Modo Moodle XML)
   */
  function renderPreview() {
    const container = document.getElementById("previewContentArea");
    const countLabel = document.getElementById("previewCountSummary");
    if (!container || !state.syllabus) return;

    // Renumerar secuencialmente
    state.questions.forEach((q, idx) => {
      q.numero = idx + 1;
    });

    const cBajo = state.questions.filter((q) => q.dificultad === "Bajo").length;
    const cMedio = state.questions.filter((q) => q.dificultad === "Medio").length;
    const cAlto = state.questions.filter((q) => q.dificultad === "Alto").length;

    if (countLabel) {
      countLabel.innerHTML = `Total en vista previa: <strong>${state.questions.length} reactivos</strong> &nbsp;|&nbsp; <span style="color:#16793b">● ${cBajo} Nivel Bajo</span> &nbsp; <span style="color:#d97706">● ${cMedio} Nivel Medio</span> &nbsp; <span style="color:#c8102e">● ${cAlto} Nivel Alto</span>`;
    }

    const metadata = {
      asignatura: state.syllabus.asignatura,
      profesor: state.syllabus.profesor,
      pao: state.syllabus.pao,
      fecha: state.syllabus.fechaPresentacion
    };

    if (state.previewMode === "word") {
      container.innerHTML = buildOfficialWordPreviewHtml(metadata, state.questions);
    } else if (state.previewMode === "edit") {
      container.innerHTML = "";
      state.questions.forEach((q, idx) => {
        container.appendChild(buildEditableCardElement(q, idx));
      });
    } else if (state.previewMode === "xml") {
      const xmlString = window.Exporters.buildMoodleXmlString(metadata, state.questions);
      const escapedXml = xmlString
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      container.innerHTML = `
        <div style="background:#0f172a; color:#e2e8f0; padding:18px; border-radius:10px; overflow-x:auto; font-family:Consolas, monospace; font-size:0.81rem; line-height:1.45; max-height:640px;">
          <pre>${escapedXml}</pre>
        </div>`;
    }
  }

  /**
   * Construye la vista previa idéntica al modelo en formato Word adjunto por el usuario
   */
  function buildOfficialWordPreviewHtml(metadata, questions) {
    const headerSrc = window.ESPOCH_ASSETS ? window.ESPOCH_ASSETS.headerLogoDataUrl : "assets/logo_header.png";
    const footerSrc = window.ESPOCH_ASSETS ? window.ESPOCH_ASSETS.footerLogoDataUrl : "assets/logo_footer.png";

    const tablesHtml = questions
      .map((q, idx) => {
        const tax = (q.nivelTaxonomico || "Conocimiento").toLowerCase();
        const chkCon = tax.includes("conocimiento") ? "☒" : "☐";
        const chkComp = tax.includes("comprensi") ? "☒" : "☐";
        const chkApl = tax.includes("aplicaci") ? "☒" : "☐";

        const dif = (q.dificultad || "Medio").toLowerCase();
        const chkAlto = dif.includes("alto") ? "☒" : "☐";
        const chkMedio = dif.includes("medio") ? "☒" : "☐";
        const chkBajo = dif.includes("bajo") ? "☒" : "☐";

        const enunciadoHtml = String(q.enunciado || "")
          .split(/\r?\n/)
          .map((l) => `<div>${escapeHtml(l)}</div>`)
          .join("");

        const opcionesHtml = (q.opciones || [])
          .map((opt) => `<div style="margin-left:14px;">${escapeHtml(opt.letra)}) ${escapeHtml(opt.texto)}</div>`)
          .join("");

        return `
          <div class="word-reactivo-heading">REACTIVO: ${idx + 1}</div>
          <table class="word-table">
            <tbody>
              <tr>
                <td class="label-col">UNIDAD-TEMA:</td>
                <td class="value-col">${escapeHtml(q.unidadTema)}</td>
              </tr>
              <tr>
                <td class="label-col">RESULTADO DE APRENDIZAJE A MEDIR:</td>
                <td class="value-col">${escapeHtml(q.resultadoAprendizaje)}</td>
              </tr>
              <tr>
                <td class="label-col">NIVEL TAXONÓMICO:</td>
                <td class="value-col">
                  <strong>${chkCon}</strong> Conocimiento &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>${chkComp}</strong> Comprensión &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>${chkApl}</strong> Aplicación
                </td>
              </tr>
              <tr>
                <td class="label-col">Instrucción</td>
                <td class="value-col">${escapeHtml(q.instruccion)}</td>
              </tr>
              <tr>
                <td class="label-col">ENUNCIADO:</td>
                <td class="value-col">${enunciadoHtml}</td>
              </tr>
              <tr>
                <td class="label-col">DISTRACTORES (OPCIONES DE RESPUESTA):</td>
                <td class="value-col">${opcionesHtml}</td>
              </tr>
              <tr>
                <td class="label-col">RESPUESTA CORRECTA:</td>
                <td class="value-col">
                  <div><strong>Opción correcta: ${escapeHtml(q.respuestaCorrectaLetra)})</strong> ${escapeHtml(q.respuestaCorrectaTexto)}</div>
                  ${q.justificacion ? `<div style="margin-top:4px; font-size:0.86rem; color:#1e293b;"><em>Justificación:</em> ${escapeHtml(q.justificacion)}</div>` : ""}
                </td>
              </tr>
              <tr>
                <td class="label-col"><em>DIFICULTAD</em></td>
                <td class="value-col">
                  <strong>${chkAlto}</strong> Alto &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>${chkMedio}</strong> Medio &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>${chkBajo}</strong> Bajo
                </td>
              </tr>
              <tr>
                <td class="label-col"><em>TIEMPO ESTIMADO DE RESPUESTA</em></td>
                <td class="value-col">${escapeHtml(q.tiempoEstimado)}</td>
              </tr>
              <tr>
                <td class="label-col">BIBLIOGRAFÍA:</td>
                <td class="value-col">${escapeHtml(q.bibliografia)}</td>
              </tr>
            </tbody>
          </table>`;
      })
      .join("");

    return `
      <div class="word-document-preview">
        <div class="word-page">
          <div class="word-header-banner">
            <img src="${headerSrc}" alt="Logo ESPOCH Carrera de Gestión del Transporte"/>
          </div>
          <div class="word-meta-list">
            <div><strong>ASIGNATURA:</strong> ${escapeHtml(metadata.asignatura)}</div>
            <div><strong>NOMBRE DEL PROFESOR:</strong> ${escapeHtml(metadata.profesor)}</div>
            <div><strong>PERIODO ACADÉMICO (PAO):</strong> ${escapeHtml(metadata.pao)}</div>
            <div><strong>FECHA:</strong> ${escapeHtml(metadata.fecha)}</div>
            <div><strong>NÚMERO DE REACTIVOS:</strong> ${questions.length}</div>
          </div>
          ${tablesHtml}
          <div style="text-align:center; margin-top:34px; font-size:0.9rem;">
            <div>____________________________________________</div>
            <div style="font-weight:700; margin-top:4px;">${escapeHtml(metadata.profesor)}</div>
            <div style="font-size:0.8rem;">PROFESOR/A DE ${escapeHtml(metadata.asignatura)}</div>
          </div>
          <div class="word-footer-banner">
            <img src="${footerSrc}" alt="Pie de página ESPOCH"/>
          </div>
        </div>
      </div>`;
  }

  /**
   * Construye una tarjeta editable interactiva para cada reactivo
   */
  function buildEditableCardElement(q, idx) {
    const card = document.createElement("div");
    card.className = "reactivo-card";

    const diffColor =
      q.dificultad === "Alto" ? "#ef4444" : q.dificultad === "Medio" ? "#f59e0b" : "#10b981";

    card.innerHTML = `
      <div class="reactivo-card-header">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <span style="background:${diffColor}; color:#fff; font-weight:800; padding:3px 10px; border-radius:6px; font-size:0.82rem;">
            REACTIVO #${idx + 1} — Dificultad: ${escapeHtml(q.dificultad)} (${escapeHtml(q.nivelTaxonomico)})
          </span>
          <span style="font-size:0.82rem; color:#cbd5e1;">${escapeHtml(q.tipoPregunta)}</span>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn btn-sm btn-outline js-regen-one" style="background:#1e293b; color:#fff; border-color:#475569;">
            🔄 Regenerar otra variante
          </button>
          <button type="button" class="btn btn-sm btn-outline js-delete-one" style="background:#7f1d1d; color:#fff; border-color:#991b1b;">
            🗑 Eliminar
          </button>
        </div>
      </div>
      <div class="reactivo-card-body">
        <div class="form-grid">
          <div class="form-group">
            <label>UNIDAD - TEMA:</label>
            <input type="text" class="form-control js-edit-unidadTema" value="${escapeHtml(q.unidadTema)}"/>
          </div>
          <div class="form-group">
            <label>TIPO / INSTRUCCIÓN:</label>
            <input type="text" class="form-control js-edit-instruccion" value="${escapeHtml(q.instruccion)}"/>
          </div>
          <div class="form-group full-width">
            <label>RESULTADO DE APRENDIZAJE A MEDIR:</label>
            <input type="text" class="form-control js-edit-ra" value="${escapeHtml(q.resultadoAprendizaje)}"/>
          </div>
          <div class="form-group">
            <label>NIVEL TAXONÓMICO:</label>
            <select class="form-control js-edit-tax">
              <option value="Conocimiento" ${q.nivelTaxonomico === "Conocimiento" ? "selected" : ""}>Conocimiento</option>
              <option value="Comprensión" ${q.nivelTaxonomico === "Comprensión" ? "selected" : ""}>Comprensión</option>
              <option value="Aplicación" ${q.nivelTaxonomico === "Aplicación" ? "selected" : ""}>Aplicación</option>
            </select>
          </div>
          <div class="form-group" style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label>DIFICULTAD:</label>
              <select class="form-control js-edit-dif">
                <option value="Bajo" ${q.dificultad === "Bajo" ? "selected" : ""}>Bajo</option>
                <option value="Medio" ${q.dificultad === "Medio" ? "selected" : ""}>Medio</option>
                <option value="Alto" ${q.dificultad === "Alto" ? "selected" : ""}>Alto</option>
              </select>
            </div>
            <div>
              <label>TIEMPO ESTIMADO:</label>
              <select class="form-control js-edit-tiempo">
                <option value="1 minuto" ${q.tiempoEstimado === "1 minuto" ? "selected" : ""}>1 minuto</option>
                <option value="2 minutos" ${q.tiempoEstimado === "2 minutos" ? "selected" : ""}>2 minutos</option>
                <option value="3 minutos" ${q.tiempoEstimado === "3 minutos" ? "selected" : ""}>3 minutos</option>
                <option value="4 minutos" ${q.tiempoEstimado === "4 minutos" ? "selected" : ""}>4 minutos</option>
                <option value="5 minutos" ${q.tiempoEstimado === "5 minutos" ? "selected" : ""}>5 minutos</option>
              </select>
            </div>
          </div>
          <div class="form-group full-width">
            <label>ENUNCIADO DE LA PREGUNTA:</label>
            <textarea class="form-control js-edit-enunciado" rows="3">${escapeHtml(q.enunciado)}</textarea>
          </div>
          <div class="form-group full-width">
            <label>DISTRACTORES / OPCIONES DE RESPUESTA (Marque el botón radial en la respuesta correcta):</label>
            <div class="options-editor-list js-options-list"></div>
          </div>
          <div class="form-group full-width">
            <label>JUSTIFICACIÓN TÉCNICA DE LA RESPUESTA CORRECTA:</label>
            <textarea class="form-control js-edit-justificacion" rows="2">${escapeHtml(q.justificacion || "")}</textarea>
          </div>
          <div class="form-group full-width">
            <label>BIBLIOGRAFÍA UTILIZADA (DEL SÍLABO):</label>
            <input type="text" class="form-control js-edit-bib" value="${escapeHtml(q.bibliografia)}"/>
          </div>
        </div>
      </div>`;

    // Renderizar opciones de respuesta
    const optionsListEl = card.querySelector(".js-options-list");
    (q.opciones || []).forEach((opt, optIdx) => {
      const isCorrect = opt.letra === q.respuestaCorrectaLetra || opt.esCorrecta;
      const row = document.createElement("div");
      row.className = `option-editor-row ${isCorrect ? "is-correct" : ""}`;
      row.innerHTML = `
        <input type="radio" name="correct_opt_${q.id}" ${isCorrect ? "checked" : ""} title="Marcar como respuesta correcta"/>
        <span class="option-letter-badge">${escapeHtml(opt.letra)}</span>
        <input type="text" class="form-control" style="flex:1;" value="${escapeHtml(opt.texto)}"/>
      `;

      const radio = row.querySelector('input[type="radio"]');
      const textInp = row.querySelector('input[type="text"]');

      radio.addEventListener("change", () => {
        q.opciones.forEach((o, i) => {
          o.esCorrecta = i === optIdx;
        });
        q.respuestaCorrectaLetra = opt.letra;
        q.respuestaCorrectaTexto = q.opciones[optIdx].texto;
        renderPreview();
      });

      textInp.addEventListener("input", () => {
        q.opciones[optIdx].texto = textInp.value;
        if (q.respuestaCorrectaLetra === opt.letra) {
          q.respuestaCorrectaTexto = textInp.value;
        }
      });

      optionsListEl.appendChild(row);
    });

    // Eventos de edición de campos
    card.querySelector(".js-edit-unidadTema").addEventListener("input", (e) => {
      q.unidadTema = e.target.value;
    });
    card.querySelector(".js-edit-instruccion").addEventListener("input", (e) => {
      q.instruccion = e.target.value;
    });
    card.querySelector(".js-edit-ra").addEventListener("input", (e) => {
      q.resultadoAprendizaje = e.target.value;
    });
    card.querySelector(".js-edit-tax").addEventListener("change", (e) => {
      q.nivelTaxonomico = e.target.value;
    });
    card.querySelector(".js-edit-dif").addEventListener("change", (e) => {
      q.dificultad = e.target.value;
      renderPreview();
    });
    card.querySelector(".js-edit-tiempo").addEventListener("change", (e) => {
      q.tiempoEstimado = e.target.value;
    });
    card.querySelector(".js-edit-enunciado").addEventListener("input", (e) => {
      q.enunciado = e.target.value;
    });
    card.querySelector(".js-edit-justificacion").addEventListener("input", (e) => {
      q.justificacion = e.target.value;
    });
    card.querySelector(".js-edit-bib").addEventListener("input", (e) => {
      q.bibliografia = e.target.value;
    });

    // Regenerar sólo esta pregunta
    card.querySelector(".js-regen-one").addEventListener("click", () => {
      q._regenCount = (q._regenCount || 0) + 1;
      const replacement = window.QuestionGenerator.regenerateSingleQuestion(state.syllabus, q, q._regenCount);
      state.questions[idx] = replacement;
      renderPreview();
      showToast(`🔄 Se generó una nueva variante para el Reactivo #${idx + 1}.`);
    });

    // Eliminar pregunta
    card.querySelector(".js-delete-one").addEventListener("click", () => {
      if (state.questions.length <= 1) {
        showToast("⚠️ El cuestionario debe contener al menos 1 reactivo.");
        return;
      }
      state.questions.splice(idx, 1);
      renderPreview();
      showToast(`🗑 Reactivo eliminado. Total actual: ${state.questions.length}.`);
    });

    return card;
  }

  function addManualQuestion() {
    if (!state.syllabus) return;
    const unit = state.syllabus.unidades[0] || {
      numero: 1,
      titulo: "Unidad 1",
      resultadoAprendizaje: "",
      temas: ["1.1: Tema principal"]
    };
    const newQ = window.QuestionGenerator.regenerateSingleQuestion(
      state.syllabus,
      {
        numero: state.questions.length + 1,
        unidadNumero: unit.numero,
        dificultad: "Medio",
        tipoPregunta: "Selección Múltiple"
      },
      state.questions.length + 3
    );
    state.questions.push(newQ);
    state.previewMode = "edit";
    document.querySelectorAll(".js-view-tab").forEach((t) => {
      t.classList.toggle("active", t.getAttribute("data-mode") === "edit");
    });
    renderPreview();
    showToast(`➕ Se agregó el Reactivo #${state.questions.length} para edición.`);
  }

  /**
   * Exporta simultáneamente el archivo Word (.docx) y el archivo Moodle XML (.xml)
   */
  async function handleExportBoth() {
    syncMetadataFromInputs();
    if (!state.questions || state.questions.length === 0) {
      showToast("⚠️ Primero genere al menos un reactivo en la vista previa.");
      return;
    }

    const metadata = {
      asignatura: state.syllabus.asignatura,
      profesor: state.syllabus.profesor,
      pao: state.syllabus.pao,
      fecha: state.syllabus.fechaPresentacion
    };

    try {
      const { wordFilename, xmlFilename } = await window.Exporters.downloadBothFiles(metadata, state.questions);
      showToast(
        `✅ ¡Archivos generados con éxito!<br/>📄 <strong>${wordFilename}</strong><br/>📦 <strong>${xmlFilename}</strong>`
      );
    } catch (err) {
      console.error("Error al exportar archivos:", err);
      showToast("❌ Ocurrió un error al generar los archivos: " + err.message);
    }
  }

  async function handleExportWord() {
    syncMetadataFromInputs();
    const metadata = {
      asignatura: state.syllabus.asignatura,
      profesor: state.syllabus.profesor,
      pao: state.syllabus.pao,
      fecha: state.syllabus.fechaPresentacion
    };
    try {
      const wordFilename = await window.Exporters.downloadWordFile(metadata, state.questions);
      showToast(`📄 Archivo Word generado: <strong>${wordFilename}</strong>`);
    } catch (err) {
      showToast("❌ Error al generar Word: " + err.message);
    }
  }

  function handleExportMoodle() {
    syncMetadataFromInputs();
    const metadata = {
      asignatura: state.syllabus.asignatura,
      profesor: state.syllabus.profesor,
      pao: state.syllabus.pao,
      fecha: state.syllabus.fechaPresentacion
    };
    const xmlFilename = window.Exporters.downloadMoodleXmlFile(metadata, state.questions);
    showToast(`📦 Archivo Moodle XML generado: <strong>${xmlFilename}</strong>`);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
