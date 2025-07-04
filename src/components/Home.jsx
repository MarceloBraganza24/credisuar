import {useState,useRef,useEffect} from 'react'
import { Link,useNavigate } from 'react-router-dom';
import Spinner from './Spinner';
import { toast } from 'react-toastify';

const Home = ({ openChatbot }) => {
    const [menuOptions, setMenuOptions] = useState(false);
    const [showFAQ, setShowFAQ] = useState(false);
    const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
    const [activeIndex, setActiveIndex] = useState(null);
    const faqRef = useRef(null);
    const whoWeAreRef = useRef(null);
    const [user, setUser] = useState('');
    const navigate = useNavigate();

    const [showSocialNetworks, setShowSocialNetworks] = useState(false);
    const socialRef = useRef(null);
    const [height, setHeight] = useState('0px');


    const preguntas = [
        {
            pregunta: '¿QUÉ ES UN ADELANTO CON TARJETA DE CRÉDITO?',
            respuesta:
            'Un adelanto con tarjeta de crédito es una operación en la que podés retirar dinero en efectivo utilizando el límite disponible de tu tarjeta de crédito, en lugar de usarla para comprar productos o servicios.',
        },
        {
            pregunta: '¿QUÉ TARJETAS SE ACEPTAN?',
            respuesta:
            'Aceptamos las principales tarjetas de crédito del mercado: Visa, Mastercard, Cabal, American Express, entre otras. Siempre podés consultar si tu tarjeta está habilitada para adelantos y en cuántas cuotas podés operar.',
        },
        {
            pregunta: '¿TIENE INTERESES UN ADELANTO CON TARJETA?',
            respuesta:
            'Sí, los adelantos tienen intereses más altos que una compra común. También puede haber comisiones por el servicio, dependiendo del banco.',
        },
        {
            pregunta: '¿EN CUÁNTAS CUOTAS PUEDO PAGAR UN ADELANTO?',
            respuesta:
            'Depende del banco, pero suelen ofrecer opciones como 1, 3, 6, 9 o 12 cuotas. Podés elegir según tu conveniencia, sabiendo que se aplican intereses.',
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
            const response = await fetch('http://localhost:8081/api/sessions/current', {
                method: 'GET',
                credentials: 'include', // MUY IMPORTANTE para enviar cookies
            });
            const data = await response.json();
            if(data.error === 'jwt must be provided') { 
                console.log('jwt must be provided')
            } else {
                const user = data.data;
                if(user) {
                    setUser(user)
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingCurrentUser(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const handleBtnLogOut = async () => {
        const response = await fetch(`http://localhost:8081/api/sessions/logout`, {
            method: 'POST',         
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // 👈 Esto es clave
        })
        const data = await response.json();
        if(response.ok) {
            toast('Gracias por visitar nuestra página', {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                className: "custom-toast",
            });
            setTimeout(() => {
                navigate('/')
                window.location.reload()
            }, 2000);
        }
    }

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
                    <div onClick={handleBtnLogOut} className='logoutLinkContainer__labelLogout'>SALIR</div>
                </div>
            }

            {
                user?.role == 'admin' &&
                <div className='menuContainer'>
                    <div onClick={btnShowMenuOptions} className='menuContainer__arrow'>v</div>
                    <div className={`menuContainer__menu ${menuOptions ? 'menuContainer__menu--active' : ''}`}>
                        <Link to={"/"} onClick={btnShowMenuOptions} className='menuContainer__menu__item'>
                        - Home
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
                    <img class="homeContainer__logoImg__prop" src="/src/assets/logo_credisuar.webp" alt="logo"/>
                </div>

                <div class="homeContainer__titleImg">
                    <img class="homeContainer__titleImg__prop" src="/src/assets/label_credisuar.webp" alt="logo"/>
                </div>

                <div class="homeContainer__label">
                    <div class="homeContainer__label__prop">CREDITOS CON TARJETA</div>
                </div>

                <div class="homeContainer__btnLogoWhap">

                    <div class="homeContainer__btnLogoWhap__btn">
                        <button onClick={openChatbot} class="homeContainer__btnLogoWhap__btn__prop">Solicitar ahora</button>
                    </div>

                    <div class="homeContainer__btnLogoWhap__logoWhap">
                        <img onClick={openChatbot} class="homeContainer__btnLogoWhap__logoWhap__prop" src="/src/assets/logo_whap.webp" alt="logo_whatsapp"/>
                    </div>

                </div>

            </div>

            <div class="separator">
                <div class="separator__prop"></div>
            </div>

            <div class="linksContainer">

                <div class="linksContainer__titleImg">
                    <img class="linksContainer__titleImg__prop" src="/src/assets/label_credisuar.webp" alt="logo"/>
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
                            <a href='https://wa.me/5492926507044' target="_blank" className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork">
                                <img
                                className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork__prop"
                                src="/src/assets/logo_whap_network.webp"
                                alt="logo_whap_network"
                                />
                            </a>
                            <a href='https://www.instagram.com/credisuar?igsh=MTNveWZoaHM0aDJ6Nw==' target="_blank" className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork">
                                <img
                                className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork__prop"
                                src="/src/assets/logo_insta_network.webp"
                                alt="logo_insta_network"
                                />
                            </a>
                            <a href='https://www.facebook.com/share/16pA7LVa3n/?mibextid=wwXIfr' target="_blank" className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork">
                                <img
                                className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork__prop"
                                src="/src/assets/logo_face_network.webp"
                                alt="logo_face_network"
                                />
                            </a>
                            <a href='https://www.tiktok.com/' target="_blank" className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork">
                                <img
                                className="linksContainer__items__socialNetworksContainer__socialNetworks__socialNetwork__prop"
                                src="/src/assets/logo_tiktok_network.webp"
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
                    <div className='whoWeAreContainer__whoWeAreText__prop'>En Credisuar, te damos acceso al dinero que necesitás, de forma 100% online y con tu tarjeta de crédito. <br/>  Somos una empresa argentina especializada en otorgar créditos rápidos, simples y seguros sin necesidad de trámites presenciales ni papeleos innecesarios</div>
                </div>

            </div>

        </>
    )

}

export default Home