// Reglas de acceso de la interfaz.
// Se basan en los permisos que el backend declara en /api/auth/me/ (campo "permissions"),
// no en nombres de rol escritos en el front. Así, cuando el SCRUM-22 cambie la matriz de
// permisos en el backend, la interfaz la sigue sin tocar el código.
// La interfaz solo oculta acciones: quien valida de verdad cada operación es el backend.

export const hasPermission = (me, resource, action) =>
    Boolean(me?.permissions?.[resource]?.includes(action));

// Puede gestionar usuarios: crear, y ver los campos de rol y estado al editar.
export const isManager = (me) => hasPermission(me, "user", "create");

// Editar: con permiso "update" sobre cualquier usuario, o siempre sobre la propia cuenta.
// Si el backend aún no permite la edición propia, responde 403 y la pantalla muestra su mensaje.
export const canEditUser = (me, userId) =>
    hasPermission(me, "user", "update") ||
    (me?.id != null && me.id === Number(userId));

// Eliminar: requiere permiso "delete" y nadie puede eliminar su propia cuenta.
export const canDeleteUser = (me, userId) =>
    hasPermission(me, "user", "delete") && me?.id !== Number(userId);