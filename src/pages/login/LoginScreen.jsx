import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import InputEmail from "../../components/inputs/InputEmail";
import InputPassword from "../../components/inputs/InputPassword";
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
            nav("/");
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
                            <InputPassword
                                control={control}
                                label="Password"
                                name="pass"
                                placeholder="Password"
                                errors={errors.pass}
                                required={true}
                            />

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