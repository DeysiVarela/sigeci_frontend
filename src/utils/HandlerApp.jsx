import { useContext } from "react";
import { LoaderContext } from "../context/LoaderContext";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";


const HandlerApp = ()=>{

    const {setLoader: setLoaderContext} = useContext(LoaderContext)
    const { t } = useTranslation();

    const setLoader = (state) => {
        setLoaderContext(state)
    };

    const showOk = async (message) => {
        await Swal.fire({
            icon: 'success',
            title: "",
            text: t(message) || "Respuesta exitosa!",
        })
    }

    const showError = async (message) => {
        await Swal.fire({
            icon: 'error',
            title: "",
            text: t(message) || "Error inesperado",
        })
    }

    return {
        setLoader,
        showOk,
        showError
    }
}

export default HandlerApp;