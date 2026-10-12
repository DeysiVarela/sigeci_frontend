const Badge = ({
    text,
    type = "primary",
    pill = false,
    className = "",
    children
}) => {
    // Normalizar a minúsculas para aceptar Primary, Secondary, Success, etc.
    const normalizedType = (type || "primary").toLowerCase();

    // Mapeo según la convención de Bootstrap 5 / AdminLTE
    const bgClass = `text-bg-${normalizedType}`;
    const pillClass = pill ? "rounded-pill" : "";

    return (
        <span className={`badge ${bgClass} ${pillClass} ${className}`}>
            {text || children}
        </span>
    );
};

export default Badge;
