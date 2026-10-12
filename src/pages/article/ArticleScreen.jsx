import { useNavigate } from "react-router";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";


const ArticleScreen = ()=>{
    const navigate = useNavigate();

    const id1 = 1;
    const id2 = 2;
    return (
        <>
            <h1>Article #1</h1>
            <ButtonPrimary label="navegar a view" onClick={()=> navigate(`/article/${id1}`)}/>
            <h1>Article #2</h1>
            <ButtonPrimary label="navegar a view" onClick={()=> navigate(`/article/${id2}`)}/>
        </>
    )
}   

export default ArticleScreen;