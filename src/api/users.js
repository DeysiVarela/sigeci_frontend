import { request } from "./http";

export const listUsers = ({ page = 1, pageSize = 10, profile, active } = {}) =>
    request("/api/users/", { params: { page, page_size: pageSize, profile, active } });

export const getUser = (id) => request(`/api/users/${id}/`);
export const createUser = (data) => request("/api/users/", { method: "POST", body: data });
export const updateUser = (id, data) => request(`/api/users/${id}/`, { method: "PATCH", body: data });
export const deleteUser = (id) => request(`/api/users/${id}/`, { method: "DELETE" });
export const listProfiles = () => request("/api/profiles/");
