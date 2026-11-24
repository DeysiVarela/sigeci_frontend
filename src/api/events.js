import { request } from "./http";

export const getEvents = () =>
    request("/event/");

export const getEvent = (eventId) =>
    request(`/event/${encodeURIComponent(eventId)}/`);

export const getTopics = () =>
    request("/topic/");

export const createEvent = (event) =>
    request("/events/", { method: "POST", body: event });

export const updateEvent = (eventId, event) =>
    request(`/events/${encodeURIComponent(eventId)}/`, { method: "PUT", body: event });
