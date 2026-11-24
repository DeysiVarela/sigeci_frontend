import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { getEvents } from "../../api/events";
import { formatEventDate, getEventRequestError, normalizeEvents } from "./agendaUtils";
import { canManageEvents } from "../../utils/userAccess";
import "./agenda.css";

const AgendaScreen = () => {
    const navigate = useNavigate();
    const { me } = useOutletContext() || {};
    const canManage = canManageEvents(me);
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadEvents = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setEvents(normalizeEvents(await getEvents()));
        } catch (requestError) {
            setError(getEventRequestError(requestError, "No fue posible cargar los eventos. Intenta de nuevo."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        getEvents()
            .then((payload) => {
                if (active) setEvents(normalizeEvents(payload));
            })
            .catch((requestError) => {
                if (active) setError(getEventRequestError(requestError, "No fue posible cargar los eventos. Intenta de nuevo."));
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, []);

    const filteredEvents = useMemo(() => {
        const term = search.trim().toLocaleLowerCase();
        if (!term) return events;
        return events.filter((event) =>
            `${event.title} ${event.description} ${event.location} ${event.topics.join(" ")}`
                .toLocaleLowerCase()
                .includes(term)
        );
    }, [events, search]);

    return (
        <main className="container-fluid p-3 p-md-4 agenda-page">
            <header className="agenda-heading">
                <div>
                    <span className="agenda-eyebrow">PANTALLA P-14 · EVENTOS</span>
                    <h1 className="h2 fw-bold mb-1">Eventos de la conferencia</h1>
                    <p className="text-secondary mb-0">Consulta la programación y los tópicos de cada evento.</p>
                </div>
                <div className="agenda-heading-actions">
                    <div className="agenda-timezone"><i className="bi bi-globe2 me-2" aria-hidden="true"></i>América/Bogotá</div>
                    {canManage && (
                        <button className="btn btn-primary" type="button" onClick={() => navigate("/event/new")}>
                            <i className="bi bi-plus-lg me-2" aria-hidden="true"></i>Crear evento
                        </button>
                    )}
                </div>
            </header>

            <label className="agenda-search">
                <i className="bi bi-search text-secondary" aria-hidden="true"></i>
                <span className="visually-hidden">Buscar eventos</span>
                <input
                    className="form-control border-0 shadow-none"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por evento, tópico o lugar..."
                />
            </label>

            <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                <h2 className="h5 fw-bold mb-0">Programación</h2>
                {!loading && !error && <span className="small text-secondary">{filteredEvents.length} {filteredEvents.length === 1 ? "evento" : "eventos"}</span>}
            </div>

            {loading && (
                <div className="agenda-skeleton" aria-busy="true" aria-label="Cargando eventos">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div className="agenda-skeleton-card placeholder-glow" key={index}>
                            <span className="placeholder col-4"></span>
                            <span className="placeholder col-8"></span>
                            <span className="placeholder col-5"></span>
                        </div>
                    ))}
                </div>
            )}
            {!loading && error && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center gap-3" role="alert">
                    <span><i className="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>{error}</span>
                    <button className="btn btn-sm btn-outline-danger text-nowrap" type="button" onClick={() => void loadEvents()}>Reintentar</button>
                </div>
            )}
            {!loading && !error && filteredEvents.length === 0 && (
                <div className="agenda-empty card border-0 shadow-sm">
                    <i className="bi bi-calendar2-x" aria-hidden="true"></i>
                    <h3 className="h5 mt-3">{events.length ? "No hay eventos para esta búsqueda" : "Aún no hay eventos publicados"}</h3>
                    <p className="text-secondary mb-0">{events.length ? "Prueba con otro término." : "La programación estará disponible cuando se creen eventos."}</p>
                </div>
            )}
            {!loading && !error && filteredEvents.length > 0 && (
                <div className="table-responsive card border-0 shadow-sm">
                    <table className="table table-hover align-middle mb-0 agenda-table">
                        <thead>
                            <tr>
                                <th scope="col">Evento</th>
                                <th scope="col">Fecha</th>
                                <th scope="col">Lugar</th>
                                <th scope="col">Tópicos</th>
                                <th scope="col"><span className="visually-hidden">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.map((event) => (
                                <tr key={event.id}>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 fw-bold text-start"
                                            onClick={() => navigate(`/event/${encodeURIComponent(event.id)}`)}
                                        >
                                            {event.title}
                                        </button>
                                        {event.description && <div className="small text-secondary mt-1">{event.description}</div>}
                                    </td>
                                    <td>{formatEventDate(event.event_date)}</td>
                                    <td>{event.location || "—"}</td>
                                    <td>{event.topics.length > 0 ? event.topics.join(", ") : "Consultar detalle"}</td>
                                    <td className="text-end">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary text-nowrap"
                                            onClick={() => navigate(`/event/${encodeURIComponent(event.id)}`)}
                                            aria-label={`Ver detalle de ${event.title}`}
                                        >
                                            Ver detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
};

export default AgendaScreen;
