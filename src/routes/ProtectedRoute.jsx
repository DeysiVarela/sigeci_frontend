import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { useFetch } from "../hooks/useFetch";
import { AppContext } from "../context/AppContext";

const ProtectedRoute = () => {
    const [state, setState] = useState("checking");
    const api = useFetch()

    const { app, setApp } = useContext(AppContext);

    useEffect(() => {
        let active = true;

        // try{
        //     const menu = await api.get("auth/me")
        //     if men

        // }catch(err){

        // }

        api.get("auth/me")
        .then(res =>{
            if(res.success){
                setApp({...app, permissions: res.data});
            }
        })
        .catch(err=>{
            console.log(err, "Error");
            setState("anonymous")
        })
        setState("authenticated");
        return () => { active = false; };
    }, []);

    if (state === "checking") {
        return <div className="p-4 text-center">Verificando sesión...</div>;
    }
    return state === "authenticated" ? <Outlet/> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
