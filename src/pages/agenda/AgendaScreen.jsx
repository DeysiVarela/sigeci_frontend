import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import { getEvents } from "../../api/events";
import { formatEventDate, getEventRequestError, normalizeEvents } from "./agendaUtils";
import { canManageEvents } from "../../utils/userAccess";
import "./agenda.css";

const AgendaScreen = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
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
            setError(getEventRequestError(requestError, t("agendaScreen.alerts.loadError")));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        let active = true;
        getEvents()
            .then((payload) => {
                if (active) setEvents(normalizeEvents(payload));
            })
            .catch((requestError) => {
                if (active) setError(getEventRequestError(requestError, t("agendaScreen.alerts.loadError")));
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [t]);

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
                    <span className="agenda-eyebrow">{t("agendaScreen.eyebrow")}</span>
                    <h1 className="h2 fw-bold mb-1">{t("agendaScreen.title")}</h1>
                    <p className="text-secondary mb-0">{t("agendaScreen.subtitle")}</p>
                </div>
                <div className="agenda-heading-actions">
                    <div className="agenda-timezone">
                        <i className="bi bi-globe2 me-2" aria-hidden="true"></i>{t("agendaScreen.timezone")}
                    </div>
                    {canManage && (
                        <button className="btn btn-primary" type="button" onClick={() => navigate("/event/new")}>
                            <i className="bi bi-plus-lg me-2" aria-hidden="true"></i>{t("agendaScreen.createEvent")}
                        </button>
                    )}
                </div>
            </header>

            <label className="agenda-search">
                <i className="bi bi-search text-secondary" aria-hidden="true"></i>
                <span className="visually-hidden">{t("agendaScreen.searchLabel")}</span>
                <input
                    className="form-control border-0 shadow-none"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("agendaScreen.searchPlaceholder")}
                />
            </label>

            <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                <h2 className="h5 fw-bold mb-0">{t("agendaScreen.scheduleTitle")}</h2>
                {!loading && !error && (
                    <span className="small text-secondary">
                        {t("agendaScreen.eventCount", { count: filteredEvents.length })}
                    </span>
                )}
            </div>

            {loading && (
                <div className="agenda-skeleton" aria-busy="true" aria-label={t("agendaScreen.loadingAria")}>
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
                    <button className="btn btn-sm btn-outline-danger text-nowrap" type="button" onClick={() => void loadEvents()}>
                        {t("agendaScreen.retry")}
                    </button>
                </div>
            )}
            {!loading && !error && filteredEvents.length === 0 && (
                <div className="agenda-empty card border-0 shadow-sm">
                    <i className="bi bi-calendar2-x" aria-hidden="true"></i>
                    <h3 className="h5 mt-3">
                        {events.length ? t("agendaScreen.emptySearchTitle") : t("agendaScreen.emptyPublishedTitle")}
                    </h3>
                    <p className="text-secondary mb-0">
                        {events.length ? t("agendaScreen.emptySearchDescription") : t("agendaScreen.emptyPublishedDescription")}
                    </p>
                </div>
            )}
            {!loading && !error && filteredEvents.length > 0 && (
                <div className="table-responsive card border-0 shadow-sm">
                    <table className="table table-hover align-middle mb-0 agenda-table">
                        <thead>
                            <tr>
                                <th scope="col">{t("agendaScreen.table.event")}</th>
                                <th scope="col">{t("agendaScreen.table.date")}</th>
                                <th scope="col">{t("agendaScreen.table.location")}</th>
                                <th scope="col">{t("agendaScreen.table.topics")}</th>
                                <th scope="col"><span className="visually-hidden">{t("agendaScreen.table.actions")}</span></th>
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
                                    <td>{event.topics.length > 0 ? event.topics.join(", ") : t("agendaScreen.table.viewDetailFallback")}</td>
                                    <td className="text-end">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary text-nowrap"
                                            onClick={() => navigate(`/event/${encodeURIComponent(event.id)}`)}
                                            aria-label={t("agendaScreen.table.viewDetailAria", { title: event.title })}
                                        >
                                            {t("agendaScreen.table.viewDetail")}
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