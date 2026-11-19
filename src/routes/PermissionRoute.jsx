import { Navigate, Outlet, useOutletContext } from "react-router";

// Protege rutas según los permisos que declara el backend (ver utils/userAccess.js).
// Debe ir dentro de ProtectedRoute, que ya validó la sesión y entrega { me }.
// Si el usuario no cumple `allow(me)`, se le redirige (por defecto al dashboard).
// Es solo de interfaz: el backend sigue validando cada petición.
const PermissionRoute = ({ allow, redirectTo = "/home" }) => {
    const context = useOutletContext();
    const me = context?.me;

    if (!allow(me)) {
        return <Navigate to={redirectTo} replace />;
    }
    return <Outlet context={context} />;
};

export default PermissionRoute;