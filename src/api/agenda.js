import { request } from "./http";

export const getAgenda = (params = {}) =>
    request("/api/agenda/", { params });
