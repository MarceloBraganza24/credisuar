import {useEffect,useState} from 'react'
import { Link,useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const SignIn = () => {
    const navigate = useNavigate();
    const [isLoadingSignIn, setIsLoadingSignIn] = useState(true);
    const [credentials, setCredentials] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        
        if ((name === "first_name" || name === "last_name") && !/^[a-zA-Z\s]*$/.test(value)) {
          return; // No actualiza el estado si el valor tiene caracteres no permitidos
        }
        setCredentials({ ...credentials, [name]: value });
    };

    const validateForm = () => {
        const { first_name,last_name,email,password } = credentials;
    
        if (!first_name.trim() || !last_name.trim() || !email.trim() || !password.trim()) {
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
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const currentDate = `${year}-${month}-${day} ${hours}:${minutes}`;
        const user_datetime = currentDate;
        e.preventDefault();
        if (!validateForm()) return;
        try {
            const response = await fetch(`http://localhost:8081/api/sessions/singIn`, {
                method: 'POST',         
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: credentials.first_name,
                    last_name: credentials.last_name,
                    email: credentials.email,
                    password: credentials.password,
                    user_datetime
                })
            })
            const data = await response.json();
            if (response.ok) {
                navigate("/login");
                toast('Te has registrado exitosamente!', {
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
            if(data.error === 'There is already a user with that email') {
                toast('Ya existe un usuario con ese email!', {
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
            setIsLoadingSignIn(false)
        }, 1000);
    }, []);

    if (isLoadingSignIn) {
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
                            <div className='loginContainer__formContainer__form__title__prop'>Registro de usuario</div>
                        </div>

                        <div className='loginContainer__formContainer__form__input'>
                            <input className='loginContainer__formContainer__form__input__prop' type="text" value={credentials.first_name} onChange={handleChange} placeholder='Nombre' name="first_name" id="" />
                        </div>

                        <div className='loginContainer__formContainer__form__input'>
                            <input className='loginContainer__formContainer__form__input__prop' type="text" value={credentials.last_name} onChange={handleChange} placeholder='Apellido' name="last_name" id="" />
                        </div>

                        <div className='loginContainer__formContainer__form__input'>
                            <input className='loginContainer__formContainer__form__input__prop' type="email" value={credentials.email} onChange={handleChange} placeholder='Email' name="email" id="" />
                        </div>

                        <div className='loginContainer__formContainer__form__input'>
                            <input className='loginContainer__formContainer__form__input__prop' type="password" value={credentials.password} onChange={handleChange} placeholder='Contraseña' name="password" id="" />
                        </div>

                        <div className='loginContainer__formContainer__form__btn'>
                            <button onClick={handleSubmit} className='loginContainer__formContainer__form__btn__prop'>Registrarse</button>
                            <Link to={"/logIn"} className='loginContainer__formContainer__form__btn__prop'>
                                Iniciar sesión
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
                        <div className='loginContainer__logoContainer__phrase__prop'>"Registra tu cuenta y disfruta de una experiencia única con nuestros productos financieros especialmente para ti"</div>
                    </div>

                </div>  

            </div>  

        </>

    )

}

export default SignIn