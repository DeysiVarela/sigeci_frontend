// Datos de prueba con el modelo del catálogo (SCRUM-67).
// Campos: id, title, authorId, author, topic, submittedAt (YYYY-MM-DD), status, summary, content, views
// reviewerIds: miembros del comité asignados para evaluar (25 = usuario 'miembro' de la BD local).
// authorId 101 = autor de prueba.

const DETAILED = [
    {
        id: 1,
        title: "Modelos de Inteligencia Artificial para el Diagnóstico Clínico Temprano",
        authorId: 102,
        author: "Dra. Sofía Rodríguez",
        topic: "sistemas_inteligentes",
        submittedAt: "2026-08-04",
        status: "CON_AVAL_PUBLICACION",
        views: 1420,
        summary:
            "Investigación sobre la aplicación de redes neuronales convolucionales y transformers en el análisis preventivo de imágenes médicas en hospitales del Valle del Cauca.",
        content: `La inteligencia artificial ha revolucionado los métodos de diagnóstico médico preventivo. En este estudio evaluamos la eficacia de arquitecturas basadas en Transformers para detección temprana de patologías respiratorias y cardiovasculares.

Se recopilaron más de 12,000 registros anonimizados en centros de salud del Valle del Cauca durante el período 2024-2025. Los resultados arrojaron una precisión promedio del 94.6% y una reducción sustancial en falsos positivos en comparación con modelos convolucionales convencionales.`
    },
    {
        id: 2,
        title: "Optimización de Algoritmos Criptográficos en Sistemas Distribuidos",
        authorId: 103,
        author: "Ing. Carlos Mendoza",
        topic: "tecnologias_informatica",
        submittedAt: "2026-08-11",
        status: "EN_REVISION",
        views: 980,
        summary:
            "Análisis comparativo de latencia y throughput en protocolos de cifrado asimétrico sobre arquitecturas de microservicios distribuidos.",
        content: `La seguridad de las comunicaciones en arquitecturas de microservicios demanda mecanismos de autenticación y cifrado con mínima degradación en rendimiento.

Este artículo presenta una evaluación de curvas elípticas Ed25519 frente a RSA tradicional en entornos distribuidos de alta concurrencia.`
    },
    {
        id: 3,
        title: "Metodologías Ágiles en la Gestión Curricular Universitaria",
        authorId: 101,
        author: "Laura Gómez",
        topic: "educacion_informatica",
        submittedAt: "2026-08-19",
        status: "EN_REVISION",
        views: 640,
        summary:
            "Propuesta de integración del marco Scrum y Kanban para la actualización semestral de programas académicos en ingeniería.",
        content: `El diseño curricular tradicional suele responder con lentitud a las demandas del sector tecnológico.

Se implementó un plan piloto basado en iteraciones quincenales tipo Scrum, logrando actualizar contenidos programáticos con mayor agilidad.`
    },
    {
        id: 4,
        title: "Internet de las Cosas y Redes LoRaWAN para el Monitoreo Agrícola",
        authorId: 105,
        author: "Dr. Julián Castro",
        topic: "software_practica",
        submittedAt: "2026-09-02",
        status: "POSTULADO",
        views: 210,
        summary:
            "Diseño y despliegue de sensores de humedad y temperatura de bajo consumo para cultivos de caña de azúcar en zonas rurales.",
        content: `El monitoreo eficiente de variables agroclimáticas permite optimizar el consumo hídrico en el sector azucarero.

Implementamos nodos IoT autónomos energizados por paneles solares que transmiten telemetría mediante LoRaWAN.`
    },
    {
        id: 5,
        title: "Procesamiento de Lenguaje Natural en Lenguas Nativas de Colombia",
        authorId: 106,
        author: "Mateo Fernando Gómez",
        topic: "sistemas_inteligentes",
        submittedAt: "2026-08-22",
        status: "CON_AVAL_PUBLICACION",
        views: 1150,
        summary:
            "Desarrollo de corpus lingüístico y modelos de lenguaje de pocos recursos para la preservación cultural del Nasa Yuwe.",
        content: `La preservación digital de lenguas originarias enfrenta desafíos por la escasez de datos digitalizados.

Presentamos un corpus anotado para la lengua Nasa Yuwe y los resultados de afinamiento de modelos multilingües.`
    }
];

