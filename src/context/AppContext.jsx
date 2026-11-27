import { createContext, useMemo, useState } from "react";

const AppContext = createContext();

const parseStoredProfiles = () => {
    try {
        const raw = localStorage.getItem('profiles');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const AppContextProvider = ({ children }) => {
    const [app, setApp] = useState({
        token: localStorage.getItem('token'),
        profile: Number.parseInt(localStorage.getItem('profile')),
        profiles: parseStoredProfiles(),
        name: localStorage.getItem('name'),
        email: localStorage.getItem('email'),
        user_uuid: localStorage.getItem('user_uuid'),
        image: localStorage.getItem('photo'),
        auth: localStorage.getItem('auth'),
        formatHour: 24,
        timezone: "America/Bogota"
    });

    const returnFunctions = useMemo(() => ({
        app,
        setApp
    }), [app]);

    return (
        <AppContext.Provider value={returnFunctions}>
            {children}
        </AppContext.Provider>
    );
};

export {AppContextProvider, AppContext}