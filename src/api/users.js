import { request } from "./http";

export const listUsers = ({ page = 1, pageSize = 10, profile, active } = {}) =>
    request("/api/users/", { params: { page, page_size: pageSize, profile, active } });

export const getUser = (id) => request(`/api/users/${id}/`);
export const createUser = (data) => request("/api/users/", { method: "POST", body: data });
export const updateUser = (id, data) => request(`/api/users/${id}/`, { method: "PATCH", body: data });
export const deleteUser = (id) => request(`/api/users/${id}/`, { method: "DELETE" });
export const listProfiles = () => request("/api/profiles/");

export const getMe = async () => {
    const response = await request("/api/auth/me/");
    return response?.data?.user ?? response?.data ?? response?.user ?? response;
};

export const getMyProfile = () => request("/api/users/me");
export const updateMyProfile = ({ name, lastname, email }) =>
    request("/api/users/me", { method: "PATCH", body: { name, lastname, email } });
export const changeMyPassword = ({ currentPassword, newPassword }) =>
    request("/api/users/me/password/", { method: "PUT", body: { currentPassword, newPassword } });

// SCRUM-129: desactiva MI cuenta (borrado lógico). Pide la contraseña actual.
// El backend exige sesión + permiso de matriz "me:delete" (403 si el rol no lo tiene) + contraseña (400 si falla).
export const deleteMyAccount = ({ password }) =>
    request("/api/users/me/delete/", { method: "POST", body: { password } });
