import { ROLES, normalizeRole } from "../pages/article/utils/constants";

export const hasPermission = (me, resource, action) =>
    Boolean(me?.permissions?.[resource]?.includes(action));

export const hasAdminProfile = (user) =>
    (user?.profiles ?? []).some((p) => normalizeRole(p?.name ?? p) === ROLES.ADMIN);

const isProtectedAdmin = (me, target) =>
    hasAdminProfile(target) && !hasAdminProfile(me);

export const canViewUsers = (me) => hasPermission(me, "user", "view");

export const isManager = (me) => hasPermission(me, "user", "create");

export const canEditUser = (me, userId, target) => {
    const isSelf = me?.id != null && me.id === Number(userId);
    if (isSelf) return true;
    return hasPermission(me, "user", "update") && !isProtectedAdmin(me, target);
};

export const canDeleteUser = (me, userId, target) =>
    hasPermission(me, "user", "delete") &&
    me?.id !== Number(userId) &&
    !isProtectedAdmin(me, target);