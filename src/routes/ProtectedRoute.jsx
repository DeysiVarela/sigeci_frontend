import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { getCurrentUser } from "../api/auth";

const ProtectedRoute = () => {
    const [state, setState] = useState("checking");
    const [me, setMe] = useState(null);

    useEffect(() => {
        let active = true;
        getCurrentUser()
            .then((user) => {
                if (!active) return;
                setMe(user);
                setState("authenticated");
            })
            .catch(() => { if (active) setState("anonymous"); });
        return () => { active = false; };
    }, []);

    if (state === "checking") {
        return <div className="p-4 text-center">Verificando sesión...</div>;
    }
    return state === "authenticated" ? <Outlet context={{ me }} /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
