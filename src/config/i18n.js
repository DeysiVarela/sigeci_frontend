import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import enGlobal from "../translate/en/global.json";
import esGlobal from "../translate/es/global.json";

const initialLanguage = localStorage.getItem("language") || "es";

i18next
    .use(initReactI18next)
    .init({
        interpolation: { escapeValue: false },
        lng: initialLanguage,
        fallbackLng: "es",
        ns: ["global"],
        defaultNS: "global",
        resources: {
            en: { global: enGlobal },
            es: { global: esGlobal }
        },
    });

export default i18next;
