import { Outlet } from "react-router";
import { AppContextProvider } from "../../context/AppContext";
import { LoaderContextProvider } from "../../context/LoaderContext";
import Loader from "../../components/loaders/Loader";

const Container = () => {
    return (
        <AppContextProvider>
            <LoaderContextProvider>
                <Outlet/>
                <Loader/>
            </LoaderContextProvider>
        </AppContextProvider>
    );
};

export default Container;