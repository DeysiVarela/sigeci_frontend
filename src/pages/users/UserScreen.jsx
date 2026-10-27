import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import DataTable from "react-data-table-component";
import { useForm } from "react-hook-form";
import Card from "../../components/cards/Card";
import Badge from "../../components/badges/Badge";
import Modal from "../../components/modals/Modal";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import ButtonLink from "../../components/buttons/ButtonLink";

const INITIAL_USERS = [
    {
        id: 1,
        name: "Carlos Daniel Mendoza",
        email: "carlos.mendoza@univalle.edu.co",
        role: "Administrador",
        department: "Tecnología",
        status: "Activo",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: 2,
        name: "Sofía Valentina Rodríguez",
        email: "sofia.rodriguez@univalle.edu.co",
        role: "Docente",
        department: "Ingeniería de Sistemas",
        status: "Activo",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: 3,
        name: "Mateo Fernando Gómez",
        email: "mateo.gomez@univalle.edu.co",
        role: "Estudiante",
        department: "Ciencias de la Computación",
        status: "Pendiente",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: 4,
        name: "Valeria Isabel Morales",
        email: "valeria.morales@univalle.edu.co",
        role: "Investigador",
        department: "Inteligencia Artificial",
        status: "Activo",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: 5,
        name: "Julián David Castro",
        email: "julian.castro@univalle.edu.co",
        role: "Docente",
        department: "Redes y Telecomunicaciones",
        status: "Inactivo",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    {
        id: 6,
        name: "Mariana Restrepo Ortiz",
        email: "mariana.restrepo@univalle.edu.co",
        role: "Coordinador",
        department: "Facultad de Ingeniería",
        status: "Activo",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    }
];

const UserScreen = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState(INITIAL_USERS);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("TODOS");

    // Alerts / Notificaciones AdminLTE
    const [alertNotification, setAlertNotification] = useState(null);

    // Modales
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Formulario para edición
    const { control, handleSubmit, setValue, formState: { errors } } = useForm();

    const triggerAlert = (type, message, title = "Operación exitosa") => {
        setAlertNotification({ type, title, message });
        setTimeout(() => {
            setAlertNotification(null);
        }, 4000);
    };

    // Acciones
    const handleOpenView = (user) => {
        setSelectedUser(user);
        setViewModalOpen(true);
    };

    const handleOpenEdit = (user) => {
        setSelectedUser(user);
        setValue("name", user.name);
        setValue("email", user.email);
        setValue("role", user.role);
        setValue("department", user.department);
        setValue("status", user.status);
        setEditModalOpen(true);
    };

    const handleSaveEdit = (data) => {
        setUsers(prev =>
            prev.map(u => (u.id === selectedUser.id ? { ...u, ...data } : u))
        );
        setEditModalOpen(false);
        triggerAlert("info", `Los datos de "${data.name}" han sido actualizados.`);
    };

    const handleOpenDelete = (user) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!selectedUser) return;
        setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        setDeleteModalOpen(false);
        triggerAlert(
            "danger",
            `El usuario "${selectedUser.name}" (${selectedUser.email}) fue eliminado del sistema correctamente.`,
            "¡Usuario Eliminado!"
        );
        setSelectedUser(null);
    };

    // Filtros de búsqueda
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.department.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === "TODOS" || user.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [users, searchTerm, statusFilter]);

    const getStatusBadge = (status) => {
        switch (status) {
            case "Activo":
                return <Badge type="Success" text="Activo" pill />;
            case "Pendiente":
                return <Badge type="Warning" text="Pendiente" pill />;
            case "Inactivo":
                return <Badge type="Danger" text="Inactivo" pill />;
            default:
                return <Badge type="Secondary" text={status} pill />;
        }
    };

    const columns = [
        {
            name: "Usuario",
            selector: row => row.name,
            sortable: true,
            minWidth: "250px",
            cell: row => (
                <div className="d-flex align-items-center py-2 text-truncate" style={{ maxWidth: "100%" }}>
                    <img
                        src={row.avatar}
                        alt={row.name}
                        className="rounded-circle shadow-sm me-3 object-fit-cover flex-shrink-0"
                        style={{ width: "40px", height: "40px" }}
                    />
                    <div className="text-truncate">
                        <div className="fw-semibold text-dark text-truncate" title={row.name}>{row.name}</div>
                        <small className="text-secondary text-truncate d-block" title={row.email}>{row.email}</small>
                    </div>
                </div>
            )
        },
        {
            name: "Rol",
            selector: row => row.role,
            sortable: true,
            minWidth: "140px",
            cell: row => (
                <span className="badge bg-light text-dark border fw-normal px-2 py-1">
                    <i className="bi bi-person-badge me-1 text-primary"></i>
                    {row.role}
                </span>
            )
        },
        {
            name: "Departamento",
            selector: row => row.department,
            sortable: true,
            cell: row => <span className="text-secondary small">{row.department}</span>
        },
        {
            name: "Estado",
            selector: row => row.status,
            sortable: true,
            center: true,
            maxWidth: "180px",
            cell: row => getStatusBadge(row.status)
        },
        {
            name: "Acciones",
            minWidth: "230px",
            allowOverflow: true,
            ignoreRowClick: true,
            button: true,
            cell: row => (
                <div className="d-flex align-items-center gap-2 justify-content-end py-1 flex-nowrap">
                    <ButtonSecondary
                        label="Ver"
                        className="btn-sm py-1 px-2 text-nowrap"
                        onClick={() => handleOpenView(row)}
                    />
                    <ButtonPrimary
                        label="Editar"
                        className="btn-sm py-1 px-2 text-nowrap"
                        onClick={() => navigate(`/users/edit/${row.id}`)}
                    />
                    <ButtonLink
                        label="Eliminar"
                        className="text-danger fw-semibold small text-nowrap px-1"
                        onClick={() => handleOpenDelete(row)}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="container-fluid p-4">
            {/* Banner de alerta AdminLTE */}
            {alertNotification && (
                <div
                    className={`alert alert-${alertNotification.type} alert-dismissible fade show shadow-sm border-0 mb-4`}
                    role="alert"
                >
                    <div className="d-flex align-items-center">
                        <i className={`bi fs-4 me-2 ${
                            alertNotification.type === "danger"
                                ? "bi-check-circle-fill"
                                : "bi-info-circle-fill"
                        }`}></i>
                        <div>
                            <strong className="d-block">{alertNotification.title}</strong>
                            <span>{alertNotification.message}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setAlertNotification(null)}
                    ></button>
                </div>
            )}

            {/* Header de la Pantalla */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom gap-3">
                <div>
                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
                        <i className="bi bi-people-fill text-primary"></i>
                        Gestión de Usuarios
                    </h2>
                    <p className="text-secondary mb-0">
                        Administra roles, accesos y estado del personal universitario registrado en SIGECI.
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary shadow-sm d-flex align-items-center gap-2"
                        onClick={() => navigate("/users/create")}
                    >
                        <i className="bi bi-person-plus-fill"></i>
                        <span>Nuevo Usuario</span>
                    </button>
                </div>
            </div>

            {/* Tarjetas de Estadísticas rápidas */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card shadow-sm border-0 border-start border-primary border-4">
                        <div className="card-body d-flex align-items-center justify-content-between py-3">
                            <div>
                                <span className="text-muted small text-uppercase fw-bold">Total Usuarios</span>
                                <h3 className="fw-bold mb-0 text-dark">{users.length}</h3>
                            </div>
                            <div className="bg-primary-subtle p-3 rounded-circle text-primary">
                                <i className="bi bi-people fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card shadow-sm border-0 border-start border-success border-4">
                        <div className="card-body d-flex align-items-center justify-content-between py-3">
                            <div>
                                <span className="text-muted small text-uppercase fw-bold">Activos</span>
                                <h3 className="fw-bold mb-0 text-success">
                                    {users.filter(u => u.status === "Activo").length}
                                </h3>
                            </div>
                            <div className="bg-success-subtle p-3 rounded-circle text-success">
                                <i className="bi bi-check-circle fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card shadow-sm border-0 border-start border-warning border-4">
                        <div className="card-body d-flex align-items-center justify-content-between py-3">
                            <div>
                                <span className="text-muted small text-uppercase fw-bold">Pendientes</span>
                                <h3 className="fw-bold mb-0 text-warning">
                                    {users.filter(u => u.status === "Pendiente").length}
                                </h3>
                            </div>
                            <div className="bg-warning-subtle p-3 rounded-circle text-warning">
                                <i className="bi bi-hourglass-split fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card shadow-sm border-0 border-start border-danger border-4">
                        <div className="card-body d-flex align-items-center justify-content-between py-3">
                            <div>
                                <span className="text-muted small text-uppercase fw-bold">Inactivos</span>
                                <h3 className="fw-bold mb-0 text-danger">
                                    {users.filter(u => u.status === "Inactivo").length}
                                </h3>
                            </div>
                            <div className="bg-danger-subtle p-3 rounded-circle text-danger">
                                <i className="bi bi-dash-circle fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenedor Principal de la Tabla */}
            <Card title="Listado Oficial de Usuarios" outline outlineColor="primary">
                {/* Barra de Filtros y Búsqueda */}
                <div className="row g-2 mb-3 align-items-center">
                    <div className="col-12 col-md-6 col-lg-4">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Buscar por nombre, correo o departamento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    className="btn btn-outline-secondary border-start-0"
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="col-12 col-md-4 col-lg-3">
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="TODOS">Todos los estados</option>
                            <option value="Activo">Solo Activos</option>
                            <option value="Pendiente">Solo Pendientes</option>
                            <option value="Inactivo">Solo Inactivos</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-2 col-lg-5 text-md-end text-muted small">
                        Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> usuarios
                    </div>
                </div>

                {/* Tabla de React Data Table */}
                <div className="border rounded">
                    <DataTable
                        columns={columns}
                        data={filteredUsers}
                        pagination
                        paginationPerPage={5}
                        paginationRowsPerPageOptions={[5, 10, 15, 20]}
                        responsive
                        highlightOnHover
                        noDataComponent={
                            <div className="py-5 text-center text-muted">
                                <i className="bi bi-search fs-1 d-block mb-2 text-secondary opacity-50"></i>
                                <p className="mb-0">No se encontraron usuarios con los criterios indicados.</p>
                            </div>
                        }
                    />
                </div>
            </Card>

            {/* MODAL 1: VER DETALLES */}
            <Modal
                show={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title="Detalles del Usuario"
                size="md"
                footer={
                    <ButtonSecondary label="Cerrar" onClick={() => setViewModalOpen(false)} />
                }
            >
                {selectedUser && (
                    <div className="text-center py-2">
                        <img
                            src={selectedUser.avatar}
                            alt={selectedUser.name}
                            className="rounded-circle shadow mb-3 object-fit-cover border border-3 border-primary"
                            style={{ width: "90px", height: "90px" }}
                        />
                        <h4 className="fw-bold mb-1">{selectedUser.name}</h4>
                        <p className="text-muted mb-3">{selectedUser.email}</p>

                        <div className="list-group list-group-flush text-start border-top border-bottom mb-2">
                            <div className="list-group-item d-flex justify-content-between align-items-center py-2">
                                <span className="text-muted fw-semibold">ID de Registro:</span>
                                <span className="badge bg-secondary">#{selectedUser.id}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center py-2">
                                <span className="text-muted fw-semibold">Rol Asignado:</span>
                                <span className="fw-bold text-dark">{selectedUser.role}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center py-2">
                                <span className="text-muted fw-semibold">Departamento / Escuela:</span>
                                <span className="text-dark">{selectedUser.department}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center py-2">
                                <span className="text-muted fw-semibold">Estado de Cuenta:</span>
                                <span>{getStatusBadge(selectedUser.status)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL 2: EDITAR USUARIO */}
            <Modal
                show={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Editar Usuario"
                size="lg"
                footer={
                    <>
                        <ButtonSecondary label="Cancelar" onClick={() => setEditModalOpen(false)} />
                        <ButtonPrimary label="Guardar Cambios" onClick={handleSubmit(handleSaveEdit)} />
                    </>
                }
            >
                {selectedUser && (
                    <form onSubmit={handleSubmit(handleSaveEdit)}>
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <InputText
                                    control={control}
                                    name="name"
                                    label="Nombre Completo"
                                    placeholder="Nombre del usuario"
                                    required
                                    errors={errors.name}
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <InputEmail
                                    control={control}
                                    name="email"
                                    label="Correo Institucional"
                                    placeholder="usuario@univalle.edu.co"
                                    required
                                    errors={errors.email}
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">Rol</label>
                                <select className="form-select" {...control.register("role")}>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Docente">Docente</option>
                                    <option value="Estudiante">Estudiante</option>
                                    <option value="Investigador">Investigador</option>
                                    <option value="Coordinador">Coordinador</option>
                                </select>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">Estado</label>
                                <select className="form-select" {...control.register("status")}>
                                    <option value="Activo">Activo</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div className="col-12">
                                <InputText
                                    control={control}
                                    name="department"
                                    label="Departamento / Facultad"
                                    placeholder="Ej. Ingeniería de Sistemas"
                                    required
                                    errors={errors.department}
                                />
                            </div>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL 3: CONFIRMACIÓN DE ELIMINACIÓN */}
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
                            <span>Sí, Eliminar Definitivamente</span>
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
                        <p className="text-muted px-3">
                            Esta acción eliminará a <strong>{selectedUser.name}</strong> (<code>{selectedUser.email}</code>) de la base de datos de SIGECI. Esta operación no se puede deshacer.
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserScreen;
