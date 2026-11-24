import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { getCurrentUser } from "../api/auth";
import { useFetch } from "../hooks/useFetch";
import { AppContext } from "../context/AppContext";

const ProtectedRoute = () => {
    const [state, setState] = useState("checking");
    const [me, setMe] = useState(null);


    const { app, setApp } = useContext(AppContext);



    const api = useFetch()

    useEffect(() => {
        let active = true;

        // try{
        //     const menu = await api.get("auth/me")
        //     if men

        // }catch(err){

        // }

        api.get("auth/me")
        .then(res =>{
            let permission = res.data;
            let permissionObject = {} 
            permission.map((item) => {
                permissionObject[item.profile_action_action] = item.profile_action_permissions.split("|")
            })
            if(res.success){
                setApp({...app, permissions: permission, permissionObject});
            }
        })
        .catch(err=>{
            console.log(err, "Error");
        })
        // getCurrentUser()
        //     .then((user) => {
        //         if (!active) return;
        //         setMe(user);
        //         setState("authenticated");
        //     })
        //     .catch(() => { if (active) setState("anonymous"); });
        // return () => { active = false; };
        setState("authenticated");
        return () => { active = false; };
    }, []);

    if (state === "checking") {
        return <div className="p-4 text-center">Verificando sesión...</div>;
    }
    return state === "authenticated" ? <Outlet context={{ me }} /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
