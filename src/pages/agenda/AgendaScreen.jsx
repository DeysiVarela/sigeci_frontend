import { useCallback, useEffect, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { isValid, parseISO } from "date-fns";
import Modal from "../../components/modals/Modal";
import { getAgenda } from "../../api/agenda";
import "./agenda.css";

const EVENT_TIME_ZONE = "America/Bogota";
const WEEK_DAYS = [
    { key: 1, label: "Lunes", shortLabel: "Lun" },
    { key: 2, label: "Martes", shortLabel: "Mar" },
    { key: 3, label: "Miércoles", shortLabel: "Mié" },
    { key: 4, label: "Jueves", shortLabel: "Jue" },
    { key: 5, label: "Viernes", shortLabel: "Vie" }
];

const TOPIC_COLORS = ["agenda-topic-blue", "agenda-topic-purple", "agenda-topic-teal", "agenda-topic-orange", "agenda-topic-pink"];

const asArray = (value) => Array.isArray(value) ? value : [];

const getEventDate = (item) => {
    const rawDate = item.date || item.start_date || item.start || item.datetime;
    if (!rawDate) return null;
    const date = parseISO(String(rawDate));
    return isValid(date) ? date : null;
};

const getDayKey = (item) => {
    const date = getEventDate(item);
    if (!date) return null;
    const day = Number(formatInTimeZone(date, EVENT_TIME_ZONE, "i"));
    return day >= 1 && day <= 5 ? day : null;
};

const getTime = (item) => {
    const date = getEventDate(item);
    return date ? formatInTimeZone(date, EVENT_TIME_ZONE, "HH:mm") : (item.start_time || item.time || "--:--");
};

const getAuthors = (item) => {
    const authors = item.authors || item.participants || [];
    if (Array.isArray(authors)) {
        return authors.map((author) => typeof author === "string" ? author : author.name || author.full_name || author.email).filter(Boolean);
    }
    return authors ? [String(authors)] : [];
};

const getPeriod = (time) => {
    const hour = Number.parseInt(String(time).split(":")[0], 10);
    return Number.isNaN(hour) ? "" : hour >= 12 ? "PM" : "AM";
};

const normalizeAgenda = (payload) => {
    const items = Array.isArray(payload) ? payload : payload?.results || payload?.data || payload?.agenda || [];
    return asArray(items).map((item, index) => {
        const topic = item.topic || item.thematic_line || item.theme || "Sin línea temática";
        return {
            ...item,
            id: item.id ?? `agenda-${index}`,
            title: item.title || item.article_title || item.name || "Ponencia sin título",
            topic,
            authors: getAuthors(item),
            contacts: asArray(item.authors || item.participants)
                .map((author) => typeof author === "object" ? author.email || author.contact_email : null)
                .filter(Boolean),
            summary: item.summary || item.abstract || "Este artículo no tiene resumen disponible.",
            location: item.location || item.room || item.place || "Lugar por confirmar",
            link: item.link || item.meeting_url || item.presentation_url || "",
            day: getDayKey(item),
            time: getTime(item)
        };
    }).filter((item) => item.day).map((item) => ({ ...item, period: getPeriod(item.time) }));
};

const getErrorMessage = (error) => error?.message || "No fue posible cargar la agenda. Intenta de nuevo.";

const AgendaSkeleton = () => (
    <div className="agenda-skeleton" aria-busy="true" aria-label="Cargando agenda">
        {Array.from({ length: 4 }).map((_, index) => (
            <div className="agenda-skeleton-card placeholder-glow" key={index}>
                <span className="placeholder col-3"></span>
                <span className="placeholder col-8"></span>
                <span className="placeholder col-5"></span>
            </div>
        ))}
    </div>
);

const AgendaScreen = () => {
    const [items, setItems] = useState([]);
    const [selectedDay, setSelectedDay] = useState(1);
    const [topicFilter, setTopicFilter] = useState("");
    const [selectedTalk, setSelectedTalk] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAgenda = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setItems(normalizeAgenda(await getAgenda()));
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        getAgenda()
            .then((payload) => {
                if (!cancelled) setItems(normalizeAgenda(payload));
            })
            .catch((requestError) => {
                if (!cancelled) setError(getErrorMessage(requestError));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const topics = useMemo(() => [...new Set(items.map((item) => item.topic))].sort(), [items]);
    const filteredItems = useMemo(() => items
        .filter((item) => item.day === selectedDay && (!topicFilter || item.topic === topicFilter))
        .sort((a, b) => a.time.localeCompare(b.time)), [items, selectedDay, topicFilter]);
    const selectedDayLabel = WEEK_DAYS.find((day) => day.key === selectedDay)?.label;

    return (
        <div className="container-fluid p-3 p-md-4 agenda-page">
            <div className="agenda-heading">
                <div>
                    <span className="agenda-eyebrow">PANTALLA P-14 · AGENDA GENERAL</span>
                    <h1 className="h2 fw-bold mb-1">Agenda de ponencias</h1>
                    <p className="text-secondary mb-0">Consulta el cronograma del evento, sus salas y autores participantes.</p>
                </div>
                <div className="agenda-timezone"><i className="bi bi-globe2 me-2" aria-hidden="true"></i>América/Bogotá</div>
            </div>

            <div className="agenda-toolbar card border-0 shadow-sm">
                <div className="agenda-day-selector" role="tablist" aria-label="Seleccionar día">
                    {WEEK_DAYS.map((day) => (
                        <button
                            type="button"
                            role="tab"
                            aria-selected={selectedDay === day.key}
                            className={`agenda-day-button ${selectedDay === day.key ? "active" : ""}`}
                            key={day.key}
                            onClick={() => setSelectedDay(day.key)}
                        >
                            <span className="d-none d-sm-inline">{day.label}</span>
                            <span className="d-sm-none">{day.shortLabel}</span>
                        </button>
                    ))}
                </div>
                <label className="agenda-topic-filter">
                    <span className="visually-hidden">Filtrar por línea temática</span>
                    <i className="bi bi-funnel me-2 text-secondary" aria-hidden="true"></i>
                    <select className="form-select border-0 p-0 shadow-none" value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}>
                        <option value="">Todas las líneas temáticas</option>
                        {topics.map((topic) => <option value={topic} key={topic}>{topic}</option>)}
                    </select>
                </label>
            </div>

            <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                <h2 className="h5 fw-bold mb-0">{selectedDayLabel}</h2>
                {!loading && !error && <span className="small text-secondary">{filteredItems.length} {filteredItems.length === 1 ? "ponencia" : "ponencias"}</span>}
            </div>

            {loading && <AgendaSkeleton />}
            {!loading && error && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center gap-3" role="alert">
                    <span><i className="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>{error}</span>
                    <button className="btn btn-sm btn-outline-danger text-nowrap" type="button" onClick={() => void loadAgenda()}>Reintentar</button>
                </div>
            )}
            {!loading && !error && filteredItems.length === 0 && (
                <div className="agenda-empty card border-0 shadow-sm">
                    <i className="bi bi-calendar2-x" aria-hidden="true"></i>
                    <h3 className="h5 mt-3">No hay ponencias para este filtro</h3>
                    <p className="text-secondary mb-0">Prueba con otro día o línea temática.</p>
                </div>
            )}
            {!loading && !error && filteredItems.length > 0 && (
                <div className="agenda-list">
                    {filteredItems.map((talk, index) => (
                        <button type="button" className="agenda-talk card border-0 shadow-sm text-start" key={talk.id} onClick={() => setSelectedTalk(talk)}>
                            <div className="agenda-talk-time">{talk.time}<span>{talk.period}</span></div>
                            <div className="agenda-talk-marker" aria-hidden="true"></div>
                            <div className="agenda-talk-content">
                                <span className={`agenda-topic ${TOPIC_COLORS[index % TOPIC_COLORS.length]}`}>{talk.topic}</span>
                                <h3 className="h5 fw-bold mt-2 mb-2">{talk.title}</h3>
                                <div className="agenda-talk-meta">
                                    <span><i className="bi bi-people me-1" aria-hidden="true"></i>{talk.authors.length ? talk.authors.join(", ") : "Autores por confirmar"}</span>
                                    <span><i className="bi bi-geo-alt me-1" aria-hidden="true"></i>{talk.location}</span>
                                </div>
                            </div>
                            <i className="bi bi-chevron-right agenda-talk-chevron" aria-hidden="true"></i>
                        </button>
                    ))}
                </div>
            )}

            <Modal show={Boolean(selectedTalk)} onClose={() => setSelectedTalk(null)} title={selectedTalk?.title} size="lg" scrollable>
                {selectedTalk && (
                    <div className="agenda-detail">
                        <span className="agenda-topic agenda-topic-blue">{selectedTalk.topic}</span>
                        <div className="row g-3 mt-2 mb-3">
                            <div className="col-sm-6"><strong><i className="bi bi-clock me-2 text-primary" aria-hidden="true"></i>Horario</strong><p className="mb-0 text-secondary">{selectedDayLabel}, {selectedTalk.time} · América/Bogotá</p></div>
                            <div className="col-sm-6"><strong><i className="bi bi-geo-alt me-2 text-primary" aria-hidden="true"></i>Lugar o enlace</strong><p className="mb-0 text-secondary">{selectedTalk.link ? <a href={selectedTalk.link} target="_blank" rel="noreferrer">{selectedTalk.location}</a> : selectedTalk.location}</p></div>
                        </div>
                        <h4 className="h6 text-uppercase text-secondary">Resumen</h4>
                        <p>{selectedTalk.summary}</p>
                        <h4 className="h6 text-uppercase text-secondary mt-4">Autores y contacto</h4>
                        {selectedTalk.authors.length ? <ul className="mb-0">{selectedTalk.authors.map((author) => <li key={author}>{author}</li>)}</ul> : <p className="text-secondary mb-0">Los datos de los autores aún no están disponibles.</p>}
                        {selectedTalk.contacts.length > 0 && <p className="mb-0 mt-2"><i className="bi bi-envelope me-2 text-primary" aria-hidden="true"></i>{selectedTalk.contacts.join(", ")}</p>}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AgendaScreen;
