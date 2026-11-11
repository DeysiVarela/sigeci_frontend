import { useState } from "react";

// Lee la sesión que guarda el login del proyecto en localStorage["user"]:
//   { id, name, lastname, email, profile, profile_name: "ADMIN" | "MEMBER" | "AUTHOR", permissions, ... }
const SESSION_KEY = "user";

const readSessionUser = () => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        return {
            id: session.id,
            name: [session.name, session.lastname].filter(Boolean).join(" "),
            email: session.email,
            role: session.profile_name, // se normaliza en utils/permissions.js
            permissions: session.permissions
        };
    } catch {
        return null; // sesión corrupta: se trata como sin sesión
    }
};

// La sesión se lee una sola vez al montar la pantalla (inicializador perezoso de useState)
export const useCurrentUser = () => {
    const [user] = useState(readSessionUser);
    return user;
};