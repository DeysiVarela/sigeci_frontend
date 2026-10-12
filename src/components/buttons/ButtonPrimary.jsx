const ButtonPrimary = ({
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
            className={`btn btn-primary ${className}`}
        >
            {label || children}
        </button>
    );
};

export default ButtonPrimary;