// [title, authorId, topic, submittedAt, status]
const COMPACT = [
    ["Arquitecturas Limpias en Aplicaciones Móviles Académicas", 101, "sistemas_software", "2026-09-05", "ACEPTADO"],
    ["Evaluación de Accesibilidad Web en Portales Universitarios", 101, "tecnologias_informatica", "2026-09-12", "RECHAZADO"],
    ["Gamificación para la Enseñanza de Estructuras de Datos", 101, "educacion_informatica", "2026-09-20", "POSTULADO"],
    ["Pruebas Automatizadas Basadas en Propiedades para APIs REST", 101, "software_practica", "2026-08-28", "CON_AVAL_PUBLICACION"],
    ["Detección de Fraude Transaccional con Aprendizaje No Supervisado", 102, "sistemas_inteligentes", "2026-09-08", "ACEPTADO"],
    ["Deuda Técnica en Proyectos de Software Libre Latinoamericanos", 103, "sistemas_software", "2026-08-15", "CON_AVAL_PRESENTACION"],
    ["Laboratorios Remotos para Cursos de Redes de Computadores", 104, "educacion_informatica", "2026-08-30", "CON_AVAL_PUBLICACION"],
    ["Microservicios y Observabilidad en Entidades Públicas", 105, "software_practica", "2026-09-14", "EN_REVISION"],
    ["Sistemas de Recomendación para Bibliotecas Universitarias", 106, "sistemas_inteligentes", "2026-09-18", "RECHAZADO"],
    ["Computación en el Borde para Ciudades Inteligentes", 102, "tecnologias_informatica", "2026-09-25", "POSTULADO"],
    ["Modelado Formal de Requisitos con Alloy", 103, "sistemas_software", "2026-09-27", "EN_REVISION"],
    ["Pensamiento Computacional en la Educación Básica Rural", 104, "educacion_informatica", "2026-10-01", "CON_AVAL_PUBLICACION"],
    ["DevOps en Equipos Pequeños: Lecciones de Campo", 105, "software_practica", "2026-10-03", "DESHABILITADO"],
    ["Visión por Computador para el Conteo de Aves Migratorias", 106, "sistemas_inteligentes", "2026-10-06", "CON_AVAL_PRESENTACION"],
    ["Blockchain para la Trazabilidad del Café de Origen", 102, "tecnologias_informatica", "2026-10-09", "EN_REVISION"],
    ["Métricas de Calidad en Arquitecturas Orientadas a Eventos", 103, "sistemas_software", "2026-10-12", "CON_AVAL_PUBLICACION"],
    ["Analítica del Aprendizaje en Plataformas LMS", 104, "educacion_informatica", "2026-10-14", "POSTULADO"],
    ["Migración de Monolitos Legados a la Nube Híbrida", 105, "software_practica", "2026-10-15", "ACEPTADO"],
    ["Agentes Conversacionales para Atención al Ciudadano", 106, "sistemas_inteligentes", "2026-10-17", "CON_AVAL_PUBLICACION"]
];

const AUTHORS = {
    101: "Laura Gómez",
    102: "Dra. Sofía Rodríguez",
    103: "Ing. Carlos Mendoza",
    104: "Prof. Mariana Restrepo",
    105: "Dr. Julián Castro",
    106: "Mateo Fernando Gómez"
};

// Asignaciones de evaluación de prueba: { idArtículo: [idMiembro, ...] }
const ASSIGNMENTS = {
    2: [25],
    3: [25],
    8: [25],
    14: [25],
    20: [25]
};

const BASE_ARTICLES = [
    ...DETAILED,
    ...COMPACT.map(([title, authorId, topic, submittedAt, status], i) => ({
        id: DETAILED.length + i + 1,
        title,
        authorId,
        author: AUTHORS[authorId],
        topic,
        submittedAt,
        status,
        views: 0,
        summary: `Resumen del trabajo "${title}".`,
        content: "Contenido completo disponible en el PDF de la propuesta."
    }))
];

export const MOCK_ARTICLES = BASE_ARTICLES.map((article) => ({
    ...article,
    reviewerIds: ASSIGNMENTS[article.id] ?? []
}));
