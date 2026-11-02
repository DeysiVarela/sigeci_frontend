import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import DataTable from "react-data-table-component";
import Card from "../../components/cards/Card";
import Badge from "../../components/badges/Badge";
import Modal from "../../components/modals/Modal";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import ButtonLink from "../../components/buttons/ButtonLink";
import { listUsers, listProfiles, deleteUser } from "../../api/users";

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];

const toArray = (res) => (Array.isArray(res) ? res : res?.results || []);

const formatUser = (u) => ({
    id: u.id,
    name: `${u.name} ${u.lastname}`.trim(),
    email: u.email,
    role: u.profile_name,
    status: u.active ? "Activo" : "Inactivo",
});

const AvatarInitial = ({ name, size = 40, className = "" }) => (
    <div
        className={`rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0 ${className}`}
        style={{ width: size, height: size, fontSize: size / 2.2 }}
    >
        {name.charAt(0).toUpperCase()}
    </div>
);

const getStatusBadge = (status) =>
    status === "Activo"
        ? <Badge type="Success" text="Activo" pill />
        : <Badge type="Danger" text="Inactivo" pill />;

const STAT_CARDS = [
    { key: "total", label: "Total Usuarios", color: "primary", icon: "bi-people", valueClass: "text-dark" },
    { key: "active", label: "Activos", color: "success", icon: "bi-check-circle", valueClass: "text-success" },
    { key: "inactive", label: "Inactivos", color: "danger", icon: "bi-dash-circle", valueClass: "text-danger" },
];

