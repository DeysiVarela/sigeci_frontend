import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router";
import InputText from "../../components/inputs/InputText";
import InputEmail from "../../components/inputs/InputEmail"; 
import InputSelect from "../../components/inputs/InputSelect";
import InputTextArea from "../../components/inputs/InputTextArea";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import ButtonSecondary from "../../components/buttons/ButtonSecondary";
import Card from "../../components/cards/Card";
import HandlerApp from "../../utils/HandlerApp";
import Swal from "sweetalert2";

const CreateArticlePDFScreen = () => {
    const nav = useNavigate();
    const handlerApp = HandlerApp();
    const [selectedFile, setSelectedFile] = useState(null);

    const { control, handleSubmit, getValues, formState: { errors }, reset } = useForm({   
        mode: "onChange"
    });

    // Lista dinámica de coautores
    const { fields, append, remove } = useFieldArray({
        control,
        name: "coautores"
    });

    //Función para agregar una fila vacía
    const handleAddCoautor = () => {
        append({ nombre: "", afiliacion: "", correo: "" });
    };

    //No permite repetir el mismo correo entre coautores
    const validateCorreoUnico = (value) => {
        if (!value) return true;
        const correo = value.trim().toLowerCase();
        const repetidos = (getValues("coautores") || []).filter(
            (c) => (c.correo || "").trim().toLowerCase() === correo
        );
        return repetidos.length <= 1 || "Este correo ya está en la lista de coautores";
    };

    // Manejo manual del archivo PDF
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== "application/pdf") {
                Swal.fire("Error", "El archivo debe ser un PDF", "error");
                e.target.value = ""; // Limpiar
                return;
            }
            setSelectedFile(file);
        }
    };

    const submitData = (data) => {
        if (!selectedFile) {
            Swal.fire("Atención", "Debes adjuntar el archivo PDF de la propuesta", "warning");
            return;
        }

        handlerApp.setLoader(true);
        
        // Aquí preparamos los datos para enviar al backend (FormData para archivos)
        const formData = new FormData();
        formData.append("titulo", data.titulo);
        formData.append("lineaTematica", data.lineaTematica);
        formData.append("resumen", data.resumen);
        formData.append("pdfFile", selectedFile);

        // <--- Lista de coautores como JSON en un solo campo 
        formData.append("coautores", JSON.stringify(data.coautores ?? []));

        //borrar al conectar el backend real para verificar en pruebas qué se enviaría
        console.log("FormData coautores →", formData.get("coautores"));

        // Simulamos la petición al backend (reemplazar cuando endpoint real se haya creado en el backend, scrum-86 bolivar)
        setTimeout(() => {
            handlerApp.setLoader(false);
            
            Swal.fire({
                title: '¡Artículo Postulado!',
                text: 'Tu propuesta con PDF ha sido enviada al sistema (Simulación Backend).',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                reset();
                setSelectedFile(null);
                nav("/article");
            });

        }, 2000);
    };

    const lineasTematicas = [
        { value: "sistemas_inteligentes", label: "Sistemas Inteligentes" },
        { value: "tecnologias_informatica", label: "Tecnologías en Informática" },
        { value: "educacion_informatica", label: "Educación en Informática" },
        { value: "sistemas_software", label: "Sistemas de Software" },
        { value: "software_practica", label: "Software en la Práctica" }
    ];

    return (
        <div className="container-fluid p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom gap-3">
                <div className="d-flex align-items-center gap-3">
                    <button
                        className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "36px", height: "36px" }}
                        onClick={() => nav("/article")}
                        title="Volver"
                    >
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <div>
                        <span className="text-muted small text-uppercase fw-semibold">
                            Nueva Propuesta
                        </span>
                        <h3 className="fw-bold mb-0 text-dark">Postular Artículo con PDF</h3>
                    </div>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                    <Card title="Información del Artículo" outline outlineColor="success">
                        <form>
                            <InputText
                                control={control}
                                label="Título del Artículo"
                                name="titulo"
                                errors={errors.titulo}
                                required={true}
                                placeholder="Escribe el título completo de tu trabajo"
                            />

                            <InputSelect
                                control={control}
                                label="Línea Temática"
                                name="lineaTematica"
                                options={lineasTematicas}
                                errors={errors.lineaTematica}
                                required={true}
                                placeholder="Selecciona una línea temática"
                            />

                            <InputTextArea
                                control={control}
                                label="Resumen del Trabajo"
                                name="resumen"
                                errors={errors.resumen}
                                required={true}
                                rows={5}
                                placeholder="Escribe un resumen breve del trabajo..."
                            />

                            
                            <div className="mb-4">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <label className="fw-semibold mb-0">
                                        <i className="bi bi-people me-1"></i>
                                        Coautores (opcional)
                                    </label>
                                    <ButtonSecondary
                                        label="+ Agregar coautor"
                                        className="btn-sm"
                                        onClick={handleAddCoautor}
                                    />
                                </div>
 
                                {fields.length === 0 && (
                                    <small className="text-muted">
                                        Si tu trabajo tiene coautores, agrégalos con el botón de arriba.
                                    </small>
                                )}
 
                                {fields.map((field, index) => (
                                    <div key={field.id} className="border rounded p-3 mb-3 bg-light">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-semibold small text-uppercase text-muted">
                                                Coautor {index + 1}
                                            </span>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => remove(index)}
                                                title="Quitar coautor"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
 
                                        <InputText
                                            control={control}
                                            label="Nombre completo"
                                            name={`coautores.${index}.nombre`}
                                            errors={errors.coautores?.[index]?.nombre}
                                            required={true}
                                            placeholder="Nombre y apellido del coautor"
                                        />
                                        <InputText
                                            control={control}
                                            label="Afiliación"
                                            name={`coautores.${index}.afiliacion`}
                                            errors={errors.coautores?.[index]?.afiliacion}
                                            required={true}
                                            placeholder="Universidad, institución o empresa"
                                        />
                                        <InputEmail
                                            control={control}
                                            label="Correo"
                                            name={`coautores.${index}.correo`}
                                            errors={errors.coautores?.[index]?.correo}
                                            required={true}
                                            rules={{ validate: validateCorreoUnico }}
                                            placeholder="correo@institucion.edu"
                                        />
                                    </div>
                                ))}
                            </div>
                            

                            <div className="form-group mb-3">
                                <label htmlFor="pdfFile" className="fw-semibold">Archivo PDF de la Propuesta *</label>
                                <input 
                                    type="file" 
                                    id="pdfFile"
                                    className="form-control" 
                                    accept=".pdf" 
                                    onChange={handleFileChange}
                                />
                                <small className="text-muted">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Formatos permitidos: PDF. El archivo se guardará de forma privada en Supabase Storage.
                                </small>
                            </div>

                            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                                <ButtonSecondary
                                    label="Cancelar"
                                    onClick={() => nav("/article")}
                                />
                                <ButtonPrimary
                                    label="Enviar a Revisión"
                                    onClick={handleSubmit(submitData)}
                                />
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CreateArticlePDFScreen;