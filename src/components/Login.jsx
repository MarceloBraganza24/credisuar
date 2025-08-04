import {useEffect,useState,useContext} from 'react'
import { Link,useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isLoadingLogin, setIsLoadingLogin] = useState(true);
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(credentials.email, credentials.password);
        if (success) {
            navigate('/');
            toast('Bienvenido, has iniciado sesion con éxito!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                className: "custom-toast",
            });
        } else {
            toast('Alguno de los datos ingresados es incorrecto. Inténtalo nuevamente!', {
                position: "top-right",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                className: "custom-toast",
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            setIsLoadingLogin(false)
        }, 1000);
    }, []);

    if (isLoadingLogin) {
        return (
            <div className="loadingContainer">
                <Spinner/>
            </div>
        );
    }

    return (

        <>

            <div className='loginContainer'>

                <div className='loginContainer__formContainer'>

                    <div className='loginContainer__formContainer__form'>

                        <div className='loginContainer__formContainer__form__title'>
                            <div className='loginContainer__formContainer__form__title__prop'>Inicio de sesión</div>
                        </div>

                        <div className='loginContainer__formContainer__form__inputContainer'>
                            <div className='loginContainer__formContainer__form__inputContainer__input'>
                                <input className='loginContainer__formContainer__form__inputContainer__input__prop' type="email" value={credentials.email} onChange={handleChange} placeholder='Email' name="email" id="" />
                            </div>
                        </div>
                        
                        <div className='loginContainer__formContainer__form__inputPassContainer'>
                            <div className='loginContainer__formContainer__form__inputPassContainer__inputPass'>
                                <input
                                    className='loginContainer__formContainer__form__inputPassContainer__inputPass__prop'
                                    type={passwordVisible ? 'text' : 'password'}
                                    placeholder='Contraseña'
                                    name="password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    />
                            </div>
                            <div className='loginContainer__formContainer__form__inputPassContainer__inputPassEye'>
                                <button
                                    type="button"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    className='loginContainer__formContainer__form__inputPassContainer__inputPassEye__propEye'
                                    >
                                    {passwordVisible ? '👁️' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className='loginContainer__formContainer__form__btn'>
                            <button
                            onClick={handleSubmit}
                            className='loginContainer__formContainer__form__btn__prop'
                            disabled={loading}
                            >
                            {loading ? (
                                <Spinner/>
                            ) : (
                                "Iniciar sesión"
                            )}
                            </button>

                            <Link to={"/sendMail"} className='loginContainer__formContainer__form__forgotPass'>
                                ¿Olvidaste tu contraseña? Has click aquí
                            </Link>
                        </div>

                    </div>

                </div>

                <div className='loginContainer__logoContainer'>

                    <div className='loginContainer__logoContainer__title'>
                        <div className='loginContainer__logoContainer__title__prop'>Bienvenidos/as a "Credisuar"</div>
                    </div>

                    <div className='loginContainer__logoContainer__logo'>
                        <img
                        className='loginContainer__logoContainer__logo__prop'
                        src="/logo_credisuar.webp"
                        alt="logo_tienda"
                        />
                    </div>  

                </div>  

            </div>  

        </>

    )

}

export default Login