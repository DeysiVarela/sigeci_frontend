

import { Controller } from "react-hook-form";

const InputText = ({control, label, name, onChange, rules={}, errors={}, placeholder=null, required=false}) => {
    return (
        <Controller
            control={control}
            name={name}
            rules={{...rules, required: required}}
            defaultValue=""
            render={({ field }) => (
                <div className="form-group mb-3">
                    <label htmlFor={name}>{label}</label>
                    <input 
                        type="text" 
                        id={name}
                        className="form-control"
                        value={field.value} 
                        onChange={(e)=>{
                            onChange?.(e.target.value); 
                            field.onChange(e);
                        }} 
                        onBlur={(e)=>{
                            field.onBlur(e);
                        }}
                        placeholder={placeholder ? placeholder : label} 
                    />
                    {/* {JSON.stringify(errors)} */}
                    {errors?.type === "required" && <p className="small text-danger"><span className="mr-1">⚠️</span>Este campo es obligatorio</p>}
                    {errors?.type === "min" && <p className="small text-danger"><span className="mr-1">⚠️</span>El valor de {name} es menor al requerido</p>}
                    {errors?.type === "max" && <p className="small text-danger"><span className="mr-1">⚠️</span>El valor de {name} supera el máximo permitido</p>}
                    {errors?.type === "minLength" && <p className="small text-danger"><span className="mr-1">⚠️</span>Este campo debe tener al menos {errors?.minLength?.value} caracteres</p>}
                    {errors?.type === "email" && <p className="small text-danger"><span className="mr-1">⚠️</span>Este campo debe ser un correo electrónico válido</p>}
                    {errors?.type === "pattern" && <p className="small text-danger"><span className="mr-1">⚠️</span>Este campo debe tener un formato válido de {errors?.pattern?.value}</p>}
                    {errors?.type === "validate" && <p className="small text-danger"><span className="mr-1">⚠️</span>{errors?.message}</p>}
                </div>
            )}
        />
    );
};

export default InputText;