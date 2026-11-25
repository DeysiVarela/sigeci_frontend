import HandlerApp from "../../utils/HandlerApp";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useFetch } from "../../hooks/useFetch";
import { AppContext } from "../../context/AppContext";
import { useContext, useEffect, useState } from "react";

const ArticleViewScreen = () => {
    const { id }        = useParams();
    const navigate      = useNavigate();
    const { t }         = useTranslation();
    const api           = useFetch();
    const handlerApp    = HandlerApp();

    const { app } = useContext(AppContext);

    useEffect(()=>{
        getArticleById();
    }, [ ])

    const getArticleById = async () => {
        handlerApp.setLoader(true);
        api.get(`article/${id}`)
        .then(res =>{
            console.log(res);
        })
        .catch(error=>{
            console.log(error);
        })
        .finally(()=>{
            handlerApp.setLoader(false);
        })
    }
    
    return (
        <>
            <div className="container">
                <h1>Artículo {id}</h1>
            </div>
            <div className="">Render articulo</div>
        </>
    )
}

export default ArticleViewScreen;