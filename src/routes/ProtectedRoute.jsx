import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { useFetch } from "../hooks/useFetch";
import { AppContext } from "../context/AppContext";

const ProtectedRoute = () => {
    const [state, setState] = useState("checking");
    const api = useFetch()

    const { app, setApp } = useContext(AppContext);

    useEffect(() => {
        api.get("auth/me")
        .then(res =>{
            let permissions = {};
            res.data?.forEach(permission => {
                permissions[permission.profile_action_action] = permission.profile_action_permissions.split("|");
            });
            if(res.success){
                setApp((prev) => ({ ...prev, menu: res.data, permissions }));
            }
        })
        .catch(err=>{
            console.log(err, "Error");
            setState("anonymous")
        })
        setState("authenticated");
    }, [app.profile]);

    if (state === "checking") {
        return <div className="p-4 text-center">Verificando sesión...</div>;
    }
    return state === "authenticated" ? <Outlet/> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
