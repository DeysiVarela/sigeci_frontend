import { useContext } from "react";
import { LoaderContext } from "../../context/LoaderContext";

const Loader = ({ message = "Cargando..." }) => {
    const { loader } = useContext(LoaderContext);

    if (!loader) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.65)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                backdropFilter: "blur(2px)"
            }}
        >
            <div
                className="spinner-border text-light mb-3"
                role="status"
                style={{ width: "3.5rem", height: "3.5rem" }}
            >
                <span className="visually-hidden">Loading...</span>
            </div>
            <span className="text-white fw-semibold fs-5 tracking-wide">
                {message}
            </span>
        </div>
    );
};

export default Loader;