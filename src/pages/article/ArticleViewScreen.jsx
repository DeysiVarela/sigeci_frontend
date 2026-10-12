import { useParams } from "react-router";


const ArticleViewScreen = ()=>{
    const {id} = useParams();
    return (
        <>
            <h1>Article {id}</h1>
        </>
    )
}

export default ArticleViewScreen