export const hasPermission = (me, resource, action) =>
    Boolean(me?.permissions?.[resource]?.includes(action));

export const canViewUsers = (me) => hasPermission(me, "user", "view");

export const isManager = (me) => hasPermission(me, "user", "create");

export const canEditUser = (me, userId) =>
    hasPermission(me, "user", "update") ||
    (me?.id != null && me.id === Number(userId));

export const canDeleteUser = (me, userId) =>
    hasPermission(me, "user", "delete") && me?.id !== Number(userId);