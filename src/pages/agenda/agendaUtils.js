const getCollection = (value) => {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "object") return [];

    for (const key of ["results", "data", "events", "agenda", "items"]) {
        if (Array.isArray(value[key])) return value[key];
    }
    for (const key of ["results", "data", "events", "agenda", "items"]) {
        if (value[key] && typeof value[key] === "object") {
            const collection = getCollection(value[key]);
            if (collection.length) return collection;
        }
    }

    return [];
};

const getName = (value) => {
    if (typeof value === "string") return value;
    if (!value || typeof value !== "object") return "";
    return value.name || value.title || value.topic || value.topic_name || value.topic_subject || value.label || "";
};

export const getEventRequestError = (error, fallback) => {
    if (error?.status === 401) return "Tu sesión expiró o no es válida. Inicia sesión nuevamente.";
    if (error?.status === 403) return "No tienes autorización para gestionar estos eventos.";
    return error?.message || fallback;
};

export const normalizeTopics = (event) => {
    const rawTopics = event.topics || event.topic || event.thematic_lines || event.thematic_line || event.theme;
    const collection = getCollection(rawTopics);
    const topics = Array.isArray(rawTopics) ? rawTopics : collection.length ? collection : rawTopics ? [rawTopics] : [];
    return topics.map(getName).filter(Boolean);
};

const normalizeEvent = (event, fallbackId) => ({
    ...event,
    id: event.id ?? event.event_id ?? event.eventId ?? event.slug ?? fallbackId,
    title: event.title || event.event_name || event.name || "Evento sin nombre",
    description: event.description || event.event_description || event.summary || event.abstract || "",
    location: event.location || event.event_address || event.venue || event.place || event.room || "",
    topics: [...new Set([
        ...normalizeTopics(event),
        ...normalizeTopics({
            topics: event.unique_topics || event.uniqueTopics || event.topics_unique || event.topic_names
        })
    ])]
});

export const normalizeEvents = (payload) =>
    getCollection(payload).map((event, index) => normalizeEvent(event, `event-${index}`));

export const normalizeEventDetail = (payload, eventId) => {
    let event = payload;
    for (let depth = 0; depth < 3; depth += 1) {
        if (event?.event && typeof event.event === "object") event = event.event;
        else if (event?.data && typeof event.data === "object" && !Array.isArray(event.data)) event = event.data;
        else break;
    }
    return normalizeEvent(event || {}, eventId ?? "event-0");
};

export const getEventSchedule = (event) => {
    const rawSchedule = event.schedule
        || event.schedules
        || event.program
        || event.programming
        || event.agenda
        || event.sessions
        || event.activities;

    if (Array.isArray(rawSchedule)) return sortSchedule(rawSchedule, event.event_date);
    if (rawSchedule && typeof rawSchedule === "object") {
        const collection = getCollection(rawSchedule);
        return sortSchedule(collection.length ? collection : [rawSchedule], event.event_date);
    }

    const hasScheduleDetails = event.date
        || event.start_date
        || event.start_time
        || event.time
        || event.datetime;
    return hasScheduleDetails ? [event] : [];
};

const sortSchedule = (schedule, eventDate) =>
    [...schedule].sort((first, second) => {
        const firstDate = getScheduleDate(first, eventDate).slice(0, 10);
        const secondDate = getScheduleDate(second, eventDate).slice(0, 10);
        const dateComparison = firstDate.localeCompare(secondDate);
        return dateComparison || getScheduleTime(first).localeCompare(getScheduleTime(second));
    });

export const getScheduleTitle = (item) =>
    item.title || item.activity || item.name || item.session || item.article_title || "Presentación";

export const getScheduleDate = (item, eventDate = "") =>
    item.schedule_date || item.date || item.start_date || item.event_date || eventDate || "";

export const getScheduleTime = (item) =>
    item.schedule_hour || item.start_time || item.time || item.start || item.datetime || "";

export const getScheduleLocation = (item) => item.location || item.room || item.place || item.venue || "";

export const getScheduleTopics = (item) => normalizeTopics(item);

export const formatEventDate = (value) => {
    if (!value) return "Por confirmar";

    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(value));
    const date = new Date(dateOnly ? `${value}T12:00:00` : value);
    if (Number.isNaN(date.getTime())) return String(value);

    const options = dateOnly
        ? { dateStyle: "medium", timeZone: "America/Bogota" }
        : { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" };
    return new Intl.DateTimeFormat("es-CO", options).format(date);
};
