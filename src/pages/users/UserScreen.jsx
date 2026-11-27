import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import DataTable from "react-data-table-component";
import Badge from "../../components/badges/Badge";
import Modal from "../../components/modals/Modal";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import HandlerApp from "../../utils/HandlerApp";
import { useFetch } from "../../hooks/useFetch";
import { AppContext } from "../../context/AppContext";

const UserScreen = () => {
    const navigate = useNavigate();
    const api = useFetch();
    const handlerApp = HandlerApp();
    const { app } = useContext(AppContext);

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const currentUserId = Number(localStorage.getItem("id") || 0);

    const getUsers = () => {
        handlerApp.setLoader(true);
        api.get("users/")
            .then((res) => {
                if (res.success) {
                    setUsers(res.data);
                } else {
                    setUsers([]);
                    handlerApp.showError(res.message);
                }
            })
            .catch((err) => {
                setUsers([]);
                handlerApp.showError(err.message);
            })
            .finally(() => {
                handlerApp.setLoader(false);
            });
    };

    useEffect(() => {
        getUsers();
    }, []);

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;
        const targetId = selectedUser.user_id;
        handlerApp.setLoader(true);
        try {
            const res = await api.deleteMethod(`users/${targetId}/`);
            setDeleteModalOpen(false);
            setSelectedUser(null);
            if (res.success) {
                handlerApp.showOk(res.message);
                getUsers();
            } else {
                handlerApp.showError(res.message);
            }
        } catch (err) {
            setDeleteModalOpen(false);
            setSelectedUser(null);
            handlerApp.showError(err.message);
        } finally {
            handlerApp.setLoader(false);
        }
    };

    const columns = [
        {
            name: "ID",
            selector: (row) => row.user_id,
            sortable: true,
            center: true,
            grow: 0.5,
            cell: (row) => `#${row.user_id}`,
        },
        {
            name: "Usuario",
            selector: (row) => `${row.user_name} ${row.user_lastname}`,
            sortable: true,
            grow: 2.5,
            cell: (row) => {
                const fullName = `${row.user_name} ${row.user_lastname}`.trim();
                return (
                    <div className="w-100 overflow-hidden py-1">
                        <Link
                            to={`/users/${row.user_id}`}
                            className="d-block text-primary text-truncate text-decoration-none"
                            title={fullName}
                        >
                            {fullName}
                        </Link>
                        <small className="text-muted d-block text-truncate" title={row.user_email}>
                            {row.user_email}
                        </small>
                    </div>
                );
            },
        },
        {
            name: "Perfiles",
            selector: (row) => row.profiles_names,
            sortable: true,
            grow: 1.8,
            cell: (row) => {
                const label = Array.isArray(row.profiles) && row.profiles.length > 0
                    ? row.profiles.map((p) => p.profile_name).join(", ")
                    : "—";
                return (
                    <span
                        className="badge bg-light text-dark border text-truncate d-inline-block mw-100"
                        title={label}
                    >
                        {label}
                    </span>
                );
            },
        },
        {
            name: "Estado",
            selector: (row) => row.user_active,
            sortable: true,
            center: true,
            grow: 1,
            cell: (row) =>
                row.user_active
                    ? <Badge type="Success" text="Activo" pill />
                    : <Badge type="Danger" text="Inactivo" pill />,
        },
        {
            name: "Acciones",
            ignoreRowClick: true,
            center: true,
            grow: 1.5,
            cell: (row) => (
                <div className="table-actions">
                    {app?.permissions?.["users"]?.includes("view") && (
                        <button
                            type="button"
                            className="btn-table-action btn-table-view"
                            title="Ver"
                            aria-label="Ver"
                            onClick={() => navigate(`/users/${row.user_id}`)}
                        >
                            <i className="bi bi-eye"></i>
                        </button>
                    )}
                    {(app?.permissions?.["users"]?.includes("update") || Number(row.user_id) === currentUserId) && (
                        <button
                            type="button"
                            className="btn-table-action btn-table-edit"
                            title="Editar"
                            aria-label="Editar"
                            onClick={() => navigate(`/users/edit/${row.user_id}`)}
                        >
                            <i className="bi bi-pencil"></i>
                        </button>
                    )}
                    {app?.permissions?.["users"]?.includes("delete") && Number(row.user_id) !== currentUserId && (
                        <button
                            type="button"
                            className="btn-table-action btn-table-delete"
                            title="Eliminar"
                            aria-label="Eliminar"
                            onClick={() => {
                                setSelectedUser(row);
                                setDeleteModalOpen(true);
                            }}
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="container-fluid p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom gap-3">
                <div>
                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
                        <i className="bi bi-people-fill text-primary"></i>
                        Gestión de Usuarios
                    </h2>
                    <p className="text-secondary mb-0">
                        Administra perfiles, accesos y estado del personal registrado en SIGECI.
                    </p>
                </div>
                {app?.permissions?.["users"]?.includes("create") && (
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-primary shadow-sm d-flex align-items-center gap-2"
                            onClick={() => navigate("/users/create")}
                        >
                            <i className="bi bi-plus-circle"></i>
                            <span>Nuevo Usuario</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="border rounded">
                <DataTable
                    columns={columns}
                    data={users}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 50, 100]}
                    responsive
                    highlightOnHover
                    noDataComponent={
                        <div className="py-5 text-center text-muted">
                            <i className="bi bi-people fs-1 d-block mb-2 text-secondary opacity-50"></i>
                            <p className="mb-0">No hay usuarios registrados.</p>
                        </div>
                    }
                />
            </div>

            <Modal
                show={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirmar Eliminación"
                size="md"
                footer={
                    <>
                        <ButtonSecondary label="Cancelar" onClick={() => setDeleteModalOpen(false)} />
                        <button
                            type="button"
                            className="btn btn-danger d-flex align-items-center gap-1 shadow-sm"
                            onClick={handleConfirmDelete}
                        >
                            <i className="bi bi-trash-fill"></i>
                            <span>Sí, eliminar</span>
                        </button>
                    </>
                }
            >
                {selectedUser && (
                    <div className="text-center py-3">
                        <div className="text-danger mb-3">
                            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "3rem" }}></i>
                        </div>
                        <h5 className="fw-bold text-dark">¿Estás seguro de eliminar este usuario?</h5>
                        <p className="text-muted px-3 mb-0">
                            Se desactivará el acceso de{" "}
                            <strong>{`${selectedUser.user_name} ${selectedUser.user_lastname}`.trim()}</strong>{" "}
                            (<code>{selectedUser.user_email}</code>).
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserScreen;
