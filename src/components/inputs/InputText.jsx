

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
                    {errors?.type === "required" && <p className="small text-danger"><span className="mr-1">⚠️</span>This field is required</p>}
                    {errors?.type === "min" && <p className="small text-danger"><span className="mr-1">⚠️</span>The value of the {name} is less than required</p>}
                    {errors?.type === "max" && <p className="small text-danger"><span className="mr-1">⚠️</span>The value of the {name} is greater than allowed</p>}
                    {errors?.type === "minLength" && <p className="small text-danger"><span className="mr-1">⚠️</span>This field must have at least {errors?.minLength?.value} characters</p>}
                    {errors?.type === "email" && <p className="small text-danger"><span className="mr-1">⚠️</span>This field must be a valid email</p>}
                    {errors?.type === "pattern" && <p className="small text-danger"><span className="mr-1">⚠️</span>This field must be a valid {errors?.pattern?.value}</p>}
                    {errors?.type === "validate" && <p className="small text-danger"><span className="mr-1">⚠️</span>{errors?.message}</p>}
                </div>
            )}
        />
    );
};

export default InputText;