import { useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Controller, useForm } from "react-hook-form";
import Card from "../../components/cards/Card";
import Badge from "../../components/badges/Badge";
import Modal from "../../components/modals/Modal";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import ButtonLink from "../../components/buttons/ButtonLink";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
import { createUser, deleteUser, listProfiles, listUsers, updateUser } from "../../api/users";
import { session } from "../../api/http";

const EMPTY_FORM = { name: "", lastname: "", email: "", password: "", profile: "", active: "true" };

const UserScreen = () => {
    const canCreate = session.can("user", "create");
    const canUpdate = session.can("user", "update");
    const canDelete = session.can("user", "delete");

    // Listado (paginación y filtros se resuelven en el servidor)
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [profileFilter, setProfileFilter] = useState("");
    const [activeFilter, setActiveFilter] = useState("");
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

    // UI
    const [alertNotification, setAlertNotification] = useState(null);
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modal, setModal] = useState(null); // "view" | "create" | "edit" | "delete"

    const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: EMPTY_FORM });

    const triggerAlert = (type, message, title = "Operación exitosa") => {
        setAlertNotification({ type, title, message });
        setTimeout(() => setAlertNotification(null), 4000);
    };

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listUsers({
                page,
                pageSize: perPage,
                profile: profileFilter,
                active: activeFilter,
            });
            setRows(data.results);
            setTotal(data.count);
        } catch (e) {
            triggerAlert("danger", e.message, "No se pudo cargar el listado");
        } finally {
            setLoading(false);
        }
    }, [page, perPage, profileFilter, activeFilter]);

    const loadStats = useCallback(async () => {
        try {
            const [all, act, inact] = await Promise.all([
                listUsers({ page: 1, pageSize: 1 }),
                listUsers({ page: 1, pageSize: 1, active: "true" }),
                listUsers({ page: 1, pageSize: 1, active: "false" }),
            ]);
            setStats({ total: all.count, active: act.count, inactive: inact.count });
        } catch {
            /* las tarjetas son informativas: si fallan no se interrumpe la pantalla */
        }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);
    useEffect(() => { loadStats(); }, [loadStats]);

    useEffect(() => {
        listProfiles().then(setProfiles).catch(() => setProfiles([]));
    }, []);

    const closeModal = () => { setModal(null); setFormError(null); };

    const openView = (user) => { setSelectedUser(user); setModal("view"); };

    const openCreate = () => {
        reset(EMPTY_FORM);
        setSelectedUser(null);
        setFormError(null);
        setModal("create");
    };

    const openEdit = (user) => {
        reset({
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            password: "",
            profile: String(user.profile),
            active: String(user.active),
        });
        setSelectedUser(user);
        setFormError(null);
        setModal("edit");
    };

    const openDelete = (user) => { setSelectedUser(user); setFormError(null); setModal("delete"); };

    const handleSave = async (data) => {
        setSaving(true);
        setFormError(null);
        const payload = {
            name: data.name.trim(),
            lastname: data.lastname.trim(),
            email: data.email.trim(),
            profile: Number(data.profile),
            active: data.active === "true",
        };
        try {
            if (modal === "create") {
                await createUser({ ...payload, password: data.password });
                triggerAlert("success", `El usuario "${payload.name} ${payload.lastname}" fue creado.`);
                setPage(1);
            } else {
                await updateUser(selectedUser.id, payload);
                triggerAlert("info", `Los datos de "${payload.name} ${payload.lastname}" fueron actualizados.`);
            }
            closeModal();
            loadUsers();
            loadStats();
        } catch (e) {
            setFormError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        setSaving(true);
        setFormError(null);
        try {
            await deleteUser(selectedUser.id);
            triggerAlert("danger", `El usuario "${selectedUser.name} ${selectedUser.lastname}" fue eliminado.`, "Usuario eliminado");
            closeModal();
            // Si era el último de la página, retroceder una
            if (rows.length === 1 && page > 1) setPage(page - 1); else loadUsers();
            loadStats();
        } catch (e) {
            setFormError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const statusBadge = (active) =>
        active ? <Badge type="Success" text="Activo" pill /> : <Badge type="Danger" text="Inactivo" pill />;

    const columns = [
        {
            name: "Usuario",
            selector: (row) => row.name,
            minWidth: "250px",
            cell: (row) => (
                <div className="py-2 text-truncate">
                    <div className="fw-semibold text-dark text-truncate" title={`${row.name} ${row.lastname}`}>
                        {row.name} {row.lastname}
                    </div>
                    <small className="text-secondary text-truncate d-block" title={row.email}>{row.email}</small>
                </div>
            ),
        },
        {
            name: "Rol",
            selector: (row) => row.profile_name,
            minWidth: "140px",
            cell: (row) => (
                <span className="badge bg-light text-dark border fw-normal px-2 py-1">
                    <i className="bi bi-person-badge me-1 text-primary"></i>
                    {row.profile_name}
                </span>
            ),
        },
        {
            name: "Estado",
            selector: (row) => row.active,
            center: true,
            maxWidth: "180px",
            cell: (row) => statusBadge(row.active),
        },
        {
            name: "Acciones",
            minWidth: "230px",
            allowOverflow: true,
            ignoreRowClick: true,
            button: true,
            cell: (row) => (
                <div className="d-flex align-items-center gap-2 justify-content-end py-1 flex-nowrap">
                    <ButtonSecondary label="Ver" className="btn-sm py-1 px-2 text-nowrap" onClick={() => openView(row)} />
                    {canUpdate && (
                        <ButtonPrimary label="Editar" className="btn-sm py-1 px-2 text-nowrap" onClick={() => openEdit(row)} />
                    )}
                    {canDelete && (
                        <ButtonLink
                            label="Eliminar"
                            className="text-danger fw-semibold small text-nowrap px-1"
                            onClick={() => openDelete(row)}
                        />
                    )}
                </div>
            ),
        },
    ];

    const formModal = modal === "create" || modal === "edit";

    return (
        <div className="container-fluid p-4">
            {alertNotification && (
                <div className={`alert alert-${alertNotification.type} alert-dismissible fade show shadow-sm border-0 mb-4`} role="alert">
                    <strong className="d-block">{alertNotification.title}</strong>
                    <span>{alertNotification.message}</span>
                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setAlertNotification(null)}></button>
                </div>
            )}

            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom gap-3">
                <div>
                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
                        <i className="bi bi-people-fill text-primary"></i>
                        Gestión de Usuarios
                    </h2>
                    <p className="text-secondary mb-0">Administra roles, accesos y estado de los usuarios registrados en SIGECI.</p>
                </div>
                {canCreate && (
                    <button className="btn btn-primary shadow-sm d-flex align-items-center gap-2" onClick={openCreate}>
                        <i className="bi bi-person-plus-fill"></i>
                        <span>Nuevo Usuario</span>
                    </button>
                )}
            </div>

            <div className="row g-3 mb-4">
                {[
                    { label: "Total usuarios", value: stats.total, color: "primary", icon: "bi-people", text: "text-dark" },
                    { label: "Activos", value: stats.active, color: "success", icon: "bi-check-circle", text: "text-success" },
                    { label: "Inactivos", value: stats.inactive, color: "danger", icon: "bi-dash-circle", text: "text-danger" },
                ].map((c) => (
                    <div className="col-12 col-md-4" key={c.label}>
                        <div className={`card shadow-sm border-0 border-start border-${c.color} border-4`}>
                            <div className="card-body d-flex align-items-center justify-content-between py-3">
                                <div>
                                    <span className="text-muted small text-uppercase fw-bold">{c.label}</span>
                                    <h3 className={`fw-bold mb-0 ${c.text}`}>{c.value}</h3>
                                </div>
                                <div className={`bg-${c.color}-subtle p-3 rounded-circle text-${c.color}`}>
                                    <i className={`bi ${c.icon} fs-4`}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Card title="Listado de Usuarios" outline outlineColor="primary">
                <div className="row g-2 mb-3 align-items-center">
                    <div className="col-12 col-md-4 col-lg-3">
                        <select
                            className="form-select"
                            value={profileFilter}
                            onChange={(e) => { setPage(1); setProfileFilter(e.target.value); }}
                        >
                            <option value="">Todos los roles</option>
                            {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-4 col-lg-3">
                        <select
                            className="form-select"
                            value={activeFilter}
                            onChange={(e) => { setPage(1); setActiveFilter(e.target.value); }}
                        >
                            <option value="">Todos los estados</option>
                            <option value="true">Solo activos</option>
                            <option value="false">Solo inactivos</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-4 col-lg-6 text-md-end text-muted small">
                        Total: <strong>{total}</strong> usuarios
                    </div>
                </div>

                <div className="border rounded">
                    <DataTable
                        columns={columns}
                        data={rows}
                        progressPending={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={total}
                        paginationDefaultPage={page}
                        paginationPerPage={perPage}
                        paginationRowsPerPageOptions={[5, 10, 20, 50]}
                        onChangePage={(p) => setPage(p)}
                        onChangeRowsPerPage={(n) => { setPerPage(n); setPage(1); }}
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

            {/* VER DETALLE */}
            <Modal
                show={modal === "view"}
                onClose={closeModal}
                title="Detalles del Usuario"
                footer={<ButtonSecondary label="Cerrar" onClick={closeModal} />}
            >
                {selectedUser && (
                    <div className="py-2">
                        <h4 className="fw-bold mb-1 text-center">{selectedUser.name} {selectedUser.lastname}</h4>
                        <p className="text-muted mb-3 text-center">{selectedUser.email}</p>
                        <div className="list-group list-group-flush border-top border-bottom">
                            <div className="list-group-item d-flex justify-content-between py-2">
                                <span className="text-muted fw-semibold">ID:</span>
                                <span className="badge bg-secondary">#{selectedUser.id}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between py-2">
                                <span className="text-muted fw-semibold">Rol:</span>
                                <span className="fw-bold">{selectedUser.profile_name}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between py-2">
                                <span className="text-muted fw-semibold">Estado:</span>
                                {statusBadge(selectedUser.active)}
                            </div>
                            <div className="list-group-item d-flex justify-content-between py-2">
                                <span className="text-muted fw-semibold">Registrado:</span>
                                <span>{new Date(selectedUser.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* CREAR / EDITAR */}
            <Modal
                show={formModal}
                onClose={closeModal}
                title={modal === "create" ? "Nuevo Usuario" : "Editar Usuario"}
                size="lg"
                footer={
                    <>
                        <ButtonSecondary label="Cancelar" onClick={closeModal} />
                        <ButtonPrimary
                            label={saving ? "Guardando..." : modal === "create" ? "Crear usuario" : "Guardar cambios"}
                            disabled={saving}
                            onClick={handleSubmit(handleSave)}
                        />
                    </>
                }
            >
                {formError && <div className="alert alert-danger py-2" role="alert">{formError}</div>}
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(handleSave)(); }}>
                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <InputText control={control} name="name" label="Nombre" required errors={errors.name} />
                        </div>
                        <div className="col-12 col-md-6">
                            <InputText control={control} name="lastname" label="Apellido" required errors={errors.lastname} />
                        </div>
                        <div className="col-12 col-md-6">
                            <InputEmail control={control} name="email" label="Correo electrónico" required errors={errors.email} />
                        </div>
                        {modal === "create" && (
                            <div className="col-12 col-md-6">
                                <InputPassword control={control} name="password" label="Contraseña" required errors={errors.password} />
                            </div>
                        )}
                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="profile">Rol</label>
                            <Controller
                                control={control}
                                name="profile"
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <select id="profile" className="form-select" {...field}>
                                        <option value="">Selecciona un rol</option>
                                        {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                )}
                            />
                            {errors.profile && <p className="small text-danger mt-1 mb-0">⚠️ Este campo es obligatorio</p>}
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="active">Estado</label>
                            <Controller
                                control={control}
                                name="active"
                                render={({ field }) => (
                                    <select id="active" className="form-select" {...field}>
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                )}
                            />
                        </div>
                    </div>
                </form>
            </Modal>

            {/* ELIMINAR (borrado lógico) */}
            <Modal
                show={modal === "delete"}
                onClose={closeModal}
                title="Confirmar eliminación"
                footer={
                    <>
                        <ButtonSecondary label="Cancelar" onClick={closeModal} />
                        <button type="button" className="btn btn-danger" disabled={saving} onClick={handleConfirmDelete}>
                            <i className="bi bi-trash-fill me-1"></i>
                            {saving ? "Eliminando..." : "Sí, eliminar"}
                        </button>
                    </>
                }
            >
                {selectedUser && (
                    <div className="text-center py-3">
                        <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: "3rem" }}></i>
                        <h5 className="fw-bold mt-2">¿Eliminar este usuario?</h5>
                        <p className="text-muted px-3 mb-0">
                            <strong>{selectedUser.name} {selectedUser.lastname}</strong> (<code>{selectedUser.email}</code>) dejará
                            de aparecer en el listado y no podrá iniciar sesión.
                        </p>
                        {formError && <div className="alert alert-danger py-2 mt-3 mb-0">{formError}</div>}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserScreen;
