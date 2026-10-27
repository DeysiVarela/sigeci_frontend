import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { getCurrentUser } from "../services/authService";

const ProtectedRoute = () => {
    const [state, setState] = useState("checking");

    useEffect(() => {
        let active = true;
        getCurrentUser()
            .then(() => { if (active) setState("authenticated"); })
            .catch(() => { if (active) setState("anonymous"); });
        return () => { active = false; };
    }, []);

    if (state === "checking") {
        return <div className="p-4 text-center">Verificando sesión...</div>;
    }
    return state === "authenticated" ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
