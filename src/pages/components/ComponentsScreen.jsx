import { useState } from "react";
import { useForm } from "react-hook-form";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import ButtonLink from "../../components/buttons/ButtonLink";
import Badge from "../../components/badges/Badge";
import Card from "../../components/cards/Card";
import Modal from "../../components/modals/Modal";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail";
import InputNumber from "../../components/inputs/InputNumber";
import HandlerApp from "../../utils/HandlerApp";

const ComponentsScreen = () => {
    const { control, handleSubmit, formState: { errors } } = useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handlerApp = HandlerApp();

    const onSubmitDemo = (data) => {
        alert("Formulario válido enviado:\n" + JSON.stringify(data, null, 2));
    };

    const triggerLoaderDemo = () => {
        console.log("inicio")
        handlerApp.setLoader(true);
        setTimeout(() => {
            console.log("finalo")
            handlerApp.setLoader(false);
        }, 2000, handlerApp);
    };

    return (
        <div className="container-fluid p-4">
            {/* Header / Intro */}
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                <div>
                    <h2 className="fw-bold mb-1">Catálogo de Componentes UI</h2>
                    <p className="text-secondary mb-0">
                        Galería interactiva para desarrolladores. Visualiza, prueba y reutiliza la librería de componentes del sistema.
                    </p>
                </div>
                <div>
                    <Badge type="info" text="SIGECI Design System" pill />
                </div>
            </div>

            <div className="row g-4">
                {/* 1. SECCIÓN BOTONES */}
                <div className="col-lg-6">
                    <Card title="Botones (Buttons)" outline outlineColor="primary">
                        <p className="text-muted small">
                            Variantes estándar con estados y soporte de propiedades <code>onClick</code>, <code>disabled</code>, etc.
                        </p>
                        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                            <ButtonPrimary label="Button Primary" onClick={() => alert("ButtonPrimary clickeado")} />
                            <ButtonSecondary label="Button Secondary" onClick={() => alert("ButtonSecondary clickeado")} />
                            <ButtonLink label="Button Link" onClick={() => alert("ButtonLink clickeado")} />
                        </div>
                        <div className="d-flex flex-wrap align-items-center gap-3">
                            <ButtonPrimary label="Disabled Primary" disabled />
                            <ButtonSecondary label="Disabled Secondary" disabled />
                            <ButtonLink label="Disabled Link" disabled />
                        </div>
                    </Card>
                </div>

                {/* 2. SECCIÓN BADGES */}
                <div className="col-lg-6">
                    <Card title="Badges (Insignias / Estados)" outline outlineColor="success">
                        <p className="text-muted small">
                            Insignias para status, conteos y etiquetas. Aceptan prop <code>type</code> y <code>pill</code>.
                        </p>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            <Badge type="Primary" text="Primary" />
                            <Badge type="Secondary" text="Secondary" />
                            <Badge type="Success" text="Success" />
                            <Badge type="Danger" text="Danger" />
                            <Badge type="Warning" text="Warning" />
                            <Badge type="Info" text="Info" />
                            <Badge type="Light" text="Light" />
                            <Badge type="Dark" text="Dark" />
                        </div>
                        <h6>Variante Rounded Pill:</h6>
                        <div className="d-flex flex-wrap gap-2">
                            <Badge type="Primary" text="Active" pill />
                            <Badge type="Success" text="Approved" pill />
                            <Badge type="Warning" text="Pending" pill />
                            <Badge type="Danger" text="Rejected" pill />
                            <Badge type="Info" text="Info Pill" pill />
                        </div>
                    </Card>
                </div>

                {/* 3. SECCIÓN INPUTS & FORMULARIOS */}
                <div className="col-lg-7">
                    <Card title="Form Inputs Controlados (react-hook-form)" outline outlineColor="warning">
                        <p className="text-muted small">
                            Inputs encapsulados con Controller, validación de formatos, reglas requeridas y mensajes de error.
                        </p>
                        <form onSubmit={handleSubmit(onSubmitDemo)}>
                            <InputText
                                control={control}
                                name="demoNombre"
                                label="Nombre de Usuario (InputText)"
                                placeholder="Ej. Daniel Pérez"
                                required
                                errors={errors.demoNombre}
                            />

                            <InputEmail
                                control={control}
                                name="demoEmail"
                                label="Correo Electrónico (InputEmail)"
                                placeholder="usuario@correo.com"
                                required
                                errors={errors.demoEmail}
                            />

                            <InputNumber
                                control={control}
                                name="demoEdad"
                                label="Edad (InputNumber: Solo números, min 18, max 99)"
                                placeholder="Ej. 25"
                                min={18}
                                max={99}
                                required
                                errors={errors.demoEdad}
                            />

                            <div className="d-flex gap-2 mt-3">
                                <ButtonPrimary label="Validar y Enviar Formulario" type="submit" />
                                <ButtonSecondary label="Limpiar" type="reset" />
                            </div>
                        </form>
                    </Card>
                </div>

                {/* 4. SECCIÓN OVERLAYS (LOADER & MODAL) */}
                <div className="col-lg-5">
                    <Card title="Modales y Loader de Pantalla" outline outlineColor="info">
                        <p className="text-muted small">
                            Componentes de interfaz interactivos para bloqueo de carga y ventanas emergentes.
                        </p>

                        <div className="mb-4">
                            <h6 className="fw-semibold">1. Loader Global (Overlay):</h6>
                            <p className="small text-secondary mb-2">
                                Bloquea la pantalla completa con spinner centrado mediante <code>HandlerApp().setLoader()</code>.
                            </p>
                            <ButtonPrimary
                                label="Probar Loader (2 segundos)"
                                onClick={triggerLoaderDemo}
                            />
                        </div>

                        <hr />

                        <div>
                            <h6 className="fw-semibold">2. Modal Dialog:</h6>
                            <p className="small text-secondary mb-2">
                                Ventana modal flotante con backdrop, botón cerrar y acciones personalizadas.
                            </p>
                            <ButtonSecondary
                                label="Abrir Modal Demo"
                                onClick={() => setIsModalOpen(true)}
                            />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modal de Demostración */}
            <Modal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Demostración de Componente Modal"
                footer={
                    <>
                        <ButtonSecondary label="Cerrar" onClick={() => setIsModalOpen(false)} />
                        <ButtonPrimary label="Aceptar" onClick={() => {
                            alert("¡Acción confirmada desde el Modal!");
                            setIsModalOpen(false);
                        }} />
                    </>
                }
            >
                <div className="py-2">
                    <p className="mb-2">
                        Este es el componente <strong>Modal</strong> reutilizable. Soporta contenido flexible en su cuerpo, backdrop clicable para salir, y pie con acciones.
                    </p>
                    <div className="alert alert-info py-2 small mb-0">
                        <i className="bi bi-info-circle me-1"></i> Está completamente controlado mediante el estado de React.
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ComponentsScreen;
