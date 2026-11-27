import HandlerApp from "../../utils/HandlerApp";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useFetch } from "../../hooks/useFetch";
import { AppContext } from "../../context/AppContext";
import { useContext, useEffect, useState } from "react";
import DataTable from "react-data-table-component";

const ArticleScreen = () => {
    const navigate      = useNavigate();
    const { t }         = useTranslation();
    const api           = useFetch();
    const handlerApp    = HandlerApp();

    const { app } = useContext(AppContext);
    
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        getArticles();
    }, []);

    const getArticles = async () => {
        handlerApp.setLoader(true);
        api.get("article")
        .then( res =>{
            if (res.success){
                setArticles(res.data);
            } else {
                setArticles([]);
            }
        }).catch(error =>{
            handlerApp.showError("003");
            setArticles([]);
        }).finally(() =>{
            handlerApp.setLoader(false);
        });
    };

    const handleDelete = async (articleId) => {
        const confirm = await SweetAlert.fire({
            title: t("articleScreen.titleModaldelete"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: t("yesDelete"),
            cancelButtonText: t("no")
        });

        if (!confirm.isConfirmed) return;

        handlerApp.setLoader(true);
        api.delete(`article/${articleId}`)
        .then( res =>{
            if (res.success){
                handlerApp.showSuccess(t("deleteSuccess"));
                getArticles();
            } else {
                handlerApp.showError(t("deleteError"));
            }
        }).catch(error =>{
            handlerApp.showError(error.message);
        }).finally(() =>{
            handlerApp.setLoader(false);
        });
    };

    const columns = [
        {
            name: "ID",
            selector: row => row.article_id,
            sortable: true,
            center: true,
            grow: 0.5,
            cell: row => `#${row.article_id}`
        },
        {
            name: t("articleScreen.table.title"),
            selector: row => row.article_subject,
            sortable: true,
            grow: 3,
            cell: row => (
                <div className="w-100 overflow-hidden py-1">
                    <Link
                        to={`/article/${row.article_id}`}
                        className="d-block text-primary text-truncate text-decoration-none"
                        title={row.article_subject}
                    >
                        {row.article_subject} - <span className="small text-muted">v{row.article_attached_version || "1.0"}</span>
                    </Link>
                    <small className="text-muted d-block text-truncate" title={row.article_description}>
                        {row.article_description}
                    </small>
                </div>
            )
        },
        {
            name: t("articleScreen.table.topic"),
            selector: row => row.topic_id,
            sortable: true,
            grow: 1.3,
            cell: row => (
                <span
                    className="badge bg-light text-dark border text-truncate d-inline-block mw-100"
                    title={t(row.topic_subject)}
                >
                    {t(row.topic_subject)}
                </span>
            )
        },
        {
            name: t("articleScreen.table.author"),
            selector: row => row.article_created_by,
            sortable: true,
            grow: 1.2,
            cell: row => (
                <span className="text-truncate d-block w-100" title={row.article_created_by_name || "—"}>
                    {row.article_created_by_name || "—"}
                </span>
            )
        },
        {
            name: t("articleScreen.table.date"),
            selector: row => row.article_date || row.article_created_at || "",
            sortable: true,
            grow: 1,
            cell: row => (
                <span className="small text-muted text-nowrap">
                    {row.article_date || (row.article_created_at ? row.article_created_at.split("T")[0] : "—")}
                </span>
            )
        },
        {
            name: t("articleScreen.table.actions"),
            ignoreRowClick: true,
            center: true,
            grow: 1.6,
            cell: row => (
                <div className="table-actions">
                    {
                        app?.permissions["article"]?.includes('view') &&
                        <button
                            type="button"
                            className="btn-table-action btn-table-view"
                            title={t("view")}
                            aria-label={t("view")}
                            onClick={() => navigate(`/article/${row.article_id}`)}
                        >
                            <i className="bi bi-eye"></i>
                        </button>
                    }
                    {
                        app?.permissions["article"]?.includes('update') &&
                        <button
                            type="button"
                            className="btn-table-action btn-table-edit"
                            title={t("edit")}
                            aria-label={t("edit")}
                            onClick={() => navigate(`/article/edit/${row.article_id}`)}
                        >
                            <i className="bi bi-pencil"></i>
                        </button>
                    }
                    {
                        app?.permissions["article"]?.includes('delete') &&
                        <button
                            type="button"
                            className="btn-table-action btn-table-delete"
                            title={t("delete")}
                            aria-label={t("delete")}
                            onClick={() => handleDelete(row.article_id)}
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    }
                </div>
            )
        }
    ];

    return (
        <div className="container-fluid p-4">
            {/* Cabecera de la sección */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom gap-3">
                <div>
                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
                        <i className="bi bi-file-earmark-text-fill text-primary"></i>
                        {t("articleScreen.title")}
                    </h2>
                    <p className="text-secondary mb-0">
                        {t("articleScreen.description")}
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary shadow-sm d-flex align-items-center gap-2"
                        onClick={() => navigate("/article/create")}
                    >
                        <i className="bi bi-plus-circle"></i>
                        <span>{t("articleScreen.newArticle")}</span>
                    </button>
                </div>
            </div>
            {/* Tabla */}
            <div className="border rounded">
                <DataTable
                    columns={columns}
                    data={articles}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 50, 100]}
                    responsive
                    highlightOnHover
                    paginationComponentOptions={{
                        rowsPerPageText: t("articleScreen.pagination.rowsPerPage"),
                        rangeSeparatorText: t("articleScreen.pagination.of")
                    }}
                    noDataComponent={
                        <div className="py-5 text-center text-muted">
                            <i className="bi bi-file-earmark-x fs-1 d-block mb-2 text-secondary opacity-50"></i>
                            <p className="mb-0">{t("articleScreen.empty")}</p>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default ArticleScreen;