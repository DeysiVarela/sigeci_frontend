// Roles que pueden crear, editar a cualquiera y eliminar usuarios
export const MANAGER_ROLES = ["ADMIN", "MEMBER"];

export const isManager = (me) => MANAGER_ROLES.includes(me?.profile_name);

// Un gestor edita a cualquiera; el resto solo se edita a sí mismo
export const canEditUser = (me, userId) =>
  isManager(me) || (me?.id != null && me.id === Number(userId));

// Eliminar: solo gestores, y nunca a uno mismo
export const canDeleteUser = (me, userId) =>
  isManager(me) && me.id !== Number(userId);