import {useEffect,useState,useContext} from 'react'
import { Link,useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const Login = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [storeSettings, setStoreSettings] = useState({});
    const [isLoadingLogin, setIsLoadingLogin] = useState(true);
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const validateForm = () => {
        const { email, password } = credentials;
    
        if (!email.trim() || !password.trim()) {
            toast('Debes completar todos los campos!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                className: "custom-toast",
            });          
            return false;
        }
    
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
    
        try {
            const response = await fetch(`${apiUrl}/api/sessions/login`, {
                method: 'POST',         
                credentials: 'include', // 👈 necesario para recibir cookies
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                })
            })
            const data = await response.json();
            if (response.ok) {
                navigate("/");
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
            }
            if(data.error === 'incorrect credentials') {
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
            }
        } catch (error) {
          console.error('Error:', error);
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
                                <input className='loginContainer__formContainer__form__inputContainer__input__prop' type="text" value={credentials.email} onChange={handleChange} placeholder='Email' name="email" id="" />
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
                            <button onClick={handleSubmit} className='loginContainer__formContainer__form__btn__prop'>Iniciar sesión</button>
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
                        src="/src/assets/logo_credisuar.webp"
                        alt="logo_tienda"
                        />
                    </div>  

                    <div className='loginContainer__logoContainer__phrase'>
                        <div className='loginContainer__logoContainer__phrase__prop'>"Ingresa a tu cuenta y disfruta de una experiencia única con nuestros productos financieros especialmente para ti"</div>
                    </div>

                </div>  

            </div>  

        </>

    )

}

export default Login