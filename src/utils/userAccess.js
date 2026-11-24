import { ROLES, normalizeRole } from "../pages/article/utils/constants";

export const hasPermission = (me, resource, action) => {
    const permissions = me?.permissions;

    if (Array.isArray(permissions)) {
        return permissions.some((permission) => {
            if (typeof permission === "string") {
                return permission === `${resource}.${action}`;
            }
            const permissionResource = permission?.resource ?? permission?.profile_action_resource;
            const permissionAction = permission?.action ?? permission?.profile_action_action;
            const permissionPath = permission?.profile_action_action;
            return (
                (permissionResource === resource && permissionAction === action) ||
                (resource === "user" && action === "view" &&
                    typeof permissionPath === "string" && permissionPath.replace(/\/$/, "") === "/users")
            );
        });
    }

    return Boolean(permissions?.[resource]?.includes(action));
};

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