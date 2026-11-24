import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { getMe } from "../api/users";
import { AppContext } from "../context/AppContext";

const ProtectedRoute = () => {
    const [state, setState] = useState("checking");
    const { setApp } = useContext(AppContext);
    const [me, setMe] = useState(null);

    useEffect(() => {
        let active = true;

        getMe()
            .then((res) => {
                if (!active) return;
                const currentUser = res?.data?.user ?? res?.data ?? res?.user ?? res;
                let storedPermissions = null;
                try {
                    storedPermissions = JSON.parse(localStorage.getItem("permissions") || "null");
                } catch {
                    storedPermissions = null;
                }
                let storedProfiles = [];
                try {
                    storedProfiles = JSON.parse(localStorage.getItem("profiles") || "[]");
                } catch {
                    storedProfiles = [];
                }
                const storedId = Number(localStorage.getItem("id"));
                const mergedUser = {
                    id: currentUser?.id ?? (Number.isNaN(storedId) ? undefined : storedId),
                    name: currentUser?.name ?? localStorage.getItem("name"),
                    lastname: currentUser?.lastname ?? localStorage.getItem("lastname"),
                    email: currentUser?.email ?? localStorage.getItem("email"),
                    profiles: currentUser?.profiles ?? storedProfiles,
                    permissions: currentUser?.permissions ?? (Array.isArray(currentUser) ? currentUser : storedPermissions)
                };
                setMe(mergedUser);
                setApp((previous) => ({
                    ...previous,
                    permissions: mergedUser.permissions ?? previous.permissions
                }));
                setState("authenticated");
            })
            .catch(() => {
                if (active) setState("anonymous");
            });

        return () => { active = false; };
    }, [setApp]);

    if (state === "checking") {
        return <div className="p-4 text-center">Verificando sesión...</div>;
    }
    return state === "authenticated" ? <Outlet context={{ me }} /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
