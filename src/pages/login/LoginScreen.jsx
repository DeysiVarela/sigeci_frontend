import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import InputEmail from "../../components/inputs/InputEmail";
import InputText from "../../components/inputs/InputText";
import ButtonPrimary from "../../components/buttons/ButtonPrimary";
import HandlerApp from "../../utils/HandlerApp";

const LoginScreen = () => {

    const nav = useNavigate();
    const handlerApp = HandlerApp();

    const {control, handleSubmit, formState: { errors }} = useForm();


    const submitData = (data)=>{
        handlerApp.setLoader(true);
        console.log("simulando envio de datos", data);

        setTimeout((nav)=>{
            console.log("recibi datos de backend")
            nav("/home");
            handlerApp.setLoader(false);
        }, 2000, nav)

        console.log("esto se ejecuta en paralelo");
    }
    

    return (
        <div className="login-page bg-body-secondary">
            <main className="login-box">
                <h1 className="login-logo">
                    {import.meta.env.VITE_PROJECT_NAME}
                </h1>
                <div className="card">
                    <div className="card-body login-card-body">
                        <p className="login-box-msg">Sign in to start your session</p>

                        <form>
                            <InputEmail
                                control={control}
                                label="Email"
                                name="email"
                                errors={errors.email}
                                required={true}
                            />
                            <InputText
                                control={control}
                                label="edad"
                                name="edad"
                                rules={{min: 18, max: 100}}
                                errors={errors.edad}
                                required={true}
                            />

                            <label className="visually-hidden" htmlFor="loginPassword">Password</label>
                            <div className="input-group mb-3">
                                <input
                                    id="loginPassword"
                                    type="password"
                                    className="form-control"
                                    placeholder="Password"
                                    name="pass"
                                />
                                <div className="input-group-text">
                                    <span className="bi bi-lock-fill"></span>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-8">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexCheckDefault"> Remember Me </label>
                                    </div>
                                </div>
                            </div>
                            <ButtonPrimary label="Login" className="w-100" onClick={handleSubmit(submitData)}/>
                        </form>

                        <div className="social-auth-links text-center d-grid gap-2">
                            <a href="#" className="btn btn-danger">
                                <i className="bi bi-google me-2"></i>Login with Google
                            </a>
                        </div>


                        <p className="mb-1">
                            <a href="forgot-password.html">I forgot my password</a>
                        </p>
                        <p className="mb-0">
                            <a href="register.html" className="text-center"> Register a new membership </a>
                        </p>
                    </div>
                </div>
            </main>
        </div>  
    );
};

export default LoginScreen;