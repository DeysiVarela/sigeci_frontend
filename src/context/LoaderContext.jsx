import { createContext, useMemo, useState } from "react";

const LoaderContext = createContext();

const LoaderContextProvider = ({ children }) => {
    const [loader, setLoader] = useState(false);

    const returnFunctions = useMemo(()=> {
        return {
            loader,
            setLoader
        }
    }, [loader])
        
    return (
        <LoaderContext.Provider value={returnFunctions}>
            {children}
        </LoaderContext.Provider>
    );
};

export {LoaderContextProvider, LoaderContext};