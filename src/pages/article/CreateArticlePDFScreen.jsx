import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import InputText from "../../components/inputs/InputText";
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

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        mode: "onChange"
    });

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

        console.log("Enviando FormData al backend de Enrique (SCRUM-86):", {
            titulo: data.titulo,
            lineaTematica: data.lineaTematica,
            resumen: data.resumen,
            archivo: selectedFile.name
        });

        // Simulamos la petición al backend
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