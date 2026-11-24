import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { createEvent, getEvent, getTopics, updateEvent } from "../../api/events";
import { canManageEvents } from "../../utils/userAccess";
import { getEventRequestError } from "./agendaUtils";
import "./agenda.css";

const EMPTY_EVENT = {
    event_name: "",
    event_description: "",
    event_address: "",
    event_date: "",
};

const toDateTimeInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
};

const getApiError = (error) => {
    const fieldErrors = error?.data?.errors;
    if (fieldErrors && typeof fieldErrors === "object") {
        const messages = Object.values(fieldErrors)
            .flatMap((value) => Array.isArray(value) ? value : [value])
            .filter((value) => typeof value === "string");
        if (messages.length) return messages.join(" ");
    }
    return getEventRequestError(error, "No fue posible guardar el evento. Intenta de nuevo.");
};

const EventFormScreen = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { me } = useOutletContext() || {};
    const canManage = canManageEvents(me);
    const [form, setForm] = useState(EMPTY_EVENT);
    const [topics, setTopics] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [error, setError] = useState("");
    const nextRowId = useRef(0);

    useEffect(() => {
        let active = true;
        if (!canManage) return;

        const loadFormData = async () => {
            try {
                const [topicsPayload, eventPayload] = await Promise.all([
                    getTopics(),
                    isEdit ? getEvent(id) : Promise.resolve(null),
                ]);
                if (!active) return;

                const topicItems = Array.isArray(topicsPayload?.data)
                    ? topicsPayload.data
                    : Array.isArray(topicsPayload) ? topicsPayload : [];
                setTopics(topicItems);

                if (isEdit) {
                    const event = eventPayload?.data ?? eventPayload;
                    setForm({
                        event_name: event.event_name || "",
                        event_description: event.event_description || "",
                        event_address: event.event_address || "",
                        event_date: toDateTimeInput(event.event_date),
                    });
                    setSchedule((event.schedule || []).map((item) => ({
                        rowId: nextRowId.current++,
                        schedule_id: item.schedule_id,
                        topic_id: String(item.topic_id ?? item.topic?.topic_id ?? ""),
                        schedule_hour: String(item.schedule_hour || "").slice(0, 5),
                    })));
                }
            } catch (requestError) {
                if (active) {
                    setLoadError(getEventRequestError(
                        requestError,
                        "No fue posible cargar los datos del evento."
                    ));
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadFormData();
        return () => { active = false; };
    }, [canManage, id, isEdit]);

    const updateFormField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const updateScheduleField = (rowId, field, value) => {
        setSchedule((current) => current.map((item) =>
            item.rowId === rowId ? { ...item, [field]: value } : item
        ));
    };

    const addScheduleItem = () => {
        setSchedule((current) => [
            ...current,
            { rowId: nextRowId.current++, topic_id: "", schedule_hour: "" },
        ]);
    };

    const submit = async (event) => {
        event.preventDefault();
        setError("");

        if (schedule.some((item) => !item.topic_id || !item.schedule_hour)) {
            setError("Completa el tópico y la hora de cada actividad, o elimínala del cronograma.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                event_name: form.event_name.trim(),
                event_description: form.event_description.trim(),
                event_address: form.event_address.trim(),
                event_date: new Date(form.event_date).toISOString(),
                schedule: schedule.map(({ schedule_id, topic_id, schedule_hour }) => ({
                    ...(schedule_id ? { schedule_id } : {}),
                    topic_id: Number(topic_id),
                    schedule_hour,
                })),
            };
            const response = isEdit
                ? await updateEvent(id, payload)
                : await createEvent(payload);
            const savedEvent = response?.data ?? response;
            const eventId = savedEvent?.event_id ?? savedEvent?.id ?? id;
            navigate(`/event/${encodeURIComponent(eventId)}`, { replace: true });
        } catch (requestError) {
            setError(getApiError(requestError));
        } finally {
            setSaving(false);
        }
    };

    if (!canManage) {
        return (
            <main className="container-fluid p-3 p-md-4 agenda-page">
                <div className="alert alert-danger" role="alert">
                    Solo Admin y Comité pueden crear o actualizar eventos.
                </div>
                <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/agenda")}>
                    Volver a eventos
                </button>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="container-fluid p-3 p-md-4 agenda-page">
                <div className="text-center py-5" aria-busy="true">
                    <span className="spinner-border text-primary" role="status"></span>
                    <p className="text-secondary mt-3">Cargando formulario del evento...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="container-fluid p-3 p-md-4 agenda-page">
            <button className="btn btn-outline-secondary mb-3" type="button" onClick={() => navigate("/agenda")}>
                <i className="bi bi-arrow-left me-2" aria-hidden="true"></i>Volver a eventos
            </button>

            <header className="agenda-heading">
                <div>
                    <span className="agenda-eyebrow">GESTIÓN DE EVENTOS</span>
                    <h1 className="h2 fw-bold mb-1">{isEdit ? "Actualizar evento" : "Crear evento"}</h1>
                    <p className="text-secondary mb-0">Completa los datos y configura el cronograma por tópico.</p>
                </div>
            </header>

            {loadError && <div className="alert alert-danger" role="alert">{loadError}</div>}
            {!loadError && (
                <form className="card border-0 shadow-sm p-3 p-md-4" onSubmit={submit}>
                    <div className="row g-3">
                        <div className="col-md-8">
                            <label className="form-label" htmlFor="event_name">Nombre del evento</label>
                            <input
                                className="form-control"
                                id="event_name"
                                name="event_name"
                                value={form.event_name}
                                onChange={updateFormField}
                                maxLength={200}
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label" htmlFor="event_date">Fecha y hora</label>
                            <input
                                className="form-control"
                                id="event_date"
                                name="event_date"
                                type="datetime-local"
                                value={form.event_date}
                                onChange={updateFormField}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label" htmlFor="event_address">Lugar</label>
                            <input
                                className="form-control"
                                id="event_address"
                                name="event_address"
                                value={form.event_address}
                                onChange={updateFormField}
                                maxLength={255}
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label" htmlFor="event_description">Descripción</label>
                            <textarea
                                className="form-control"
                                id="event_description"
                                name="event_description"
                                rows={3}
                                value={form.event_description}
                                onChange={updateFormField}
                            />
                        </div>
                    </div>

                    <section className="mt-4" aria-labelledby="event-form-schedule">
                        <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                            <h2 className="h5 fw-bold mb-0" id="event-form-schedule">Cronograma y tópicos</h2>
                            <button className="btn btn-sm btn-outline-primary" type="button" onClick={addScheduleItem}>
                                <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>Añadir horario
                            </button>
                        </div>
                        {schedule.length === 0 && (
                            <p className="text-secondary">No hay horarios. Puedes añadir actividades al cronograma.</p>
                        )}
                        <div className="d-grid gap-2">
                            {schedule.map((item, index) => (
                                <div className="row g-2 align-items-end border rounded p-2" key={item.rowId}>
                                    <div className="col-md-7">
                                        <label className="form-label" htmlFor={`schedule-topic-${item.rowId}`}>
                                            Tópico {index + 1}
                                        </label>
                                        <select
                                            className="form-select"
                                            id={`schedule-topic-${item.rowId}`}
                                            value={item.topic_id}
                                            onChange={(event) => updateScheduleField(item.rowId, "topic_id", event.target.value)}
                                            required
                                        >
                                            <option value="">Selecciona un tópico</option>
                                            {topics.map((topic) => (
                                                <option key={topic.topic_id} value={topic.topic_id}>{topic.topic_subject}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label" htmlFor={`schedule-hour-${item.rowId}`}>Hora</label>
                                        <input
                                            className="form-control"
                                            id={`schedule-hour-${item.rowId}`}
                                            type="time"
                                            value={item.schedule_hour}
                                            onChange={(event) => updateScheduleField(item.rowId, "schedule_hour", event.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-2 d-grid">
                                        <button
                                            className="btn btn-outline-danger"
                                            type="button"
                                            onClick={() => setSchedule((current) => current.filter((entry) => entry.rowId !== item.rowId))}
                                            aria-label={`Eliminar horario ${index + 1}`}
                                        >
                                            <i className="bi bi-trash me-1" aria-hidden="true"></i>Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {error && <div className="alert alert-danger mt-3 mb-0" role="alert">{error}</div>}

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/agenda")} disabled={saving}>
                            Cancelar
                        </button>
                        <button className="btn btn-primary" type="submit" disabled={saving}>
                            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear evento"}
                        </button>
                    </div>
                </form>
            )}
        </main>
    );
};

export default EventFormScreen;
