import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { getEvent } from "../../api/events";
import {
    getEventRequestError,
    getEventSchedule,
    getScheduleDate,
    getScheduleLocation,
    getScheduleTime,
    getScheduleTitle,
    getScheduleTopics,
    normalizeEventDetail
} from "./agendaUtils";
import { canManageEvents } from "../../utils/userAccess";
import { translateTopic } from "../../utils/topicLabel";
import "./agenda.css";

const formatDate = (value, locale) => {
    if (!value) return "";
    const datePart = String(value).slice(0, 10);
    const date = new Date(`${datePart}T12:00:00`);
    return Number.isNaN(date.getTime())
        ? String(value)
        : new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "America/Bogota" }).format(date);
};

const EventDetailScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { me } = useOutletContext() || {};
    const canManage = canManageEvents(me);
    const [result, setResult] = useState({ id: null, event: null, error: "" });

    useEffect(() => {
        let active = true;
        getEvent(id)
            .then((payload) => {
                if (!active) return;
                setResult({ id, event: normalizeEventDetail(payload, id), error: "" });
            })
            .catch((requestError) => {
                if (active) setResult({
                    id,
                    event: null,
                    error: getEventRequestError(requestError, t("eventDetail.alerts.loadError"))
                });
            });
        return () => { active = false; };
    }, [id, t]);

    const dateLocale = i18n.language?.startsWith("en") ? "en-US" : "es-CO";
    const loading = result.id !== id;
    const event = loading ? null : result.event;
    const error = loading ? "" : result.error;

    if (loading) {
        return (
            <main className="container-fluid p-3 p-md-4 agenda-page">
                <div className="text-center py-5" aria-busy="true">
                    <span className="spinner-border text-primary" role="status"></span>
                    <p className="text-secondary mt-3">{t("eventDetail.loading")}</p>
                </div>
            </main>
        );
    }

    if (error || !event) {
        return (
            <main className="container-fluid p-3 p-md-4 agenda-page">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/agenda")}>
                        <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>{t("eventDetail.backToEvents")}
                    </button>
                    {canManage && (
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/event/${encodeURIComponent(id)}/edit`)}
                        >
                            <i className="bi bi-pencil me-2" aria-hidden="true"></i>{t("eventDetail.editEvent")}
                        </button>
                    )}
                </div>
                <div className={`alert ${error ? "alert-danger" : "alert-warning"}`} role="alert">
                    {error || t("eventDetail.alerts.notFound")}
                </div>
            </main>
        );
    }

    const schedule = getEventSchedule(event);
    const scheduleByDay = schedule.reduce((groups, item) => {
        const date = getScheduleDate(item, event.event_date);
        const day = date ? String(date).slice(0, 10) : "";
        if (!groups[day]) groups[day] = [];
        groups[day].push(item);
        return groups;
    }, {});
    const scheduleDays = Object.entries(scheduleByDay).sort(([first], [second]) => first.localeCompare(second));

    return (
        <main className="container-fluid p-3 p-md-4 agenda-page">
            <button type="button" className="btn btn-outline-secondary mb-3" onClick={() => navigate("/agenda")}>
                <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>{t("eventDetail.backToEvents")}
            </button>

            <header className="agenda-heading">
                <div>
                    <span className="agenda-eyebrow">{t("eventDetail.eyebrow")}</span>
                    <h1 className="h2 fw-bold mb-2">{event.title}</h1>
                    {event.description && <p className="text-secondary mb-0">{event.description}</p>}
                </div>
                {event.location && <div className="agenda-timezone"><i className="bi bi-geo-alt me-2" aria-hidden="true"></i>{event.location}</div>}
            </header>

            <section className="card border-0 shadow-sm agenda-detail-card mb-4" aria-labelledby="event-topics-heading">
                <div className="card-body">
                    <h2 id="event-topics-heading" className="h5 fw-bold">
                        <i className="bi bi-tags text-primary me-2" aria-hidden="true"></i>{t("eventDetail.topics.title")}
                    </h2>
                    {event.topics.length > 0 ? (
                        <div className="agenda-event-topics">
                            {event.topics.map((topic, index) => <span className="agenda-topic" key={`${topic}-${index}`}>{translateTopic(t, topic)}</span>)}
                        </div>
                    ) : (
                        <p className="text-secondary mb-0">{t("eventDetail.topics.empty")}</p>
                    )}
                </div>
            </section>

            <section aria-labelledby="event-schedule-heading">
                <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                    <h2 id="event-schedule-heading" className="h5 fw-bold mb-0">
                        <i className="bi bi-calendar3 text-primary me-2" aria-hidden="true"></i>{t("eventDetail.schedule.title")}
                    </h2>
                    <span className="small text-secondary">
                        {t("eventDetail.schedule.activityCount", { count: schedule.length })}
                    </span>
                </div>
                {schedule.length > 0 ? (
                    scheduleDays.map(([day, daySchedule]) => (
                        <section className="mb-4" key={day || "unscheduled"}>
                            <h3 className="h6 text-secondary mb-2">
                                {day ? formatDate(day, dateLocale) : t("eventDetail.schedule.dayTbd")}
                            </h3>
                            <div className="agenda-list">
                                {daySchedule.map((item, index) => {
                                    const topics = getScheduleTopics(item);
                                    const time = getScheduleTime(item);
                                    const location = getScheduleLocation(item);
                                    const link = item.link || item.meeting_url || item.presentation_url || "";
                                    return (
                                        <article className="agenda-schedule-item card border-0 shadow-sm" key={item.schedule_id ?? item.id ?? `${getScheduleTitle(item)}-${index}`}>
                                            <div className="agenda-schedule-time">
                                                {time && <strong>{time}</strong>}
                                                {!time && <span className="text-secondary">{t("eventDetail.schedule.timeTbd")}</span>}
                                            </div>
                                            <div className="agenda-schedule-content">
                                                <h4 className="h6 fw-bold mb-2">{getScheduleTitle(item)}</h4>
                                                {topics.length > 0 && (
                                                    <div className="agenda-event-topics mb-2">
                                                        {topics.map((topic, topicIndex) => <span className="agenda-topic" key={`${topic}-${topicIndex}`}>{translateTopic(t, topic)}</span>)}
                                                    </div>
                                                )}
                                                {location && (
                                                    <p className="small text-secondary mb-0">
                                                        <i className="bi bi-geo-alt me-1" aria-hidden="true"></i>
                                                        {link ? <a href={link} target="_blank" rel="noreferrer">{location}</a> : location}
                                                    </p>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="agenda-empty card border-0 shadow-sm">
                        <i className="bi bi-calendar2-x" aria-hidden="true"></i>
                        <h3 className="h6 mt-3">{t("eventDetail.schedule.emptyTitle")}</h3>
                        <p className="text-secondary mb-0">{t("eventDetail.schedule.emptyDescription")}</p>
                    </div>
                )}
            </section>
        </main>
    );
};

export default EventDetailScreen;