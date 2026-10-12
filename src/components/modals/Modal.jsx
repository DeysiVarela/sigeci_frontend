import { useEffect } from "react";

const Modal = ({
    show,
    onClose,
    title,
    children,
    footer,
    size = "md", // sm, md, lg, xl
    centered = true,
    scrollable = false,
    backdrop = true
}) => {
    useEffect(() => {
        if (show) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        return () => {
            document.body.classList.remove("modal-open");
        };
    }, [show]);

    if (!show) return null;

    const sizeClass = size === "md" ? "" : `modal-${size}`;
    const centeredClass = centered ? "modal-dialog-centered" : "";
    const scrollableClass = scrollable ? "modal-dialog-scrollable" : "";

    return (
        <>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
                onClick={backdrop ? onClose : undefined}
                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1055 }}
            >
                <div
                    className={`modal-dialog ${sizeClass} ${centeredClass} ${scrollableClass}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content shadow-lg border-0">
                        {title && (
                            <div className="modal-header">
                                <h5 className="modal-title fs-5">{title}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={onClose}
                                ></button>
                            </div>
                        )}
                        <div className="modal-body">
                            {children}
                        </div>
                        {footer && (
                            <div className="modal-footer">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Modal;
