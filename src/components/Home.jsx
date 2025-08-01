import React, {useState,useRef,useEffect}  from 'react'
import { Link,useNavigate } from 'react-router-dom';
import Spinner from './Spinner';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from './FetchWithAuth.jsx';

const Home = ({ openChatbot }) => {
    const { token } = useAuth(); // Usás el token desde el contexto
    const apiUrl = import.meta.env.VITE_API_URL;
    const [menuOptions, setMenuOptions] = useState(false);
    const [showFAQ, setShowFAQ] = useState(false);
    const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
    const [activeIndex, setActiveIndex] = useState(null);
    const faqRef = useRef(null);
    const whoWeAreRef = useRef(null);
    const [user, setUser] = useState('');
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);


    const [showSocialNetworks, setShowSocialNetworks] = useState(false);
    const socialRef = useRef(null);
    const [height, setHeight] = useState('0px');


    const preguntas = [
        {
            pregunta: '¿QUÉ ES UN ADELANTO CON TARJETA DE CRÉDITO?',
            respuesta:
            'Es una operación financiera en la que se utiliza el límite disponible de tu tarjeta de crédito para obtener dinero en efectivo. Ese dinero se transfiere a tu cuenta y lo devolvés en cuotas.',
        },
        {
            pregunta: '¿QUIÉNES PUEDEN ACCEDER AL ADELANTO?',
            respuesta:
            'Cualquier persona mayor de 18 años que tenga una tarjeta de crédito vigente, con cupo disponible y buen historial crediticio. No hace falta ser cliente bancario.',
        },
        {
            pregunta: '¿QUÉ TARJETAS SE ACEPTAN?',
            respuesta:
            'Se aceptan la mayoría de las tarjetas de crédito del mercado: Visa, Mastercard, American Express, Cabal, Naranja, Diners, entre otras.',
        },
        {
            pregunta: '¿QUÉ DOCUMENTACIÓN NECESITO?',
            respuesta: 'Solo necesitás foto del DNI(frente) y CBU o alias de tu cuenta.'
        },
        {
            pregunta: '¿CÓMO SE REALIZA EL ADELANTO?',
            respuesta: 'Una vez verificada tu tarjeta, se procesa la transacción en cuotas, y el dinero se transfiere a tu cuenta bancaria(CBU/alias) en el momento.'
        },
        {
            pregunta: '¿CUÁNTAS CUOTAS SE PUEDE FINANCIAR?',
            respuesta: 'Generalmente se ofrece entre 6 a 12 cuotas fijas. El plan depende de tu tarjeta y la entidad que procese el adelanto.'
        },
        {
            pregunta: '¿QUÉ COSTO TIENE?',
            respuesta: 'Se cobra una comisión por gestión y uso de pasarela de pago, que ya está incluida en el valor de las coutas. No hay gastos ocultos. Se informa todo por adelantado.'
        },
        {
            pregunta: '¿CÓMO SÉ CUÁNTO PUEDO PEDIR?',
            respuesta: 'El monto disponible depende del cupo en cuotas que tengas en tu tarjeta. Por ejemplo, si tenés $600.000 en cupo, podés pedir un adelanto de hasta ese valor en cuotas.'
        },
        {
            pregunta: '¿A QUÉ CUENTA SE TRANSFIERE EL DINERO?',
            respuesta: 'El dinero se transfiere a tu cuenta bancaria personal, que puede ser de cualquier banco o billetera virtual(Mercado Pago,Ualá,Brubank, etc.). Solo necesitás tu CBU o alias.'
        },
        {
            pregunta: '¿PUEDO CANCELAR EL ADELANTO DESPUÉS DE INICIADO?',
            respuesta: 'No, una vez procesada la operación y transferido el dinero, no puede anularse, ya que se genera una obligación de pago con la tarjeta.'
        },
        {
            pregunta: '¿PUEDO TENER MÁS DE UN ADELANTO A LAS VEZ?',
            respuesta: 'Sí, podés gestionar múltiples adelantos mientras tengas cupo disponible y no tengas operaciones pendientes sin pagar.'
        },
        {
            pregunta: '¿CÓMO SÉ QUE ES SEGURO?',
            respuesta: 'Las operaciones se procesan a través de pasarelas de pago oficiales, con token de seguridad, y sin almacenar datos sensibles. Todo se informa paso a paso.'
        },
    ];

    useEffect(() => {
        if (faqRef.current) {
            // Le damos un pequeño delay para asegurar que el DOM se haya actualizado con la respuesta abierta
            setTimeout(() => {
            faqRef.current.style.maxHeight = showFAQ ? `${faqRef.current.scrollHeight}px` : '0px';
            }, 100); // Delay de 100ms, ajustable
        }
    }, [showFAQ, activeIndex]);
    
    const toggleQuestion = (index) => {
        setActiveIndex(prev => (prev === index ? null : index));
    };

    const handleBtnWhoWeAre = () => {
        whoWeAreRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleSocialNetworks = () => {
        setShowSocialNetworks(prev => !prev);
    };

    const btnShowMenuOptions = () => {
        if(menuOptions) {
            setMenuOptions(false)
        } else {
            setMenuOptions(true)
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/sessions/current`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`, // ⬅️ ¡Acá va el JWT!
            },
            });

            const data = await response.json();

            if (response.ok) {
                const user = data.data; // si usás res.sendSuccess(user)
                if (user) {
                    setUser(user);
                }
            } else {
                console.log('Error al obtener el usuario:', data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingCurrentUser(false);
        }
    }

    useEffect(() => {
        fetchCurrentUser();
        window.scrollTo(0, 0);
    }, []);

   const handleBtnLogOut = async () => {
        setLoggingOut(true);
        const response = await fetchWithAuth('/api/sessions/logout', {
            method: 'POST',
        });

        if (response) {
            toast('Gracias por visitar nuestra página', {
                position: "top-right",
                autoClose: 1500,
                theme: "dark",
                className: "custom-toast",
            });
            localStorage.removeItem("token");
            setTimeout(() => {
                navigate('/');
                window.location.reload();
            }, 2000);
        }
    };


    return (

        <>

            
            {
                loadingCurrentUser ?
                <div className='logoutLinkContainer'>
                    <div className='logoutLinkContainer__labelLogout'>
                        <Spinner/>
                    </div>
                </div>
                :
                !user ?
                <div className='loginLinkContainer'>
                    <Link to={"/login"} className='loginLinkContainer__labelLogin'>
                        Iniciar sesión
                    </Link>
                </div>
                :
                <div className='logoutLinkContainer'>
                    <div
                        onClick={loggingOut ? null : handleBtnLogOut}
                        className='logoutLinkContainer__labelLogout'
                    >
                        {loggingOut ? <span className="spinner" /> : "SALIR"}
                    </div>
                </div>
            }

            {
                user?.role == 'admin' &&
                <div className='menuContainer'>
                    <div onClick={btnShowMenuOptions} className='menuContainer__arrow'>v</div>
                    <div className={`menuContainer__menu ${menuOptions ? 'menuContainer__menu--active' : ''}`}>
                        <Link to={"/"} onClick={btnShowMenuOptions} className='menuContainer__menu__item'>
                        - Inicio
                        </Link>
                        <Link to={"/contracts"} onClick={btnShowMenuOptions} className='menuContainer__menu__item'>
                        - Contratos
                        </Link>
                        <Link to={"/bin"} onClick={btnShowMenuOptions} className='menuContainer__menu__item'>
                            - Papelera
                        </Link>
                        <Link to={"/cPanel"} onClick={btnShowMenuOptions} className='menuContainer__menu__item'>
                            - Panel de control
                        </Link>
                    </div>
                </div>
            }
            <div class="homeContainer">

                <div class="homeContainer__logoImg">
                    <img class="homeContainer__logoImg__prop" src="/logo_credisuar.webp" alt="logo"/>
                </div>

                <div class="homeContainer__titleImg">
                    <img class="homeContainer__titleImg__prop" src="/label_credisuar.webp" alt="logo"/>
                </div>

                <div class="homeContainer__label">
                    <div class="homeContainer__label__prop">CREDITOS CON TARJETA</div>
                </div>

                <div class="homeContainer__btnLogoWhap">

                    <div class="homeContainer__btnLogoWhap__btn">
                        <button onClick={openChatbot} class="homeContainer__btnLogoWhap__btn__prop">Solicitar ahora</button>
                    </div>

                    <div class="homeContainer__btnLogoWhap__logoWhap">
                        <img onClick={openChatbot} class="homeContainer__btnLogoWhap__logoWhap__prop" src="/logo_whap.webp" alt="logo_whatsapp"/>
                    </div>

                </div>

            </div>

            <div class="separator">
                <div class="separator__prop"></div>
            </div>

            <div class="linksContainer">

                <div class="linksContainer__titleImg">
                    <img class="linksContainer__titleImg__prop" src="/label_credisuar.webp" alt="logo"/>
                </div>

                <div class="linksContainer__label">
                    <div class="linksContainer__label__prop">TU MANO AMIGA</div>
                </div>

                <div class="linksContainer__items">

                    <div className="linksContainer__items__itemBtn">
                        <button
                        onClick={() => {
                            setShowFAQ(!showFAQ);
                            setActiveIndex(null);
                        }}
                        className="linksContainer__items__itemBtn__btn"
                        >
                        PREGUNTAS FRECUENTES
                        </button>
                    </div>

                    <div
                        className={`faq-container ${showFAQ ? 'open' : ''}`}
                        ref={faqRef}
                    >
                        {preguntas.map((item, index) => (
                        <div className="linksContainer__items__frequentlyAskedQuestions" key={index}>
                            <div
                            onClick={() => toggleQuestion(index)}
                            className={
                                index % 2 === 0
                                ? 'linksContainer__items__frequentlyAskedQuestions__frequentlyAskedQuestionGradient'
                                : 'linksContainer__items__frequentlyAskedQuestions__frequentlyAskedQuestion'
                            }
                            >
                            {item.pregunta}
                            </div>

                            <div
                            className={`linksContainer__items__frequentAnswers__frequentAnswerContainer ${
                                activeIndex === index ? 'active' : ''
                            }`}
                            >
                                <div className="linksContainer__items__frequentAnswers__frequentAnswer">
                                    {item.respuesta}
                                </div>
                            </div>  
                        </div>
                        ))}
                    </div>

                    <div class="linksContainer__items__itemBtn">
                        <button onClick={handleBtnWhoWeAre} class="linksContainer__items__itemBtn__btn">¿QUIÉNES SOMOS?</button>
                    </div>

                    <div className="linksContainer__items__itemBtn">
                        <button
                        onClick={toggleSocialNetworks}
                        className="linksContainer__items__itemBtn__btn"
                        >
                        NUESTRAS REDES
                        </button>
                    </div>

                    <div
                        ref={socialRef}
                        className='linksContainer__items__socialNetworksContainer'
                    >
                        <div className="linksContainer__items__socialNetworksContainer__socialNetworks">
                            <a onClick={openChatbot} className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork">
                                <img
                                className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork__prop"
                                src="/logo_whap_network.webp"
                                alt="logo_whap_network"
                                />
                            </a>
                            <a href='https://www.instagram.com/credisuar?igsh=MTNveWZoaHM0aDJ6Nw==' target="_blank" className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork">
                                <img
                                className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork__prop"
                                src="/logo_insta_network.webp"
                                alt="logo_insta_network"
                                />
                            </a>
                            <a href='https://www.facebook.com/share/16pA7LVa3n/?mibextid=wwXIfr' target="_blank" className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork">
                                <img
                                className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork__prop"
                                src="/logo_face_network.webp"
                                alt="logo_face_network"
                                />
                            </a>
                            <a href='https://www.tiktok.com/' target="_blank" className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork">
                                <img
                                className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork__prop"
                                src="/logo_tiktok_network.webp"
                                alt="logo_tiktok_network"
                                />
                            </a>
                        </div>
                    </div>

                </div>

            </div>

            <div class="separator">
                <div class="separator__prop"></div>
            </div>

            <div ref={whoWeAreRef} class="whoWeAreContainer">

                <div class="whoWeAreContainer__headerImg"></div>

                <div class="whoWeAreContainer__whoWeAreText">
                    <div className='whoWeAreContainer__whoWeAreText__prop'>En Credisuar, te damos acceso al dinero que necesitás, de forma 100% online y con tu tarjeta de crédito. <br/>  Somos una empresa argentina especializada en otorgar créditos rápidos, simples y seguros sin necesidad de trámites presenciales ni papeleos innecesarios.</div>
                </div>

            </div>

        </>
    )

}

export default Home