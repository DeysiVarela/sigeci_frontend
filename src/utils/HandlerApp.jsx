import { useContext } from "react";
import { LoaderContext } from "../context/LoaderContext";


const HandlerApp = ()=>{

    const {setLoader: setLoaderContext} = useContext(LoaderContext)

    const setLoader = (state) => {
        setLoaderContext(state)
    };

    return {
        setLoader
    }
}

export default HandlerApp;