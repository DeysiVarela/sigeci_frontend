import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import DataTable from "react-data-table-component";
import Card from "../../components/cards/Card";
import Badge from "../../components/badges/Badge";
import Modal from "../../components/modals/Modal";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import ButtonLink from "../../components/buttons/ButtonLink";
import { listUsers, listProfiles, deleteUser, getMe } from "../../api/users";
import { getErrorMessage } from "../../utils/apiError";
import { isManager, canEditUser, canDeleteUser } from "../../utils/userAccess";
import { useTranslation, Trans } from "react-i18next";

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];

const toArray = (res) => (Array.isArray(res) ? res : res?.results || []);

const formatUser = (u) => ({
    id: u.id,
    name: `${u.name} ${u.lastname}`.trim(),
    email: u.email,
    role: (u.profiles ?? []).map((p) => p.name).join(", "),
    active: Boolean(u.active),
    profiles: u.profiles ?? [],
});

const AvatarInitial = ({ name, size = 40, className = "" }) => (
    <div
        className={`rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0 ${className}`}
        style={{ width: size, height: size, fontSize: size / 2.2 }}
    >
        {name.charAt(0).toUpperCase()}
    </div>
);

const getStatusBadge = (active, t) =>
    active
        ? <Badge type="Success" text={t("userScreen.status.active")} pill />
        : <Badge type="Danger" text={t("userScreen.status.inactive")} pill />;

const STAT_CARDS = [
    { key: "total", labelKey: "userScreen.stats.total", color: "primary", icon: "bi-people", valueClass: "text-dark" },
    { key: "active", labelKey: "userScreen.stats.active", color: "success", icon: "bi-check-circle", valueClass: "text-success" },
    { key: "inactive", labelKey: "userScreen.stats.inactive", color: "danger", icon: "bi-dash-circle", valueClass: "text-danger" },
];

