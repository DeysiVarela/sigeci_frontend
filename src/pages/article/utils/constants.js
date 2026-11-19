// Constantes del módulo de artículos (SCRUM-67 / filtrado).
// Ajustar los valores string si el backend usa otros identificadores.

export const ROLES = Object.freeze({
    AUTOR: "AUTOR",
    MEMBER: "MEMBER", // Miembro del comité científico
    ADMIN: "ADMIN"
});
// Variantes con las que puede llegar el rol desde el login/backend
const ROLE_ALIASES = {
    AUTOR: ROLES.AUTOR,
    AUTHOR: ROLES.AUTOR,
    MEMBER: ROLES.MEMBER,
    MIEMBRO: ROLES.MEMBER,
    ADMIN: ROLES.ADMIN,
    ADMINISTRADOR: ROLES.ADMIN
};

export const normalizeRole = (raw) => {
    if (!raw) return null;
    const key = String(raw).trim().toUpperCase().replace(/^ROLE_/, "");
    return ROLE_ALIASES[key] ?? null;
};




export const ARTICLE_STATUS = Object.freeze({
    POSTULADO: "POSTULADO",
    EN_REVISION: "EN_REVISION",
    ACEPTADO: "ACEPTADO",
    RECHAZADO: "RECHAZADO",
    CON_AVAL_PRESENTACION: "CON_AVAL_PRESENTACION",
    CON_AVAL_PUBLICACION: "CON_AVAL_PUBLICACION",
    DESHABILITADO: "DESHABILITADO"
});

// Orden oficial de los estados (CA-03 catálogo / CA-01 filtrado)
export const STATUS_ORDER = [
    ARTICLE_STATUS.POSTULADO,
    ARTICLE_STATUS.EN_REVISION,
    ARTICLE_STATUS.ACEPTADO,
    ARTICLE_STATUS.RECHAZADO,
    ARTICLE_STATUS.CON_AVAL_PRESENTACION,
    ARTICLE_STATUS.CON_AVAL_PUBLICACION,
    ARTICLE_STATUS.DESHABILITADO
];

// Insignia diferenciada por estado: color + ícono (no depender solo del color)
export const STATUS_META = {
    POSTULADO: { label: "Postulado", variant: "secondary", icon: "bi-send" },
    EN_REVISION: { label: "En revisión", variant: "warning", icon: "bi-hourglass-split" },
    ACEPTADO: { label: "Aceptado", variant: "primary", icon: "bi-check-circle" },
    RECHAZADO: { label: "Rechazado", variant: "danger", icon: "bi-x-circle" },
    CON_AVAL_PRESENTACION: { label: "Con aval de presentación", variant: "info", icon: "bi-easel" },
    CON_AVAL_PUBLICACION: { label: "Con aval de publicación", variant: "success", icon: "bi-journal-check" },
    DESHABILITADO: { label: "Deshabilitado", variant: "dark", icon: "bi-slash-circle" }
};

export const getStatusLabel = (status) => STATUS_META[status]?.label ?? status ?? "Sin estado";

// Estados que se consideran de dominio público (publicados en las memorias).
// Si el equipo decide que CON_AVAL_PRESENTACION también es público, agregarlo aquí.
export const PUBLIC_STATUSES = [ARTICLE_STATUS.CON_AVAL_PUBLICACION];

// Líneas temáticas de la conferencia (mismos values que CreateArticleScreen)
export const TOPICS = [
    { value: "sistemas_inteligentes", label: "Sistemas Inteligentes" },
    { value: "tecnologias_informatica", label: "Tecnologías en Informática" },
    { value: "educacion_informatica", label: "Educación en Informática" },
    { value: "sistemas_software", label: "Sistemas de Software" },
    { value: "software_practica", label: "Software en la Práctica" }
];

export const getTopicLabel = (value, fallback = "Sin línea temática") =>
    TOPICS.find((t) => t.value === value)?.label ?? fallback;

// Alcance del catálogo
//  - all:      el administrador ve todo
//  - assigned: el miembro del comité ve solo los artículos que le asignaron para evaluar
//  - mine:     el autor ve sus propios artículos (cualquier estado)
//  - public:   el autor ve los artículos publicados de todos
export const CATALOG_SCOPE = Object.freeze({
    ALL: "all",
    ASSIGNED: "assigned",   
    MINE: "mine",
    PUBLIC: "public"
});

export const PAGE_SIZE_OPTIONS = [10, 20, 50];
export const DEFAULT_PAGE_SIZE = 10;

export const getStatusOptionsForScope = (scope) =>
    scope === CATALOG_SCOPE.PUBLIC ? PUBLIC_STATUSES : STATUS_ORDER;
