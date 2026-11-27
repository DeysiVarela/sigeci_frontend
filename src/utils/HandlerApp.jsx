import { useContext } from "react";
import Swal from "sweetalert2";
import { LoaderContext } from "../context/LoaderContext";


const HandlerApp = ()=>{

    const {setLoader: setLoaderContext} = useContext(LoaderContext)

    const setLoader = (state) => {
        setLoaderContext(state)
    };

    const showError = (message = "Ocurrió un error inesperado.") => {
        return Swal.fire({
            text: message,
            icon: "error",
            confirmButtonText: "Aceptar"
        });
    };

    const showOk = (message = "Operación realizada exitosamente.") => {
        return Swal.fire({
            text: message,
            icon: "success",
            confirmButtonText: "Aceptar"
        });
    };

    return {
        setLoader,
        showError,
        showOk
    }
}

export default HandlerApp;