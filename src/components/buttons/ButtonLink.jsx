const ButtonLink = ({
    label,
    onClick,
    type = "button",
    className = "",
    disabled = false,
    children
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn btn-link p-0 text-decoration-none border-0 bg-transparent shadow-none ${className}`}
            style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        >
            {label || children}
        </button>
    );
};

export default ButtonLink;
