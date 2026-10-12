const Card = ({
    title,
    tools,
    footer,
    children,
    outline = false,
    outlineColor = "primary",
    className = "",
    headerClassName = "",
    bodyClassName = "",
    footerClassName = ""
}) => {
    const outlineClass = outline ? `card-${outlineColor} card-outline` : "";

    return (
        <div className={`card mb-4 ${outlineClass} ${className}`}>
            {(title || tools) && (
                <div className={`card-header ${headerClassName}`}>
                    {title && <h3 className="card-title">{title}</h3>}
                    {tools && <div className="card-tools">{tools}</div>}
                </div>
            )}
            <div className={`card-body ${bodyClassName}`}>
                {children}
            </div>
            {footer && (
                <div className={`card-footer ${footerClassName}`}>
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
