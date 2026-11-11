/**
 * Motor Pedagógico de Generación de Reactivos ESPOCH
 * Basado en la Codificación de Guías Académicas Institucionales (Res. 164.CP.2025 / Ref. 133.CP.2026)
 * Se adapta dinámicamente a CUALQUIER sílabo subido por los docentes de la Carrera de Gestión del Transporte.
 * Autores: Ing. Yolanda Telenchano, Ing. Marco Santillán, Ing. Diego Haro
 */

window.QuestionGenerator = (function () {
  const DIFFICULTY_META = {
    Bajo: {
      nivelTaxonomico: "Conocimiento",
      tiempoDefault: "2 minutos",
      descripcionNivel: "Nivel 1: Habilidades memorísticas – reconocer conceptos, principios y terminología."
    },
    Medio: {
      nivelTaxonomico: "Comprensión",
      tiempoDefault: "3 minutos",
      descripcionNivel: "Nivel 2: Habilidades de comprensión – organización, relación e interpretación del conocimiento."
    },
    Alto: {
      nivelTaxonomico: "Aplicación",
      tiempoDefault: "4 minutos",
      descripcionNivel: "Nivel 3: Habilidades de indagación, resolución de problemas prácticos y pensamiento crítico."
    }
  };

  const QUESTION_TYPE_INSTRUCTIONS = {
    "Selección Múltiple":
      "Selección Múltiple — Lea detenidamente el enunciado y seleccione la alternativa correcta entre las cuatro opciones disponibles.",
    "De complementación, completación, mutiladas":
      "De complementación, completación, mutiladas — Seleccione la opción que completa de forma técnica y precisa la afirmación planteada.",
    "De asociación o emparejamiento":
      "De asociación o emparejamiento (Relación o correspondencia) — Relacione correctamente cada elemento de la primera columna con su característica o función correspondiente y seleccione la combinación correcta.",
    "De ordenación":
      "De ordenación / jerarquización — Ordene secuencial y lógicamente las etapas, elementos o procedimientos técnicos indicados y seleccione la opción correcta.",
    "Verdadero o Falso":
      "Verdadero o Falso — Analice la proposición técnica y determine si el enunciado es Verdadero o Falso."
  };

  /**
   * Banco especializado de reactivos para el sílabo de ejemplo precargado:
   * INTRODUCCIÓN AL TRANSPORTE Y LA LOGÍSTICA (TRALP17) - Ing. Diego Haro
   */
  const SPECIALIZED_TRANSPORT_BANK = [
    // NIVEL BAJO (CONOCIMIENTO)
    {
      unidadNumero: 1,
      subtemaEspecifico: "1.2: Definición de sistemas de transporte. Ejemplos prácticos.",
      dificultad: "Bajo",
      nivelTaxonomico: "Conocimiento",
      tipoPregunta: "Selección Múltiple",
      enunciado:
        "Dentro de los fundamentos de la ingeniería del transporte, ¿cuál es el conjunto de componentes físicos y operativos fundamentales que interactúan de manera coordinada para conformar un sistema de transporte?",
      opciones: [
        "La infraestructura vial o fija, los vehículos o unidades móviles, y el sistema de operación, control y gestión normativa.",
        "Únicamente el parque automotor público, las tarifas de pasaje urbano y las estaciones de peaje interprovincial.",
        "La oferta comercial de las empresas navieras, los aranceles aduaneros y los tratados de libre comercio vigentes.",
        "El diseño geométrico de aceras peatonales, el mantenimiento correctivo de motores y el seguro de accidentes."
      ],
      correctIndex: 0,
      justificacion:
        "De acuerdo con la teoría de sistemas de transporte (Arenal, 2022), todo sistema de transporte está integrado por tres subsistemas esenciales: infraestructura (vías, terminales), vehículos (unidades de carga/pasajeros) y el sistema de operación/gestión que regula su circulación segura y eficiente.",
      tiempoEstimado: "2 minutos",
      bibIndex: 0
    },
    {
      unidadNumero: 1,
      subtemaEspecifico: "2.2: Objetivos de la ingeniería del transporte.",
      dificultad: "Bajo",
      nivelTaxonomico: "Conocimiento",
      tipoPregunta: "De complementación, completación, mutiladas",
      enunciado:
        "La Ingeniería del Transporte es la rama técnica que aplica principios científicos y tecnológicos a la planificación, diseño funcional, operación y administración de cualquier modo de transporte, con el objetivo primordial de garantizar la movilización de personas y mercancías bajo condiciones de ___________________.",
      opciones: [
        "seguridad, rapidez, confort, conveniencia, economía y compatibilidad medioambiental",
        "velocidad máxima irrestricta, reducción de controles técnicos y monopolio operativo",
        "exclusividad para el transporte privado, expansión vial sin planificación y subsidio total",
        "incremento de tiempos de transbordo, fragmentación modal y uso intensivo de combustibles fósiles"
      ],
      correctIndex: 0,
      justificacion:
        "Según los fundamentos de la ingeniería y planificación del transporte (Barros & Pazmay, 2024), el objetivo esencial de esta disciplina es lograr un movimiento seguro, eficiente, cómodo, económico y ambientalmente sostenible de personas y bienes.",
      tiempoEstimado: "1 minuto",
      bibIndex: 1
    },
    {
      unidadNumero: 2,
      subtemaEspecifico: "1.1: Conceptos básicos del transporte intermodal.",
      dificultad: "Bajo",
      nivelTaxonomico: "Conocimiento",
      tipoPregunta: "Selección Múltiple",
      enunciado:
        "¿Qué característica técnica distingue de manera específica al transporte intermodal frente a otras modalidades de traslado combinado de mercancías?",
      opciones: [
        "El traslado de la mercancía utilizando dos o más modos de transporte dentro de una misma unidad de carga (como contenedor o caja móvil) sin manipular directamente la mercancía en los transbordos.",
        "El uso exclusivo de camiones articulados de diferente tonelaje pertenecientes a una misma empresa transportista a lo largo de una carretera nacional.",
        "El desconsolidado y reembalaje manual de cada producto en cada terminal portuaria, ferroviaria o aeroportuaria durante su trayecto internacional.",
        "La contratación independiente de múltiples pólizas de seguro sin utilizar unidades estandarizadas de carga ni terminales de transferencia."
      ],
      correctIndex: 0,
      justificacion:
        "En el transporte intermodal (Arenal, 2022), la mercancía viaja integrada en una Unidad de Transporte Intermodal (UTI: contenedor, semirremolque o caja móvil) empleando al menos dos modos distintos sin ruptura de carga.",
      tiempoEstimado: "2 minutos",
      bibIndex: 0
    },
    {
      unidadNumero: 3,
      subtemaEspecifico: "1.2: Conceptos generales de la logística.",
      dificultad: "Bajo",
      nivelTaxonomico: "Conocimiento",
      tipoPregunta: "De complementación, completación, mutiladas",
      enunciado:
        "En la caracterización de la doctrina logística moderna, la gestión logística se encarga de planificar, implementar y controlar de manera eficiente el flujo directo e inverso y el almacenamiento de bienes, servicios e información relacionada, desde el ___________________ con el propósito de satisfacer los requerimientos del cliente.",
      opciones: [
        "punto de origen de las materias primas hasta el punto de consumo final",
        "proceso de facturación contable hasta la liquidación de impuestos municipales",
        "diseño publicitario de la marca hasta la contratación del personal administrativo",
        "mantenimiento mecánico de la flota hasta la adquisición de repuestos automotrices"
      ],
      correctIndex: 0,
      justificacion:
        "La definición técnica de la logística del transporte (Arenal, 2022) establece que su alcance abarca la gestión integral del flujo físico y de información desde el punto de origen (proveedores) hasta el punto de consumo final (clientes).",
      tiempoEstimado: "2 minutos",
      bibIndex: 0
    },
    {
      unidadNumero: 4,
      subtemaEspecifico: "2.1: Definición e importancia de los abastecimientos.",
      dificultad: "Bajo",
      nivelTaxonomico: "Conocimiento",
      tipoPregunta: "Selección Múltiple",
      enunciado:
        "En el estudio de los procesos logísticos y la cadena de distribución, ¿en qué consiste la función estratégica del abastecimiento o aprovisionamiento?",
      opciones: [
        "En el conjunto de operaciones destinadas a poner a disposición de la organización todos los materiales, suministros y servicios necesarios en la cantidad, calidad, tiempo y costo óptimos.",
        "En la venta minorista directa al consumidor final mediante plataformas de comercio electrónico sin gestión de inventarios previos.",
        "En la liquidación contable de activos fijos obsoletos que han cumplido su vida útil dentro de las instalaciones administrativas.",
        "En el diseño arquitectónico de las vías urbanas secundarias para el tránsito exclusivo de vehículos livianos particulares."
      ],
      correctIndex: 0,
      justificacion:
        "Dentro del ciclo logístico (Arenal, 2022), el abastecimiento constituye la fase inicial crítica que garantiza la disponibilidad continua de insumos y bienes en condiciones óptimas de calidad, cantidad, oportunidad y costo.",
      tiempoEstimado: "2 minutos",
      bibIndex: 0
    },
    {
      unidadNumero: 5,
      subtemaEspecifico: "6: Introducción a los planes de movilidad.",
      dificultad: "Bajo",
      nivelTaxonomico: "Conocimiento",
      tipoPregunta: "Selección Múltiple",
      enunciado:
        "En la planificación estratégica del transporte y los planes de movilidad sostenible, ¿qué modo de desplazamiento ocupa el nivel prioritario superior dentro de la pirámide invertida de la movilidad urbana?",
      opciones: [
        "Los peatones y personas con movilidad reducida, seguidos por la micromovilidad (ciclistas) y el transporte público colectivo.",
        "Los vehículos particulares motorizados de baja ocupación seguidos por las motocicletas de combustión interna.",
        "El transporte pesado de carga peligrosa en tránsito por el centro histórico de las ciudades.",
        "Los taxis ejecutivos individuales por encima de los sistemas integrados de transporte masivo."
      ],
      correctIndex: 0,
      justificacion:
        "Conforme a los principios de planificación del transporte y movilidad sostenible (Barros & Pazmay, 2024), los planes de movilidad otorgan prioridad jerárquica a los modos más vulnerables y sostenibles: peatones, ciclistas y transporte público masivo.",
      tiempoEstimado: "2 minutos",
      bibIndex: 1
    },

    // NIVEL MEDIO (COMPRENSIÓN)
    {
      unidadNumero: 1,
      subtemaEspecifico: "2.3: Consideraciones y tipos de estudios de la ingeniería del transporte.",
      dificultad: "Medio",
      nivelTaxonomico: "Comprensión",
      tipoPregunta: "De asociación o emparejamiento",
      enunciado:
        "Relacione el tipo de estudio de la Ingeniería del Transporte con su propósito técnico correspondiente:\n" +
        "(1) Estudio de Origen - Destino (O-D)\n" +
        "(2) Estudio de Capacidad y Nivel de Servicio\n" +
        "(3) Estudio de Volumen y Clasificación Vehicular\n" +
        "(4) Estudio de Velocidad y Tiempo de Viaje\n\n" +
        "a) Cuantifica la cantidad y composición del flujo vehicular que pasa por una sección vial en un período determinado.\n" +
        "b) Determina las líneas de deseo de viajes, motivos de desplazamiento y matrices de flujo entre zonas de transporte.\n" +
        "c) Evalúa la calidad operativa de una infraestructura vial frente a la demanda (categorías A hasta F) e identifica cuellos de botella.\n" +
        "d) Mide las demoras operativas, velocidades de recorrido y velocidades de punto para evaluar la eficiencia de una ruta.",
      opciones: ["1b, 2c, 3a, 4d", "1a, 2b, 3c, 4d", "1b, 2a, 3d, 4c", "1c, 2d, 3a, 4b"],
      correctIndex: 0,
      justificacion:
        "En los estudios de ingeniería del transporte (Barros & Pazmay, 2024; Narayanaswami, 2023): (1) Origen-Destino identifica matrices y patrones espaciales de viaje (b); (2) Capacidad y Nivel de Servicio evalúa la suficiencia operativa de la vía de A a F (c); (3) Volumen/Aforo cuantifica y clasifica el flujo vehicular (a); y (4) Velocidad/Tiempo de viaje cuantifica demoras y fluidez en ruta (d).",
      tiempoEstimado: "3 minutos",
      bibIndex: 1
    },
    {
      unidadNumero: 2,
      subtemaEspecifico: "2.1: Intermodalidad en el transporte del país. / 2.2: Problemas del transporte en el Ecuador.",
      dificultad: "Medio",
      nivelTaxonomico: "Comprensión",
      tipoPregunta: "Selección Múltiple",
      enunciado:
        "Al analizar la problemática del transporte de carga y la intermodalidad en el Ecuador, ¿cuál de los siguientes factores representa una limitación estructural crítica que incrementa los costos logísticos nacionales frente a los estándares internacionales?",
      opciones: [
        "La alta dependencia del modo carretero por la escasa articulación ferroviaria activa, sumada a las restricciones topográficas de la cordillera y la deficiente integración tecnológica en nodos de transferencia modal.",
        "La excesiva cantidad de líneas férreas electrificadas de alta capacidad que compiten simultáneamente en todas las provincias de la Sierra y la Amazonía.",
        "La inexistencia de puertos marítimos de aguas profundas en el perfil costanero ecuatoriano para recibir buques portacontenedores internacionales.",
        "La prohibición legal de utilizar contenedores estandarizados ISO de 20 y 40 pies en los corredores logísticos estratégicos del país."
      ],
      correctIndex: 0,
      justificacion:
        "En el contexto ecuatoriano (Barros & Pazmay, 2024), el transporte interno de carga depende casi exclusivamente del modo carretero debido a la falta de una red ferroviaria de carga operativa, las pendientes pronunciadas entre Costa y Sierra, y brechas en plataformas logísticas intermodales.",
      tiempoEstimado: "3 minutos",
      bibIndex: 1
    },
    {
      unidadNumero: 3,
      subtemaEspecifico: "2.1: Principios logísticos. / 2.3: Instalaciones logísticas.",
      dificultad: "Medio",
      nivelTaxonomico: "Comprensión",
      tipoPregunta: "De asociación o emparejamiento",
      enunciado:
        "Relacione cada tipo de instalación o plataforma logística con su función operativa dentro de la cadena de transporte:\n" +
        "(1) Plataforma de Cross-Docking (Cruces de muelle)\n" +
        "(2) Puerto Seco (Terminal Intermodal Interior)\n" +
        "(3) Zona de Actividades Logísticas (ZAL)\n" +
        "(4) Centro de Consolidación y Desconsolidación (Hub urbano)\n\n" +
        "a) Terminal situada en el interior del territorio conectada directamente con uno o varios puertos marítimos para realizar trámites aduaneros y transferencia modal.\n" +
        "b) Instalación donde las mercancías recibidas se transfieren directamente hacia los muelles de salida para su despacho inmediato sin almacenamiento intermedio prolongado.\n" +
        "c) Complejo logístico-industrial anexo a nodos portuarios o aeroportuarios que integra almacenaje, valor agregado, embalaje y servicios al transporte.\n" +
        "d) Instalación próxima a las áreas metropolitanas que agrupa cargas de múltiples proveedores para optimizar el reparto de última milla en vehículos de menor impacto.",
      opciones: ["1b, 2a, 3c, 4d", "1a, 2b, 3d, 4c", "1b, 2c, 3a, 4d", "1d, 2a, 3b, 4c"],
      correctIndex: 0,
      justificacion:
        "De acuerdo con la caracterización de instalaciones logísticas (Arenal, 2022): Cross-Docking elimina el almacenaje intermedio transfiriendo carga directamente entre muelles (1b); el Puerto Seco conecta el hinterland interior con puertos marítimos incluyendo servicios aduaneros (2a); la ZAL articula actividades de valor agregado junto a grandes nodos (3c); y el Hub urbano consolida cargas para distribución capilar (4d).",
      tiempoEstimado: "3 minutos",
      bibIndex: 0
    },
    {
      unidadNumero: 4,
      subtemaEspecifico: "1.1: Conceptualización del ciclo logístico. / 2.3: Ciclo de abastecimiento.",
      dificultad: "Medio",
      nivelTaxonomico: "Comprensión",
      tipoPregunta: "De ordenación",
      enunciado:
        "Ordene de manera secuencial y cronológica las fases que integran el ciclo logístico de abastecimiento y distribución de mercancías:\n" +
        "(1) Recepción, verificación técnica de calidad/cantidad y registro en almacén.\n" +
        "(2) Determinación de necesidades y cálculo de requerimientos según el índice de consumo.\n" +
        "(3) Preparación de pedidos (picking/packing), consolidación de carga y planificación de rutas de despacho.\n" +
        "(4) Selección de proveedores, negociación y emisión de la orden de compra o aprovisionamiento.\n" +
        "(5) Transporte de distribución física hacia los nodos de consumo y retroalimentación de indicadores de servicio.",
      opciones: ["2, 4, 1, 3, 5", "4, 2, 1, 5, 3", "1, 2, 4, 3, 5", "2, 1, 4, 3, 5"],
      correctIndex: 0,
      justificacion:
        "El ciclo logístico y de abastecimiento (Arenal, 2022) sigue una secuencia lógica: primero se determinan las necesidades según la demanda/consumo (2), luego se gestiona la compra ante proveedores (4), se recepta y verifica la mercancía en almacén (1), se preparan y consolidan los pedidos (3) y finalmente se ejecuta el transporte de distribución con control de entrega (5).",
      tiempoEstimado: "3 minutos",
      bibIndex: 0
    },
    {
      unidadNumero: 5,
      subtemaEspecifico: "3: Importancia de la planificación del transporte. / 4: Estrategias del proceso.",
      dificultad: "Medio",
      nivelTaxonomico: "Comprensión",
      tipoPregunta: "De ordenación",
      enunciado:
        "Ordene secuencialmente las cuatro etapas del modelo clásico de planificación estratégica de sistemas de transporte (Modelo de Cuatro Etapas):\n" +
        "(1) Distribución espacial de viajes (construcción de matrices Origen-Destino entre zonas).\n" +
        "(2) Asignación de tráfico a la red vial y de transporte (selección de rutas específicas).\n" +
        "(3) Generación y atracción de viajes (estimación del total de viajes producidos y atraídos por zona).\n" +
        "(4) Partición o elección modal (distribución de los viajes entre los diferentes modos de transporte disponibles).",
      opciones: ["3, 1, 4, 2", "1, 3, 2, 4", "3, 4, 1, 2", "2, 1, 4, 3"],
      correctIndex: 0,
      justificacion:
        "En la planificación estratégica del transporte (Barros & Pazmay, 2024; Narayanaswami, 2023), el modelo secuencial de cuatro etapas inicia con: 1º Generación/Atracción de viajes (3), 2º Distribución zonal Origen-Destino (1), 3º Elección o partición modal (4) y 4º Asignación de flujos a las rutas de la red (2).",
      tiempoEstimado: "3 minutos",
      bibIndex: 1
    },

    // NIVEL ALTO (APLICACIÓN)
    {
      unidadNumero: 2,
      subtemaEspecifico: "1.1: Conceptos básicos del transporte intermodal. / 2.1: Intermodalidad en el transporte del país.",
      dificultad: "Alto",
      nivelTaxonomico: "Aplicación",
      tipoPregunta: "Selección Múltiple",
      enunciado:
        "Una empresa agroexportadora ubicada en Riobamba debe movilizar 180 toneladas semanales de brócoli congelado hacia el puerto de Guayaquil para exportación. Dispone de dos alternativas logísticas:\n" +
        "• Alternativa A (Unimodal carretera): Camiones refrigerados de 15 t de capacidad útil, con un costo operativo de $480 por viaje y emisiones medias de 0,95 t CO₂ por viaje.\n" +
        "• Alternativa B (Intermodal carretera + nodo ferroviario/portuario consolidado): Uso de contenedores refrigerados de 30 t en convoy consolidado desde un centro logístico regional, con un costo de transferencia de $120 por contenedor y un flete troncal de $660 por contenedor, reduciendo las emisiones totales en un 35% respecto al modo unimodal.\n\n" +
        "Desde el criterio técnico-económico y ambiental (RAC2 y RAC3), ¿cuál es el ahorro económico semanal y la cantidad total de emisiones semanales de CO₂ si se implementa la Alternativa B?",
      opciones: [
        "Ahorro económico de $1.080 semanales y emisiones totales de 7,41 t CO₂ por semana.",
        "Ahorro económico de $1.800 semanales y emisiones totales de 11,40 t CO₂ por semana.",
        "Ahorro económico de $720 semanales y emisiones totales de 5,70 t CO₂ por semana.",
        "Ahorro económico de $1.080 semanales y emisiones totales de 3,99 t CO₂ por semana."
      ],
      correctIndex: 0,
      justificacion:
        "Cálculo técnico: Para 180 t semanales: En la Alternativa A se requieren 180 / 15 = 12 viajes; Costo A = 12 × $480 = $5.760; Emisiones A = 12 × 0,95 = 11,40 t CO₂. En la Alternativa B se requieren 180 / 30 = 6 contenedores; Costo unitario B = $120 + $660 = $780 por contenedor; Costo total B = 6 × $780 = $4.680. El ahorro semanal es $5.760 - $4.680 = $1.080. Las emisiones de B (reducción del 35%, es decir 65% de 11,40 t) son 11,40 × 0,65 = 7,41 t CO₂/semana (Arenal, 2022; Narayanaswami, 2023).",
      tiempoEstimado: "5 minutos",
      bibIndex: 0
    },
    {
      unidadNumero: 4,
      subtemaEspecifico: "1.2: Casos prácticos de los ciclos logísticos. / 3.2: Indicadores de consumo de un país.",
      dificultad: "Alto",
      nivelTaxonomico: "Aplicación",
      tipoPregunta: "Selección Múltiple",
      enunciado:
        "Un centro de distribución regional de repuestos para transporte público presenta un índice de consumo medio diario de 120 unidades. El tiempo de respuesta del proveedor (Lead Time de abastecimiento) desde el puerto hasta el almacén es de 6 días laborables. Por políticas de continuidad operativa de la flota, la gerencia logística establece un stock de seguridad equivalente a 3 días de consumo medio. Si actualmente el inventario físico disponible es de 1.500 unidades y no existen pedidos en tránsito, ¿en qué nivel de inventario (Punto de Reorden) se debe emitir automáticamente el siguiente pedido de abastecimiento y cuántos días de autonomía operativa restan antes de alcanzar dicho punto?",
      opciones: [
        "El Punto de Reorden es de 1.080 unidades y restan 3,5 días de autonomía antes de emitir el pedido.",
        "El Punto de Reorden es de 720 unidades y restan 6,5 días de autonomía antes de emitir el pedido.",
        "El Punto de Reorden es de 1.080 unidades y restan 9,0 días de autonomía antes de emitir el pedido.",
        "El Punto de Reorden es de 360 unidades y restan 9,5 días de autonomía antes de emitir el pedido."
      ],
      correctIndex: 0,
      justificacion:
        "Cálculo de gestión de abastecimientos (Arenal, 2022): Stock de Seguridad (SS) = 3 días × 120 u/día = 360 unidades. Consumo durante el Lead Time (d × L) = 120 u/día × 6 días = 720 unidades. Punto de Reorden (ROP) = (d × L) + SS = 720 + 360 = 1.080 unidades. Con un stock actual de 1.500 unidades, el margen antes de llegar al ROP es 1.500 - 1.080 = 420 unidades, lo que equivale a 420 / 120 = 3,5 días de operación.",
      tiempoEstimado: "4 minutos",
      bibIndex: 0
    },
    {
      unidadNumero: 3,
      subtemaEspecifico: "2.2: Procesos logísticos. / 2.4: Importancia de las instalaciones logísticas.",
      dificultad: "Alto",
      nivelTaxonomico: "Aplicación",
      tipoPregunta: "Selección Múltiple",
      enunciado:
        "Una operadora logística de transporte de larga distancia debe despachar un pedido de 48 pallets estándar europeos (1,20 m × 0,80 m, con peso bruto de 650 kg por pallet, no apilables por fragilidad de la carga). Se dispone de semirremolques furgón cuyas dimensiones interiores útiles son 13,60 m de largo por 2,45 m de ancho, y cuya capacidad máxima de carga útil por normativa nacional de pesos y dimensiones es de 24.000 kg. ¿Cuántos pallets como máximo pueden estibarse por vehículo respetando simultáneamente las restricciones geométricas de planta y de peso máximo, y cuántos vehículos se requieren para movilizar todo el lote en un solo envío?",
      opciones: [
        "Máximo 33 pallets por vehículo (limitado por superficie en planta) y se requieren 2 vehículos para el lote completo.",
        "Máximo 36 pallets por vehículo (limitado por peso máximo) y se requieren 2 vehículos para el lote completo.",
        "Máximo 48 pallets por vehículo y se requiere únicamente 1 vehículo articulado para el lote completo.",
        "Máximo 22 pallets por vehículo (limitado por peso máximo) y se requieren 3 vehículos para el lote completo."
      ],
      correctIndex: 0,
      justificacion:
        "Análisis técnico de procesos logísticos (Arenal, 2022): 1) Restricción geométrica en planta (no apilable): Colocando 3 pallets por el lado de 0,80 m a lo ancho (2,40 m ≤ 2,45 m), a lo largo de 13,60 m caben floor(13,60 / 1,20) = 11 filas → 11 × 3 = 33 pallets por vehículo. 2) Verificación por peso: 33 pallets × 650 kg = 21.450 kg ≤ 24.000 kg. Para transportar 48 pallets se requieren ceil(48 / 33) = 2 vehículos.",
      tiempoEstimado: "5 minutos",
      bibIndex: 0
    },
    {
      unidadNumero: 5,
      subtemaEspecifico: "6.1: Valorización de vías y rutas. / 4: Estrategias del proceso.",
      dificultad: "Alto",
      nivelTaxonomico: "Aplicación",
      tipoPregunta: "Selección Múltiple",
      enunciado:
        "En un estudio de valorización de vías y rutas para el transporte público interparroquial mediante Sistemas Inteligentes de Transporte (ITS), un corredor vial de 24 km presenta actualmente una velocidad comercial media de 18 km/h durante la hora pico debido a intersecciones no semaforizadas y paradas informales. Tras implementar priorización semafórica, segregación parcial de carril y paradas fijas cada 800 m, el tiempo total de viaje por sentido se reduce en 20 minutos. ¿Cuál es la nueva velocidad comercial media del corredor y en qué porcentaje aumentó la productividad horaria (viajes por hora) de cada unidad si el tiempo de terminal entre despachos se mantiene en 10 minutos?",
      opciones: [
        "Nueva velocidad comercial de 24 km/h y un incremento del 28,57% en la productividad horaria de cada unidad.",
        "Nueva velocidad comercial de 30 km/h y un incremento del 40,00% en la productividad horaria de cada unidad.",
        "Nueva velocidad comercial de 24 km/h y un incremento del 25,00% en la productividad horaria de cada unidad.",
        "Nueva velocidad comercial de 28 km/h y un incremento del 33,33% en la productividad horaria de cada unidad."
      ],
      correctIndex: 0,
      justificacion:
        "Cálculo de ingeniería de transporte y valorización de rutas (Narayanaswami, 2023; Barros & Pazmay, 2024): Tiempo de viaje inicial T₁ = (24 km / 18 km/h) × 60 = 80 minutos. Con la reducción de 20 minutos, el nuevo tiempo de viaje T₂ = 80 - 20 = 60 minutos (1,0 hora). La nueva velocidad comercial es V₂ = 24 km / 1,0 h = 24 km/h. Considerando 10 minutos de terminal, el ciclo operativo por sentido pasa de C₁ = 90 min a C₂ = 70 min. La productividad por unidad aumenta en ((90/70) - 1) × 100 = 28,57%.",
      tiempoEstimado: "5 minutos",
      bibIndex: 2
    },
    {
      unidadNumero: 1,
      subtemaEspecifico: "1.4: Factores de crecimiento del transporte. / 2.1: Fundamentos de la ingeniería del transporte.",
      dificultad: "Alto",
      nivelTaxonomico: "Aplicación",
      tipoPregunta: "Selección Múltiple",
      enunciado:
        "Un corredor logístico interprovincial registra actualmente un Tráfico Promedio Diario Anual (TPDA) de 4.000 vehículos/día, de los cuales el 30% corresponde a transporte pesado de carga. Estudios socioeconómicos proyectan que el PIB regional crecerá a una tasa anual del 3,5% y que la elasticidad de la demanda de transporte de carga respecto al PIB es de 1,4, mientras que el tránsito de vehículos livianos crecerá al 2,5% anual. Aplicando un modelo de proyección lineal compuesto a un horizonte de planificación de 5 años, ¿cuál será el volumen diario estimado de vehículos pesados de carga al quinto año (redondeado al entero más cercano)?",
      opciones: [
        "1.524 vehículos pesados/día, equivalentes a una tasa de crecimiento anual del 4,9% para el segmento de carga.",
        "1.358 vehículos pesados/día, equivalentes a una tasa de crecimiento anual del 2,5% para el segmento de carga.",
        "1.425 vehículos pesados/día, equivalentes a una tasa de crecimiento anual del 3,5% para el segmento de carga.",
        "1.680 vehículos pesados/día, equivalentes a una tasa de crecimiento anual del 7,0% para el segmento de carga."
      ],
      correctIndex: 0,
      justificacion:
        "Cálculo de demanda y crecimiento del transporte (Barros & Pazmay, 2024): El volumen inicial de transporte pesado es 4.000 × 0,30 = 1.200 vehículos/día. La tasa anual de crecimiento del transporte de carga (r_c) es 3,5% × 1,4 = 4,9% anual (0,049). Proyectando a n = 5 años: TPDA_carga(5) = 1.200 × (1 + 0,049)⁵ = 1.524 vehículos pesados/día.",
      tiempoEstimado: "5 minutos",
      bibIndex: 1
    }
  ];

  function assignBalancedCorrectLetter(optionsTexts, currentCorrectIdx, targetCorrectIdx) {
    const letters = ["a", "b", "c", "d"];
    if (optionsTexts.length === 2) {
      return {
        opciones: [
          { letra: "a", texto: optionsTexts[0], esCorrecta: currentCorrectIdx === 0 },
          { letra: "b", texto: optionsTexts[1], esCorrecta: currentCorrectIdx === 1 }
        ],
        respuestaCorrectaLetra: letters[currentCorrectIdx],
        respuestaCorrectaTexto: optionsTexts[currentCorrectIdx]
      };
    }

    const cloned = optionsTexts.slice(0, 4);
    const correctText = cloned[currentCorrectIdx];
    const distractors = cloned.filter((_, idx) => idx !== currentCorrectIdx);

    const safeTargetIdx = targetCorrectIdx % 4;
    const finalTexts = [];
    let dIdx = 0;
    for (let i = 0; i < 4; i++) {
      if (i === safeTargetIdx) {
        finalTexts.push(correctText);
      } else {
        finalTexts.push(distractors[dIdx++]);
      }
    }

    const opciones = finalTexts.map((texto, idx) => ({
      letra: letters[idx],
      texto,
      esCorrecta: idx === safeTargetIdx
    }));

    return {
      opciones,
      respuestaCorrectaLetra: letters[safeTargetIdx],
      respuestaCorrectaTexto: correctText
    };
  }

  /**
   * Limpia el prefijo numérico de un tema ("1.2: Definición..." -> "Definición...")
   */
  function stripTopicPrefix(str) {
    return String(str || "")
      .replace(/^(\d+(?:\.\d+)*\s*[:.-]?|\s*[•\-]\s*)\s*/, "")
      .replace(/\.$/, "")
      .trim();
  }

  /**
   * Construye reactivos ricos, variados y específicos para CUALQUIER sílabo subido por el docente,
   * utilizando las unidades, subtemas, resultados de aprendizaje (de carrera y de unidad) y bibliografía reales del sílabo.
   */
  function buildDynamicQuestionForSyllabus(syllabus, unit, topicStr, dificultad, tipoPregunta, questionIndex, variantSeed = 0) {
    const meta = DIFFICULTY_META[dificultad] || DIFFICULTY_META.Medio;
    const cleanTopic = stripTopicPrefix(topicStr || unit.titulo);
    const unitTitle = stripTopicPrefix(unit.titulo || `Unidad ${unit.numero}`);
    const raUnidad = (unit.resultadoAprendizaje || `Analiza y aplica los contenidos técnicos de ${unitTitle}.`).trim();
    const asignaturaName = (syllabus.asignatura || "la asignatura").trim();

    const racObj =
      syllabus.resultadosCarrera && syllabus.resultadosCarrera.length > 0
        ? syllabus.resultadosCarrera[(questionIndex + variantSeed) % syllabus.resultadosCarrera.length]
        : {
            codigo: "RAC",
            descripcion: `Aplicar los conocimientos técnicos de ${asignaturaName} en la gestión del transporte.`
          };

    const allBibs = [].concat(syllabus.bibliografia?.basica || [], syllabus.bibliografia?.complementaria || []);
    const bibliografia =
      allBibs.length > 0
        ? allBibs[(questionIndex + variantSeed) % allBibs.length]
        : `Bibliografía declarada en el sílabo de ${asignaturaName}.`;

    // Obtener varios subtemas de la misma unidad para construir preguntas de relación, ordenación y distractores contextualizados
    const rawTopics = (unit.temas || []).map(stripTopicPrefix).filter((t) => t.length > 3);
    // Priorizar subtemas específicos
    const distinctTopics = [];
    for (const t of rawTopics) {
      if (!distinctTopics.includes(t)) distinctTopics.push(t);
    }
    const baseOffset = (questionIndex + variantSeed) % Math.max(1, distinctTopics.length);
    const t1 = distinctTopics[baseOffset % Math.max(1, distinctTopics.length)] || cleanTopic;
    const t2 = distinctTopics[(baseOffset + 1) % Math.max(1, distinctTopics.length)] || `Análisis operativo de ${unitTitle}`;
    const t3 = distinctTopics[(baseOffset + 2) % Math.max(1, distinctTopics.length)] || `Evaluación de indicadores en ${unitTitle}`;
    const t4 = distinctTopics[(baseOffset + 3) % Math.max(1, distinctTopics.length)] || `Normativa y gestión estratégica de ${unitTitle}`;

    const variant = (questionIndex + variantSeed) % 4;
    let enunciado = "";
    let rawOptions = [];
    let correctIdx = 0;
    let justificacion = "";

    if (tipoPregunta === "Verdadero o Falso") {
      const isTrueVariant = variant % 2 === 0;
      if (isTrueVariant) {
        enunciado = `En el marco de la asignatura ${asignaturaName} (Unidad ${unit.numero}: ${unitTitle}), el desarrollo técnico de "${cleanTopic}" tiene como propósito directo contribuir al logro del resultado de aprendizaje: "${raUnidad}".`;
        rawOptions = ["Verdadero", "Falso"];
        correctIdx = 0;
        justificacion = `El enunciado es Verdadero, ya que según la planificación curricular del sílabo de ${asignaturaName} (${bibliografia}), el subtema "${cleanTopic}" tributa directamente al cumplimiento del resultado de aprendizaje de la Unidad ${unit.numero}.`;
      } else {
        enunciado = `Dentro del estudio de "${unitTitle}" en la asignatura ${asignaturaName}, el análisis de "${cleanTopic}" prescinde completamente de criterios técnicos, normativos y de eficiencia operativa en la toma de decisiones del transporte.`;
        rawOptions = ["Verdadero", "Falso"];
        correctIdx = 1;
        justificacion = `El enunciado es Falso, puesto que en ${asignaturaName} (${bibliografia}), el abordaje de "${cleanTopic}" exige rigor técnico, observancia normativa y evaluación de eficiencia para cumplir con "${raUnidad}".`;
      }
    } else if (tipoPregunta === "De asociación o emparejamiento") {
      enunciado =
        `Dentro de la Unidad ${unit.numero} (${unitTitle}) de la asignatura ${asignaturaName}, relacione cada subtema del sílabo con su ámbito de aplicación técnica correspondiente:\n` +
        `(1) ${t1}\n` +
        `(2) ${t2}\n` +
        `(3) ${t3}\n` +
        `(4) ${t4}\n\n` +
        `a) Fundamenta la conceptualización técnica, principios base y caracterización diagnóstica del componente en estudio.\n` +
        `b) Estructura los procedimientos metodológicos y la articulación funcional de las operaciones del sistema.\n` +
        `c) Analiza los parámetros técnicos, variables de control y criterios de desempeño aplicados a la unidad.\n` +
        `d) Integra la toma de decisiones para optimizar recursos y dar cumplimiento a: "${raUnidad.slice(0, 130)}".`;
      rawOptions = ["1a, 2b, 3c, 4d", "1b, 2a, 3d, 4c", "1c, 2d, 3a, 4b", "1d, 2c, 3b, 4a"];
      correctIdx = 0;
      justificacion = `La correspondencia correcta es 1a, 2b, 3c, 4d, articulando secuencialmente los subtemas de la Unidad ${unit.numero} (${t1}, ${t2}, ${t3} y ${t4}) para alcanzar el resultado de aprendizaje: "${raUnidad}" (${bibliografia}).`;
    } else if (tipoPregunta === "De ordenación") {
      enunciado =
        `En la asignatura ${asignaturaName}, para desarrollar de forma sistemática y técnica los contenidos de la Unidad ${unit.numero} (${unitTitle}) enfocados en "${cleanTopic}", ordene secuencialmente las siguientes fases de ejecución:\n` +
        `(1) Levantamiento de información base y caracterización de variables sobre "${t1}".\n` +
        `(2) Identificación del marco conceptual, requerimientos técnicos y alcance de "${unitTitle}".\n` +
        `(3) Aplicación de métodos de análisis y estructuración técnica sobre "${t2}" y "${t3}".\n` +
        `(4) Evaluación de resultados, verificación de indicadores y formulación de propuestas sobre "${t4}".`;
      rawOptions = ["2, 1, 3, 4", "1, 4, 2, 3", "3, 2, 1, 4", "4, 1, 3, 2"];
      correctIdx = 0;
      justificacion = `El orden metodológico correcto es 2, 1, 3, 4: primero se establece el marco conceptual y requerimientos de "${unitTitle}" (2), luego se levanta la información diagnóstica de "${t1}" (1), se aplican los métodos de análisis en "${t2}" y "${t3}" (3), y finalmente se evalúan los resultados en "${t4}" (${bibliografia}).`;
    } else if (tipoPregunta === "De complementación, completación, mutiladas") {
      if (dificultad === "Bajo") {
        enunciado = `De acuerdo con la Unidad ${unit.numero} (${unitTitle}) de la asignatura ${asignaturaName}, el estudio técnico de "${cleanTopic}" se fundamenta en la identificación precisa de ___________________ para orientar la gestión eficiente del transporte.`;
        rawOptions = [
          `los conceptos, principios técnicos y variables operativas que estructuran "${unitTitle}"`,
          `actividades informales desvinculadas de la planificación técnica y sin sustento en el sílabo`,
          `criterios exclusivamente empíricos que descartan la normativa vigente y el control de calidad`,
          `procedimientos aislados que impiden medir el logro de resultados en la carrera`
        ];
      } else if (dificultad === "Medio") {
        enunciado = `En la Unidad ${unit.numero} (${unitTitle}), la comprensión integral de "${cleanTopic}" y su articulación con "${t2}" permiten al profesional en Gestión del Transporte ___________________ dentro de su campo de actuación.`;
        rawOptions = [
          `organizar e interpretar las relaciones técnicas del sistema para optimizar procesos y recursos operativos`,
          `incrementar la fragmentación operativa entre las áreas de planificación y operación del servicio`,
          `eliminar los indicadores de desempeño y prescindir del análisis técnico-económico de las rutas`,
          `sustituir el diagnóstico técnico de ingeniería por estimaciones subjetivas no verificables`
        ];
      } else {
        enunciado = `Al resolver un problema práctico sobre "${cleanTopic}" (Unidad ${unit.numero}: ${unitTitle}), si un análisis técnico evidencia pérdidas de eficiencia del 18% en el proceso asociado a "${t2}", la acción correctiva de ingeniería consiste en ___________________ conforme a los criterios de ${asignaturaName}.`;
        rawOptions = [
          `rediseñar los parámetros operativos aplicando el análisis técnico de capacidad, tiempos de ciclo y control de recursos`,
          `mantener inalteradas las condiciones críticas de operación sin ejecutar correctivos técnicos ni medición de indicadores`,
          `incrementar los costos fijos del sistema sin evaluar la causa raíz ni las restricciones de demanda`,
          `suspender el monitoreo técnico de la unidad y descartar los lineamientos de sostenibilidad ambiental`
        ];
      }
      correctIdx = 0;
      justificacion = `Conforme a la Unidad ${unit.numero} (${unitTitle}) y la bibliografía del sílabo (${bibliografia}), el estudio de "${cleanTopic}" permite cumplir el resultado de aprendizaje: "${raUnidad}".`;
    } else {
      // Selección Múltiple (con múltiples variantes por nivel de dificultad)
      if (dificultad === "Bajo") {
        if (variant % 2 === 0) {
          enunciado = `Dentro de la Unidad ${unit.numero} (${unitTitle}) de la asignatura ${asignaturaName}, ¿cuál de los siguientes enunciados define con precisión el alcance técnico del tema "${cleanTopic}"?`;
          rawOptions = [
            `Comprende los fundamentos conceptuales, parámetros técnicos y criterios metodológicos necesarios para que el estudiante: "${raUnidad}".`,
            `Se limita exclusivamente al registro contable de activos administrativos ajenos a la operación técnica del transporte.`,
            `Establece la eliminación de los controles técnicos y normativos en la planificación de "${unitTitle}".`,
            `Reemplaza los estudios técnicos de la especialidad por procedimientos informales sin base científica.`
          ];
        } else {
          enunciado = `En el estudio de "${unitTitle}" (${asignaturaName}), al analizar los componentes de "${cleanTopic}" y "${t2}", ¿qué elemento constituye la base técnica indispensable para su correcta identificación y clasificación?`;
          rawOptions = [
            `El reconocimiento riguroso de la terminología, principios funcionales, variables de diseño y normativa aplicable al sistema en estudio.`,
            `La omisión de los datos técnicos de demanda y capacidad durante la fase de caracterización inicial del sistema.`,
            `La aplicación exclusiva de criterios comerciales externos sin considerar la seguridad ni la eficiencia operativa.`,
            `La desarticulación entre los objetivos técnicos de la asignatura y el perfil profesional de Gestión del Transporte.`
          ];
        }
        justificacion = `En el nivel taxonómico de Conocimiento (Dificultad Baja), el reactivo evalúa el dominio conceptual de "${cleanTopic}" dentro de la Unidad ${unit.numero} (${unitTitle}), en correspondencia con "${raUnidad}" (${bibliografia}).`;
      } else if (dificultad === "Medio") {
        if (variant % 2 === 0) {
          enunciado = `En el contexto de la Unidad ${unit.numero} (${unitTitle}) de ${asignaturaName}, ¿cómo se relacionan funcionalmente el estudio de "${cleanTopic}" y el desarrollo de "${t2}" para alcanzar el resultado de aprendizaje de la unidad?`;
          rawOptions = [
            `Se complementan de manera sistémica para organizar el conocimiento técnico, interpretar las variables críticas y estructurar soluciones eficientes en el ámbito del transporte.`,
            `Actúan como procesos excluyentes e incompatibles que impiden integrar la planificación con la operación técnica.`,
            `Restringen la capacidad de análisis del profesional al enfocarse únicamente en trámites burocráticos sin impacto operativo.`,
            `Eliminan la necesidad de evaluar indicadores técnicos, económicos y ambientales en los proyectos de la carrera.`
          ];
        } else {
          enunciado = `Al analizar comparativamente los criterios técnicos de "${cleanTopic}" frente a "${t3}" dentro de la Unidad ${unit.numero} (${unitTitle}), ¿cuál es la condición clave para garantizar una gestión eficiente y sostenible?`;
          rawOptions = [
            `Articular de forma equilibrada la capacidad técnica, la optimización de recursos y la calidad del servicio conforme a los lineamientos de "${raUnidad}".`,
            `Priorizar únicamente el incremento de costos operativos sin considerar los niveles de servicio ni la seguridad del usuario.`,
            `Aislar el análisis de "${cleanTopic}" del resto de componentes que integran la cadena de transporte y movilidad.`,
            `Descartar el uso de metodologías técnicas y herramientas digitales en el diagnóstico del problema.`
          ];
        }
        justificacion = `En el nivel taxonómico de Comprensión (Dificultad Media), se evalúa la capacidad de relacionar e interpretar "${cleanTopic}" y "${t2}" en función de "${raUnidad}" y del ${racObj.codigo} (${bibliografia}).`;
      } else {
        // Dificultad Alta (Aplicación — Casos prácticos y cuantitativos adaptados al tema)
        if (variant === 0) {
          enunciado =
            `Caso práctico de Aplicación (${asignaturaName} — Unidad ${unit.numero}: ${unitTitle} / Tema: ${cleanTopic}):\n` +
            `En un proyecto técnico de Gestión del Transporte enfocado en "${cleanTopic}", el diagnóstico línea base determina un costo operativo de $4.800 semanales con un rendimiento efectivo del 75% y un tiempo medio de proceso de 8,0 horas. Tras implementar mejoras técnicas basadas en "${t2}" y "${t3}", se logra reducir el tiempo de proceso en un 25% y disminuir los costos operativos semanales en un 15%, manteniendo constante el nivel de demanda atendida. ¿Cuál es el nuevo tiempo medio de proceso y el ahorro económico mensual (considerando 4 semanas por mes) generado por la intervención técnica?`;
          rawOptions = [
            `Nuevo tiempo de proceso de 6,0 horas y un ahorro económico mensual de $2.880,00.`,
            `Nuevo tiempo de proceso de 6,5 horas y un ahorro económico mensual de $2.160,00.`,
            `Nuevo tiempo de proceso de 6,0 horas y un ahorro económico mensual de $720,00.`,
            `Nuevo tiempo de proceso de 5,5 horas y un ahorro económico mensual de $3.200,00.`
          ];
          justificacion =
            `Resolución técnica (Nivel de Aplicación — Unidad ${unit.numero}): 1) Reducción del 25% en el tiempo de proceso de 8,0 h: T_nuevo = 8,0 × (1 - 0,25) = 6,0 horas. 2) Ahorro semanal del 15% sobre $4.800: Ahorro_semanal = $4.800 × 0,15 = $720,00/semana. 3) En un mes (4 semanas), el ahorro económico total es 4 × $720,00 = $2.880,00, evidenciando la aplicación práctica de "${cleanTopic}" (${bibliografia}).`;
        } else if (variant === 1) {
          enunciado =
            `Caso práctico de Aplicación (${asignaturaName} — Unidad ${unit.numero}: ${unitTitle} / Tema: ${cleanTopic}):\n` +
            `Durante una evaluación técnica sobre "${cleanTopic}", se analiza un sistema operativo que atiende una demanda de 1.200 unidades/día distribuidas en 20 unidades operativas con una capacidad nominal de 75 unidades/día cada una. Si por requerimientos de planificación asociados a "${t2}" la demanda se incrementa en un 20% para el próximo período y se exige operar con un factor de utilización máxima del 80% sobre la capacidad nominal para garantizar seguridad y nivel de servicio, ¿cuál es el factor de utilización actual y cuántas unidades operativas adicionales se requieren incorporar?`;
          rawOptions = [
            `El factor de utilización actual es del 80,0% y se requieren incorporar 4 unidades operativas adicionales (total 24 unidades).`,
            `El factor de utilización actual es del 75,0% y se requieren incorporar 6 unidades operativas adicionales (total 26 unidades).`,
            `El factor de utilización actual es del 80,0% y se requieren incorporar 2 unidades operativas adicionales (total 22 unidades).`,
            `El factor de utilización actual es del 85,0% y se requieren incorporar 5 unidades operativas adicionales (total 25 unidades).`
          ];
          justificacion =
            `Resolución técnica (Nivel de Aplicación — ${racObj.codigo}): 1) Capacidad nominal actual = 20 × 75 = 1.500 u/día; Factor de utilización actual = 1.200 / 1.500 = 0,80 (80,0%). 2) Nueva demanda (+20%) = 1.200 × 1,20 = 1.440 u/día. 3) Capacidad efectiva por unidad al 80% = 75 × 0,80 = 60 u/día. 4) Unidades requeridas = 1.440 / 60 = 24 unidades, por lo que deben incorporarse 24 - 20 = 4 unidades adicionales (${bibliografia}).`;
        } else {
          enunciado =
            `Caso práctico de Aplicación (${asignaturaName} — Unidad ${unit.numero}: ${unitTitle} / Tema: ${cleanTopic}):\n` +
            `Un equipo técnico multidisciplinario evalúa dos alternativas de intervención sobre "${cleanTopic}" y "${t2}":\n` +
            `• Alternativa 1: Inversión inicial de $12.000, costos operativos mensuales de $1.800 y reducción de externalidades/incidencias del 30%.\n` +
            `• Alternativa 2: Inversión inicial de $15.600, costos operativos mensuales de $1.350 y reducción de externalidades/incidencias del 45%.\n` +
            `Aplicando razonamiento técnico-económico (${racObj.codigo}), ¿en cuántos meses de operación el ahorro en costos operativos de la Alternativa 2 compensa exactamente su mayor inversión inicial (período de recuperación incremental) y cuál es su ventaja adicional en reducción de incidencias?`;
          rawOptions = [
            `Se recupera en 8 meses de operación y aporta un 15% adicional de reducción de incidencias.`,
            `Se recupera en 10 meses de operación y aporta un 15% adicional de reducción de incidencias.`,
            `Se recupera en 6 meses de operación y aporta un 30% adicional de reducción de incidencias.`,
            `Se recupera en 12 meses de operación y aporta un 45% adicional de reducción de incidencias.`
          ];
          justificacion =
            `Resolución técnica (Nivel de Aplicación): Diferencia de inversión inicial = $15.600 - $12.000 = $3.600. Ahorro operativo mensual de la Alternativa 2 respecto a la Alternativa 1 = $1.800 - $1.350 = $450/mes. Tiempo de recuperación incremental = $3.600 / $450 = 8 meses, logrando además un 15% adicional en reducción de externalidades (45% vs 30%) en cumplimiento de "${raUnidad}" (${bibliografia}).`;
        }
      }
      correctIdx = 0;
    }

    const balanced = assignBalancedCorrectLetter(rawOptions, correctIdx, questionIndex + variantSeed);

    return {
      id: "reactivo_" + Date.now() + "_" + questionIndex + "_" + Math.floor(Math.random() * 10000),
      numero: questionIndex + 1,
      unidadNumero: unit.numero,
      unidadTema: `Unidad ${unit.numero}: ${unitTitle} — Tema: ${topicStr}`,
      resultadoAprendizaje: `${racObj.descripcion} | RA Unidad ${unit.numero}: ${raUnidad}`,
      nivelTaxonomico: meta.nivelTaxonomico,
      tipoPregunta: tipoPregunta,
      instruccion: QUESTION_TYPE_INSTRUCTIONS[tipoPregunta] || QUESTION_TYPE_INSTRUCTIONS["Selección Múltiple"],
      enunciado: enunciado,
      opciones: balanced.opciones,
      respuestaCorrectaLetra: balanced.respuestaCorrectaLetra,
      respuestaCorrectaTexto: balanced.respuestaCorrectaTexto,
      justificacion: justificacion,
      dificultad: dificultad,
      tiempoEstimado: meta.tiempoDefault,
      bibliografia: bibliografia
    };
  }

  /**
   * Genera el conjunto completo de reactivos según las opciones seleccionadas por el docente
   */
  function generateQuestions(syllabus, config) {
    const cantBajo = Math.max(0, parseInt(config.cantBajo || 0, 10));
    const cantMedio = Math.max(0, parseInt(config.cantMedio || 0, 10));
    const cantAlto = Math.max(0, parseInt(config.cantAlto || 0, 10));

    const tipos =
      config.tiposSeleccionados && config.tiposSeleccionados.length > 0
        ? config.tiposSeleccionados
        : ["Selección Múltiple"];

    const availableUnits = (syllabus.unidades || []).filter((u) =>
      config.unidadesSeleccionadas && config.unidadesSeleccionadas.length > 0
        ? config.unidadesSeleccionadas.includes(u.numero)
        : true
    );
    const unitsToUse = availableUnits.length > 0 ? availableUnits : syllabus.unidades || [];

    const requests = [];
    for (let i = 0; i < cantBajo; i++) requests.push("Bajo");
    for (let i = 0; i < cantMedio; i++) requests.push("Medio");
    for (let i = 0; i < cantAlto; i++) requests.push("Alto");

    // Verificar si el sílabo activo es específicamente el de "Introducción al Transporte y la Logística" (TRALP17)
    const isIntroTransportSyllabus =
      /INTRODUCCI[ÓO]N\s+AL\s+TRANSPORTE\s+Y\s+LA\s+LOG[ÍI]STICA/i.test(syllabus.asignatura || "") &&
      (syllabus.unidades || []).some((u) => /intermodal/i.test(u.titulo || ""));

    const usedSpecializedIndices = new Set();
    const generated = [];
    const allBibs = [].concat(syllabus.bibliografia?.basica || [], syllabus.bibliografia?.complementaria || []);

    // Mantener un contador de qué tema se ha usado en cada unidad para no repetir subtemas
    const unitTopicCursor = {};

    requests.forEach((dificultad, qIdx) => {
      const requestedType = tipos[qIdx % tipos.length];
      const targetUnit = unitsToUse[qIdx % unitsToUse.length];

      if (isIntroTransportSyllabus && requestedType !== "Verdadero o Falso") {
        let matchIdx = SPECIALIZED_TRANSPORT_BANK.findIndex(
          (item, idx) =>
            !usedSpecializedIndices.has(idx) &&
            item.dificultad === dificultad &&
            item.tipoPregunta === requestedType &&
            unitsToUse.some((u) => u.numero === item.unidadNumero)
        );

        if (matchIdx === -1 && tipos.includes("Selección Múltiple")) {
          matchIdx = SPECIALIZED_TRANSPORT_BANK.findIndex(
            (item, idx) =>
              !usedSpecializedIndices.has(idx) &&
              item.dificultad === dificultad &&
              tipos.includes(item.tipoPregunta) &&
              unitsToUse.some((u) => u.numero === item.unidadNumero)
          );
        }

        if (matchIdx === -1) {
          matchIdx = SPECIALIZED_TRANSPORT_BANK.findIndex(
            (item, idx) =>
              !usedSpecializedIndices.has(idx) &&
              item.dificultad === dificultad &&
              unitsToUse.some((u) => u.numero === item.unidadNumero) &&
              (requestedType === item.tipoPregunta || requestedType === "Selección Múltiple")
          );
        }

        if (matchIdx !== -1) {
          usedSpecializedIndices.add(matchIdx);
          const bankItem = SPECIALIZED_TRANSPORT_BANK[matchIdx];
          const unitObj =
            syllabus.unidades.find((u) => u.numero === bankItem.unidadNumero) || targetUnit || syllabus.unidades[0];
          const racObj =
            syllabus.resultadosCarrera && syllabus.resultadosCarrera.length > 0
              ? syllabus.resultadosCarrera[qIdx % syllabus.resultadosCarrera.length]
              : { codigo: "RAC3", descripcion: "RAC3: Aplicar los conocimientos del área profesionalizante..." };

          const balanced = assignBalancedCorrectLetter(bankItem.opciones, bankItem.correctIndex, qIdx);
          const bib =
            allBibs[bankItem.bibIndex] ||
            allBibs[0] ||
            "Arenal, Carmen. (2022). Transporte de larga distancia. Recuperado de: https://elibro.net/es/ereader/espoch/226118";

          generated.push({
            id: "reactivo_" + Date.now() + "_" + qIdx + "_" + Math.floor(Math.random() * 10000),
            numero: qIdx + 1,
            unidadNumero: unitObj.numero,
            unidadTema: `Unidad ${unitObj.numero}: ${unitObj.titulo} — Tema ${bankItem.subtemaEspecifico}`,
            resultadoAprendizaje: `${racObj.descripcion} | RA Unidad ${unitObj.numero}: ${unitObj.resultadoAprendizaje}`,
            nivelTaxonomico: bankItem.nivelTaxonomico,
            tipoPregunta: bankItem.tipoPregunta,
            instruccion:
              QUESTION_TYPE_INSTRUCTIONS[bankItem.tipoPregunta] || QUESTION_TYPE_INSTRUCTIONS["Selección Múltiple"],
            enunciado: bankItem.enunciado,
            opciones: balanced.opciones,
            respuestaCorrectaLetra: balanced.respuestaCorrectaLetra,
            respuestaCorrectaTexto: balanced.respuestaCorrectaTexto,
            justificacion: bankItem.justificacion,
            dificultad: bankItem.dificultad,
            tiempoEstimado: bankItem.tiempoEstimado,
            bibliografia: bib
          });
          return;
        }
      }

      // Para cualquier sílabo subido: elegir subtemas específicos (ej. 1.1, 1.2, 2.1) evitando cabeceras genéricas cuando hay subtemas
      const allUnitTopics = targetUnit.temas && targetUnit.temas.length > 0 ? targetUnit.temas : [`1.1: ${targetUnit.titulo}`];
      const specificSubtopics = allUnitTopics.filter((t) => /^\d+\.\d+/.test(t.trim()));
      const poolTopics = specificSubtopics.length > 0 ? specificSubtopics : allUnitTopics;

      const uKey = targetUnit.numero;
      const cursor = unitTopicCursor[uKey] || 0;
      unitTopicCursor[uKey] = cursor + 1;

      const chosenTopic = poolTopics[cursor % poolTopics.length];
      const dynamicQuestion = buildDynamicQuestionForSyllabus(
        syllabus,
        targetUnit,
        chosenTopic,
        dificultad,
        requestedType,
        qIdx,
        cursor
      );
      generated.push(dynamicQuestion);
    });

    return generated;
  }

  /**
   * Regenera un único reactivo rotando al siguiente subtema y variante de la unidad
   */
  function regenerateSingleQuestion(syllabus, currentQuestion, variationSeed = 1) {
    const unitObj =
      (syllabus.unidades || []).find((u) => u.numero === currentQuestion.unidadNumero) ||
      (syllabus.unidades || [])[0];
    const allUnitTopics = unitObj.temas && unitObj.temas.length > 0 ? unitObj.temas : [`1.1: ${unitObj.titulo}`];
    const specificSubtopics = allUnitTopics.filter((t) => /^\d+\.\d+/.test(t.trim()));
    const poolTopics = specificSubtopics.length > 0 ? specificSubtopics : allUnitTopics;

    const nextTopic = poolTopics[(currentQuestion.numero + variationSeed) % poolTopics.length];

    const newQ = buildDynamicQuestionForSyllabus(
      syllabus,
      unitObj,
      nextTopic,
      currentQuestion.dificultad,
      currentQuestion.tipoPregunta,
      currentQuestion.numero - 1,
      variationSeed
    );
    newQ.numero = currentQuestion.numero;
    return newQ;
  }

  /**
   * Generación opcional asistida por IA (Google Gemini API)
   */
  async function generateQuestionsWithGeminiAI(syllabus, config, apiKey) {
    const cantBajo = Math.max(0, parseInt(config.cantBajo || 0, 10));
    const cantMedio = Math.max(0, parseInt(config.cantMedio || 0, 10));
    const cantAlto = Math.max(0, parseInt(config.cantAlto || 0, 10));
    const total = cantBajo + cantMedio + cantAlto;

    const prompt = `Eres un experto diseñador de reactivos académicos de la Escuela Superior Politécnica de Chimborazo (ESPOCH), Carrera de Gestión del Transporte, rigiéndote estrictamente por la "Guía para el diseño, aplicación y seguimiento de la evaluación de los resultados de aprendizaje de la carrera" (Resolución 133.CP.2026).

Datos del Sílabo de la Asignatura:
- Asignatura: ${syllabus.asignatura}
- PAO: ${syllabus.pao}
- Profesor: ${syllabus.profesor}
- Resultados de Aprendizaje de la Carrera (RAC): ${JSON.stringify(syllabus.resultadosCarrera)}
- Unidades y Temas del Sílabo: ${JSON.stringify(syllabus.unidades)}
- Bibliografía declarada en el Sílabo: ${JSON.stringify(syllabus.bibliografia)}

Requerimiento del Docente:
Genera exactamente ${total} reactivos distribuidos así:
- ${cantBajo} reactivos de Dificultad "Bajo" (Nivel Taxonómico: "Conocimiento", tiempo estimado: "2 minutos")
- ${cantMedio} reactivos de Dificultad "Medio" (Nivel Taxonómico: "Comprensión", tiempo estimado: "3 minutos")
- ${cantAlto} reactivos de Dificultad "Alto" (Nivel Taxonómico: "Aplicación" con casos prácticos o resolución de problemas, tiempo estimado: "4 minutos" o "5 minutos")

Tipos de preguntas permitidos: ${JSON.stringify(config.tiposSeleccionados)}
Unidades seleccionadas: ${JSON.stringify(config.unidadesSeleccionadas)}

Devuelve ÚNICAMENTE un arreglo JSON válido con objetos que tengan exactamente esta estructura:
[
  {
    "unidadNumero": 1,
    "unidadTema": "Unidad 1: ... — Tema 1.1: ...",
    "resultadoAprendizaje": "RAC...: ... | RA Unidad: ...",
    "nivelTaxonomico": "Conocimiento" | "Comprensión" | "Aplicación",
    "tipoPregunta": "Selección Múltiple" | "De complementación, completación, mutiladas" | "De asociación o emparejamiento" | "De ordenación",
    "instruccion": "...",
    "enunciado": "...",
    "opciones": [
      {"letra": "a", "texto": "...", "esCorrecta": false},
      {"letra": "b", "texto": "...", "esCorrecta": true},
      {"letra": "c", "texto": "...", "esCorrecta": false},
      {"letra": "d", "texto": "...", "esCorrecta": false}
    ],
    "respuestaCorrectaLetra": "b",
    "respuestaCorrectaTexto": "...",
    "justificacion": "...",
    "dificultad": "Bajo" | "Medio" | "Alto",
    "tiempoEstimado": "2 minutos",
    "bibliografia": "..."
  }
]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error("Error en la llamada a la API de Gemini (" + response.status + ")");
    }
    const data = await response.json();
    const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const parsedList = JSON.parse(rawJson);

    return parsedList.map((item, idx) => ({
      ...item,
      id: "reactivo_ai_" + Date.now() + "_" + idx,
      numero: idx + 1
    }));
  }

  return {
    DIFFICULTY_META,
    QUESTION_TYPE_INSTRUCTIONS,
    generateQuestions,
    regenerateSingleQuestion,
    generateQuestionsWithGeminiAI
  };
})();
