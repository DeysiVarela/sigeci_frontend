import { useTranslation } from "react-i18next";

const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
];

// Selector de idioma reutilizable (Header y pantallas de autenticación).
// El idioma queda en localStorage["language"], que config/i18n.js lee al iniciar.
const LanguageSelector = ({ toggleClassName = "nav-link" }) => {
    const { i18n } = useTranslation();
    const current = i18n.language?.startsWith("en") ? "en" : "es";

    const changeLanguage = (code) => {
        localStorage.setItem("language", code);
        i18n.changeLanguage(code);
    };

    return (
        <div className="dropdown">
            <a href="#" className={toggleClassName} data-bs-toggle="dropdown" aria-expanded="false" aria-label="Change language">
                <i className="bi bi-translate" aria-hidden="true"></i>
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
                {LANGUAGES.map(({ code, label }) => (
                    <li key={code}>
                        <button type="button" className={`dropdown-item ${current === code ? "active" : ""}`} onClick={() => changeLanguage(code)}>
                            {label} {current === code && <i className="bi bi-check-lg ms-2" aria-hidden="true"></i>}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LanguageSelector;