const UserScreen = () => {
    const navigate = useNavigate();

    // Datos de la tabla (paginados en el servidor)
    const [users, setUsers] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Paginación y filtros (los 2 filtros que define el backend: profile y active)
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
    const [profileFilter, setProfileFilter] = useState("");
    const [activeFilter, setActiveFilter] = useState("");
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Apoyo
    const [profiles, setProfiles] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [reloadKey, setReloadKey] = useState(0);

    // Alertas y modales
    const [alertNotification, setAlertNotification] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const hasFilters = profileFilter !== "" || activeFilter !== "";

    // La búsqueda por texto se hace en el cliente (el backend no la soporta), así que solo
    // es confiable cuando TODOS los resultados de los filtros caben en la página actual.
    const canSearch = hasFilters && totalRows > 0 && totalRows <= perPage;
    const term = canSearch ? searchTerm.trim().toLowerCase() : "";
    const visibleUsers = term
        ? users.filter(
            (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
        )
        : users;

    // Listado: se vuelve a pedir al backend cuando cambia la página, el tamaño o un filtro
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");

        listUsers({
            page,
            pageSize: perPage,
            profile: profileFilter || undefined,
            active: activeFilter || undefined,
        })
            .then((res) => {
                if (cancelled) return;
                const data = toArray(res);
                setUsers(data.map(formatUser));
                setTotalRows(Array.isArray(res) ? data.length : res.count ?? data.length);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message || "No fue posible cargar los usuarios.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [page, perPage, profileFilter, activeFilter, reloadKey]);

    // Opciones del filtro de rol
    useEffect(() => {
        listProfiles()
            .then((res) => setProfiles(toArray(res)))
            .catch(() => setProfiles([]));
    }, []);

    // Contadores de las tarjetas (totales globales, sin filtros)
    useEffect(() => {
        Promise.all([
            listUsers({ pageSize: 1 }),
            listUsers({ pageSize: 1, active: true }),
            listUsers({ pageSize: 1, active: false }),
        ])
            .then(([all, act, inact]) =>
                setStats({ total: all.count ?? 0, active: act.count ?? 0, inactive: inact.count ?? 0 })
            )
            .catch(() => { });
    }, [reloadKey]);

    const triggerAlert = (type, message, title = "Operación exitosa") => {
        setAlertNotification({ type, title, message });
        setTimeout(() => setAlertNotification(null), 4000);
    };

    const resetToFirstPage = () => {
        setPage(1);
        setResetPaginationToggle((t) => !t);
        setSearchTerm("");
    };

    const handleProfileChange = (e) => {
        setProfileFilter(e.target.value);
        resetToFirstPage();
    };

    const handleActiveChange = (e) => {
        setActiveFilter(e.target.value);
        resetToFirstPage();
    };

    const clearFilters = () => {
        setProfileFilter("");
        setActiveFilter("");
        resetToFirstPage();
    };

    const handleOpenView = (user) => {
        setSelectedUser(user);
        setViewModalOpen(true);
    };

    const handleOpenDelete = (user) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    // El backend hace borrado lógico; la fila deja de aparecer en el listado
    const handleConfirmDelete = async () => {
        if (!selectedUser) return;
        const target = selectedUser;
        try {
            await deleteUser(target.id);
            triggerAlert("success", `El usuario "${target.name}" (${target.email}) fue eliminado.`, "Usuario eliminado");
            if (users.length === 1 && page > 1) setPage((p) => p - 1);
            setReloadKey((k) => k + 1);
        } catch (err) {
            triggerAlert("danger", err.message || "No se pudo eliminar el usuario.", "No se pudo eliminar");
        } finally {
            setDeleteModalOpen(false);
            setSelectedUser(null);
        }
    };

    const columns = [
        {
            name: "Usuario",
            selector: (row) => row.name,
            minWidth: "250px",
            cell: (row) => (
                <div className="d-flex align-items-center py-2 text-truncate" style={{ maxWidth: "100%" }}>
                    <AvatarInitial name={row.name} className="me-3" />
                    <div className="text-truncate">
                        <div className="fw-semibold text-dark text-truncate" title={row.name}>{row.name}</div>
                        <small className="text-secondary text-truncate d-block" title={row.email}>{row.email}</small>
                    </div>
                </div>
            ),
        },
        {
            name: "Rol",
            selector: (row) => row.role,
            minWidth: "140px",
            cell: (row) => (
                <span className="badge bg-light text-dark border fw-normal px-2 py-1">
                    <i className="bi bi-person-badge me-1 text-primary"></i>
                    {row.role}
                </span>
            ),
        },
        {
            name: "Estado",
            selector: (row) => row.status,
            center: true,
            maxWidth: "180px",
            cell: (row) => getStatusBadge(row.status),
        },
        {
            name: "Acciones",
            minWidth: "230px",
            allowOverflow: true,
            ignoreRowClick: true,
            button: true,
            cell: (row) => (
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
            ),
        },
    ];

    const renderTable = () => {
        if (loading) {
            return (
                <div className="py-5 text-center border rounded">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 mb-0 text-muted">Cargando usuarios...</p>
                </div>
            );
        }
        if (error) return null;

        return (
            <div className="border rounded">
                <DataTable
                    columns={columns}
                    data={visibleUsers}
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    paginationPerPage={perPage}
                    paginationRowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                    paginationDefaultPage={page}
                    paginationResetDefaultPage={resetPaginationToggle}
                    onChangePage={(newPage) => setPage(newPage)}
                    onChangeRowsPerPage={(newPerPage, newPage) => {
                        setPerPage(newPerPage);
                        setPage(newPage);
                    }}
                    responsive
                    highlightOnHover
                    noDataComponent={
                        <div className="py-5 text-center text-muted">
                            <i className={`bi ${hasFilters ? "bi-search" : "bi-people"} fs-1 d-block mb-2 text-secondary opacity-50`}></i>
                            <p className="mb-0">
                                {term
                                    ? "Ningún usuario coincide con la búsqueda."
                                    : hasFilters
                                        ? "Ningún usuario coincide con los filtros seleccionados."
                                        : "Aún no hay usuarios registrados."}
                            </p>
                        </div>
                    }
                />
            </div>
        );
    };

    return (
        <div className="container-fluid p-4">
            {/* Banner de alerta */}
            {alertNotification && (
                <div
                    className={`alert alert-${alertNotification.type} alert-dismissible fade show shadow-sm border-0 mb-4`}
                    role="alert"
                >
                    <div className="d-flex align-items-center">
                        <i className={`bi fs-4 me-2 ${alertNotification.type === "success"
                            ? "bi-check-circle-fill"
                            : alertNotification.type === "danger"
                                ? "bi-exclamation-triangle-fill"
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
                        aria-label="Cerrar"
                        onClick={() => setAlertNotification(null)}
                    ></button>
                </div>
            )}

            {/* Encabezado */}
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

            {/* Tarjetas de estadísticas */}
            <div className="row g-3 mb-4">
                {STAT_CARDS.map((s) => (
                    <div className="col-12 col-sm-6 col-xl-4" key={s.key}>
                        <div className={`card shadow-sm border-0 border-start border-${s.color} border-4`}>
                            <div className="card-body d-flex align-items-center justify-content-between py-3">
                                <div>
                                    <span className="text-muted small text-uppercase fw-bold">{s.label}</span>
                                    <h3 className={`fw-bold mb-0 ${s.valueClass}`}>{stats[s.key]}</h3>
                                </div>
                                <div className={`bg-${s.color}-subtle p-3 rounded-circle text-${s.color}`}>
                                    <i className={`bi ${s.icon} fs-4`}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Error de comunicación */}
            {error && (
                <div className="alert alert-danger d-flex align-items-center justify-content-between" role="alert">
                    <span>
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </span>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setReloadKey((k) => k + 1)}>
                        Reintentar
                    </button>
                </div>
            )}

            <Card title="Listado Oficial de Usuarios" outline outlineColor="primary">
                {/* Filtros: rol y estado */}
                <div className="row g-2 mb-3 align-items-center">
                    <div className="col-12 col-md-4 col-lg-3">
                        <label htmlFor="filter-profile" className="visually-hidden">Filtrar por rol</label>
                        <select
                            id="filter-profile"
                            className="form-select"
                            value={profileFilter}
                            onChange={handleProfileChange}
                        >
                            <option value="">Todos los roles</option>
                            {profiles.map((p) => (
                                <option key={p.id} value={p.id}>{p.name || p.profile_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 col-md-4 col-lg-3">
                        <label htmlFor="filter-active" className="visually-hidden">Filtrar por estado</label>
                        <select
                            id="filter-active"
                            className="form-select"
                            value={activeFilter}
                            onChange={handleActiveChange}
                        >
                            <option value="">Todos los estados</option>
                            <option value="true">Solo Activos</option>
                            <option value="false">Solo Inactivos</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-4 col-lg-3">
                        <label htmlFor="filter-search" className="visually-hidden">Buscar por nombre o correo</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input
                                id="filter-search"
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="Buscar por nombre o correo"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={!canSearch}
                            />
                        </div>
                    </div>
                    <div className="col-12 col-lg-3 d-flex align-items-center justify-content-lg-end gap-3">
                        {hasFilters && (
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                                <i className="bi bi-x-circle me-1"></i>
                                Limpiar filtros
                            </button>
                        )}
                        {!loading && !error && (
                            <span className="text-muted small">
                                <strong>{term ? `${visibleUsers.length} de ${totalRows}` : totalRows}</strong>{" "}
                                {totalRows === 1 ? "usuario" : "usuarios"}
                            </span>
                        )}
                    </div>
                </div>
                {!canSearch && !loading && !error && (
                    <p className="form-text mt-0 mb-3">
                        La búsqueda por texto se habilita cuando los filtros dejan {perPage} usuarios o menos.
                    </p>
                )}

                {renderTable()}
            </Card>

            {/* MODAL: VER DETALLES */}
            <Modal
                show={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title="Detalles del Usuario"
                size="md"
                footer={<ButtonSecondary label="Cerrar" onClick={() => setViewModalOpen(false)} />}
            >
                {selectedUser && (
                    <div className="text-center py-2">
                        <AvatarInitial
                            name={selectedUser.name}
                            size={90}
                            className="mx-auto mb-3 border border-3 border-primary"
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
                                <span className="text-muted fw-semibold">Estado de Cuenta:</span>
                                <span>{getStatusBadge(selectedUser.status)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN */}
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
                            <span>Sí, Eliminar</span>
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
                            Se eliminará a <strong>{selectedUser.name}</strong> (<code>{selectedUser.email}</code>) y dejará de aparecer en el listado.
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserScreen;
