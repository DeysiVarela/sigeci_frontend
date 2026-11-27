import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Card from "../../components/cards/Card";
import Badge from "../../components/badges/Badge";
import HandlerApp from "../../utils/HandlerApp";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import { useFetch } from "../../hooks/useFetch";
import { AppContext } from "../../context/AppContext";

const UserViewScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = useFetch();
    const handlerApp = HandlerApp();
    const { app } = useContext(AppContext);

    const [user, setUser] = useState();
    const currentUserId = Number(localStorage.getItem("id") || 0);

    useEffect(() => {
        handlerApp.setLoader(true);
        api.get(`users/${id}/`)
            .then((res) => {
                if (res.success) {
                    setUser(res.data);
                } else {
                    setUser(null);
                    handlerApp.showError(res.message);
                }
            })
            .catch((err) => {
                setUser(null);
                handlerApp.showError(err.message);
            })
            .finally(() => {
                handlerApp.setLoader(false);
            });
    }, [id]);

    if (user === null) {
        return (
            <div className="container-fluid p-3 p-md-4">
                <div className="alert alert-warning shadow-sm d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3" role="alert">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                        <span>No se encontró ningún usuario con el identificador <strong>#{id}</strong>.</span>
                    </div>
                    <ButtonSecondary label="Volver al Listado" onClick={() => navigate("/users")} />
                </div>
            </div>
        );
    }

    return (
        user && (
            <div className="container-fluid p-3 p-md-4">
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 pb-3 border-bottom gap-3">
                    <div className="d-flex align-items-center gap-3 w-100 w-md-auto">
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: "38px", height: "38px" }}
                            onClick={() => navigate("/users")}
                            title="Volver"
                        >
                            <i className="bi bi-arrow-left fs-5"></i>
                        </button>
                        <div className="text-truncate">
                            <h3 className="fw-bold mb-0 text-dark text-truncate">
                                {`${user.user_name} ${user.user_lastname}`.trim()} - #{user.user_id}
                            </h3>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 w-100 w-md-auto justify-content-end flex-wrap">
                        <ButtonSecondary
                            label="Volver al Listado"
                            onClick={() => navigate("/users")}
                            className="flex-grow-1 flex-md-grow-0"
                        />
                        {(app?.permissions?.["users"]?.includes("update") || Number(user.user_id) === currentUserId) && (
                            <ButtonPrimary
                                label="Editar Usuario"
                                onClick={() => navigate(`/users/edit/${user.user_id}`)}
                                className="flex-grow-1 flex-md-grow-0"
                            />
                        )}
                    </div>
                </div>

                <div className="col-12 col-lg-6">
                    <Card title="Información del Usuario" outline outlineColor="primary">
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                <span className="text-muted fw-semibold">Nombre completo:</span>
                                <span>{`${user.user_name} ${user.user_lastname}`.trim()}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                <span className="text-muted fw-semibold">Correo electrónico:</span>
                                <span>{user.user_email}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                <span className="text-muted fw-semibold">Perfiles:</span>
                                <span className="fw-semibold">
                                    {Array.isArray(user.profiles) && user.profiles.length > 0
                                        ? user.profiles.map((p) => p.profile_name).join(", ")
                                        : "—"}
                                </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                <span className="text-muted fw-semibold">Estado:</span>
                                <span>
                                    {user.user_active
                                        ? <Badge type="Success" text="Activo" pill />
                                        : <Badge type="Danger" text="Inactivo" pill />}
                                </span>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        )
    );
};

export default UserViewScreen;