const UserScreen = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

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
    const [me, setMe] = useState(null); // usuario autenticado (null = aún cargando)
    const [meError, setMeError] = useState(false);

    // Alertas y modales
    const [alertNotification, setAlertNotification] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const hasFilters = profileFilter !== "" || activeFilter !== "";

    // La búsqueda por texto se hace en el cliente (el backend no la soporta), así que solo
    // es confiable cuando TODOS los resultados de los filtros caben en la página actual.
    const canSearch = totalRows > 0 && totalRows <= perPage;
    const term = canSearch ? searchTerm.trim().toLowerCase() : "";
    const visibleUsers = term
        ? users.filter(
            (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
        )
        : users;

    // Listado: se vuelve a pedir al backend cuando cambia la página, el tamaño o un filtro
    useEffect(() => {
        let cancelled = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
                if (!cancelled) setError(getErrorMessage(err, t("userScreen.alerts.loadError")));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [page, perPage, profileFilter, activeFilter, reloadKey, t]);

    // Opciones del filtro de rol
    useEffect(() => {
        listProfiles()
            .then((res) => setProfiles(toArray(res)))
            .catch(() => setProfiles([]));
    }, []);

    // Usuario autenticado: de su rol e id dependen los botones (el backend sigue validando cada acción)
    useEffect(() => {
        getMe()
            .then((data) => setMe(data))
            .catch(() => setMeError(true));
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

    const triggerAlert = (type, message, title = t("userScreen.alerts.successTitle")) => {
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
            triggerAlert("success", t("userScreen.alerts.deleted", { name: target.name, email: target.email }), t("userScreen.alerts.deletedTitle"));
            if (users.length === 1 && page > 1) setPage((p) => p - 1);
            setReloadKey((k) => k + 1);
        } catch (err) {
            triggerAlert("danger", getErrorMessage(err, t("userScreen.alerts.deleteError")), t("userScreen.alerts.deleteErrorTitle"));
        } finally {
            setDeleteModalOpen(false);
            setSelectedUser(null);
        }
    };

    const columns = [
        {
            name: t("userScreen.columns.user"),
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
            name: t("userScreen.columns.role"),
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
            name: t("userScreen.columns.status"),
            selector: (row) => row.active,
            center: true,
            maxWidth: "180px",
            cell: (row) => getStatusBadge(row.active, t),
        },
        {
            name: t("userScreen.columns.actions"),
            minWidth: "230px",
            allowOverflow: true,
            ignoreRowClick: true,
            button: true,
            cell: (row) => (
                <div className="d-flex align-items-center gap-2 justify-content-end py-1 flex-nowrap">

                    <ButtonSecondary
                        label={t("userScreen.actions.view")}
                        className="btn-sm py-1 px-2 text-nowrap"
                        onClick={() => handleOpenView(row)}
                    />

                    {canEditUser(me, row.id, row) && (
                        <ButtonPrimary
                            label={t("userScreen.actions.edit")}
                            className="btn-sm py-1 px-2 text-nowrap"
                            onClick={() => navigate(`/users/edit/${row.id}`)}
                        />
                    )}
                    {canDeleteUser(me, row.id, row) && (
                        <ButtonLink
                            label={t("userScreen.actions.delete")}
                            className="text-danger fw-semibold small text-nowrap px-1"
                            onClick={() => handleOpenDelete(row)}
                        />
                    )}
                </div>
            ),
        },
    ];

    const renderTable = () => {
        if (loading) {
            return (
                <div className="py-5 text-center border rounded">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 mb-0 text-muted">{t("userScreen.loading")}</p>
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
                    paginationComponentOptions={{
                        rowsPerPageText: t("userScreen.pagination.rowsPerPage"),
                        rangeSeparatorText: t("userScreen.pagination.of")
                    }}
                    noDataComponent={
                        <div className="py-5 text-center text-muted">
                            <i className={`bi ${hasFilters ? "bi-search" : "bi-people"} fs-1 d-block mb-2 text-secondary opacity-50`}></i>
                            <p className="mb-0">
                                {term
                                    ? t("userScreen.empty.search")
                                    : hasFilters
                                        ? t("userScreen.empty.filters")
                                        : t("userScreen.empty.none")}
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
                        aria-label={t("userScreen.alerts.close")}
                        onClick={() => setAlertNotification(null)}
                    ></button>
                </div>
            )}

            {/* Encabezado */}
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom gap-3">
                <div>
                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
                        <i className="bi bi-people-fill text-primary"></i>
                        {t("userScreen.title")}
                    </h2>
                    <p className="text-secondary mb-0">
                        {t("userScreen.description")}
                    </p>
                </div>
                {isManager(me) && (
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-primary shadow-sm d-flex align-items-center gap-2"
                            onClick={() => navigate("/users/create")}
                        >
                            <i className="bi bi-person-plus-fill"></i>
                            <span>{t("userScreen.newUser")}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="row g-3 mb-4">
                {STAT_CARDS.map((s) => (
                    <div className="col-12 col-sm-6 col-xl-4" key={s.key}>
                        <div className={`card shadow-sm border-0 border-start border-${s.color} border-4`}>
                            <div className="card-body d-flex align-items-center justify-content-between py-3">
                                <div>
                                    <span className="text-muted small text-uppercase fw-bold">{t(s.labelKey)}</span>
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
                        {t("userScreen.alerts.retry")}
                    </button>
                </div>
            )}

            {meError && (
                <div className="alert alert-warning py-2" role="alert">
                    {t("userScreen.alerts.roleError")}
                </div>
            )}

            <Card title={t("userScreen.list.title")} outline outlineColor="primary">
                {/* Filtros: rol y estado */}
                <div className="row g-2 mb-3 align-items-center">
                    <div className="col-12 col-md-4 col-lg-3">
                        <label htmlFor="filter-profile" className="visually-hidden">{t("userScreen.list.filterRole")}</label>
                        <select
                            id="filter-profile"
                            className="form-select"
                            value={profileFilter}
                            onChange={handleProfileChange}
                        >
                            <option value="">{t("userScreen.list.allRoles")}</option>
                            {profiles.map((p) => (
                                <option key={p.id} value={p.id}>{p.name || p.profile_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 col-md-4 col-lg-3">
                        <label htmlFor="filter-active" className="visually-hidden">{t("userScreen.list.filterStatus")}</label>
                        <select
                            id="filter-active"
                            className="form-select"
                            value={activeFilter}
                            onChange={handleActiveChange}
                        >
                            <option value="">{t("userScreen.list.allStatuses")}</option>
                            <option value="true">{t("userScreen.list.onlyActive")}</option>
                            <option value="false">{t("userScreen.list.onlyInactive")}</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-4 col-lg-3">
                        <label htmlFor="filter-search" className="visually-hidden">{t("userScreen.list.search")}</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input
                                id="filter-search"
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder={t("userScreen.list.search")}
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
                                {t("userScreen.list.clearFilters")}
                            </button>
                        )}
                        {!loading && !error && (
                            <span className="text-muted small">
                                <strong>{term ? t("userScreen.list.ofTotal", { shown: visibleUsers.length, total: totalRows }) : totalRows}</strong>{" "}
                                {t("userScreen.list.userCount", { count: totalRows })}
                            </span>
                        )}
                    </div>
                </div>
                {!canSearch && !loading && !error && (
                    <p className="form-text mt-0 mb-3">
                        {t("userScreen.list.searchHint", { max: perPage })}
                    </p>
                )}

                {renderTable()}
            </Card>

            {/* MODAL: VER DETALLES */}
            <Modal
                show={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title={t("userScreen.viewModal.title")}
                size="md"
                footer={<ButtonSecondary label={t("userScreen.viewModal.close")} onClick={() => setViewModalOpen(false)} />}
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
                                <span className="text-muted fw-semibold">{t("userScreen.viewModal.id")}</span>
                                <span className="badge bg-secondary">#{selectedUser.id}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center py-2">
                                <span className="text-muted fw-semibold">{t("userScreen.viewModal.role")}</span>
                                <span className="fw-bold text-dark">{selectedUser.role}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center py-2">
                                <span className="text-muted fw-semibold">{t("userScreen.viewModal.status")}</span>
                                <span>{getStatusBadge(selectedUser.active, t)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN */}
            <Modal
                show={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title={t("userScreen.deleteModal.title")}
                size="md"
                footer={
                    <>
                        <ButtonSecondary label={t("userScreen.deleteModal.cancel")} onClick={() => setDeleteModalOpen(false)} />
                        <button
                            type="button"
                            className="btn btn-danger d-flex align-items-center gap-1 shadow-sm"
                            onClick={handleConfirmDelete}
                        >
                            <i className="bi bi-trash-fill"></i>
                            <span>{t("userScreen.deleteModal.confirm")}</span>
                        </button>
                    </>
                }
            >
                {selectedUser && (
                    <div className="text-center py-3">
                        <div className="text-danger mb-3">
                            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "3rem" }}></i>
                        </div>
                        <h5 className="fw-bold text-dark">{t("userScreen.deleteModal.question")}</h5>
                        <p className="text-muted px-3">
                            <Trans
                                i18nKey="userScreen.deleteModal.warning"
                                values={{ name: selectedUser.name, email: selectedUser.email }}
                                components={{ b: <strong />, code: <code /> }}
                            />
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserScreen;
