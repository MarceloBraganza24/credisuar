import { useEffect,useState,useContext } from "react";
import { Link, useNavigate } from 'react-router-dom'
import ItemBinContract from "./ItemBinContract.jsx";
import Spinner from "./Spinner";
import { toast } from "react-toastify";
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from './FetchWithAuth.jsx';

const Bin = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const { token } = useAuth(); // Usás el token desde el contexto
    const [selectedContracts, setSelectedContracts] = useState([]);
    const [selectAllContracts, setSelectAllContracts] = useState(false);
    const [user, setUser] = useState('');
    const [isLoadingContracts, setIsLoadingContracts] = useState(true);
    const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
    const [contracts, setContracts] = useState([]);
    const [loggingOut, setLoggingOut] = useState(false);
    const [totalContracts, setTotalContracts] = useState("");
    const navigate = useNavigate();
    const [menuOptions, setMenuOptions] = useState(false);
    const [inputFilteredContracts, setInputFilteredContracts] = useState('');
    const [pageInfo, setPageInfo] = useState({
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
    });   

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [pageInfo.page]);
    
    useEffect(() => {
        const delay = setTimeout(() => {
            fetchDeletedContracts(1, inputFilteredContracts, 'all');
        }, 300); // debounce

        return () => clearTimeout(delay);
    }, [inputFilteredContracts]);

    const formatToDatetimeLocal = (isoString) => {
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
    };

    const fetchDeletedContracts = async (page = 1, search = "",field = "") => {
        try {
            const response = await fetch(`${apiUrl}/api/contracts/deleted?page=${page}&search=${search}&field=${field}`);
            const contractsAll = await response.json();
            if (response.ok) {
                const formattedContracts = contractsAll.data.docs.map(contract => ({
                    ...contract,
                    transaction_date: formatToDatetimeLocal(contract.transaction_date)
                }));
                setContracts(formattedContracts);
                setTotalContracts(contractsAll.data.totalDocs)
                setPageInfo({
                    page: contractsAll.data.page,
                    totalPages: contractsAll.data.totalPages,
                    hasNextPage: contractsAll.data.hasNextPage,
                    hasPrevPage: contractsAll.data.hasPrevPage,
                    nextPage: contractsAll.data.nextPage,
                    prevPage: contractsAll.data.prevPage
                });
            } else {
                toast('Error al cargar contratos eliminados, intente nuevamente!', {
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
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoadingContracts(false)
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
                navigate("/")
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
        fetchDeletedContracts();
    }, []);

    const handleMassDeleteContracts = async () => {
        const confirm = window.confirm('¿Estás seguro que querés eliminar los contratos seleccionados permanentemente?');
        if (!confirm) return;

        try {
            const res = await fetch(`${apiUrl}/api/contracts/mass-delete-permanent`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedContracts })
            });

            const data = await res.json();
            if (res.ok) {
                setSelectedContracts([]);
                fetchDeletedContracts()
                toast('Contratos eliminados de manera permanente con éxito', {
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
            } 
        } catch (error) {
            console.error(error);
            toast('Error al eliminar contratos', {
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
        }
    };

    const handleMassRestoreContracts = async () => {
        const confirm = window.confirm('¿Estás seguro que querés restaurar los contratos seleccionados?');
        if (!confirm) return;

        try {
            const res = await fetch(`${apiUrl}/api/contracts/mass-restore`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedContracts })
            });

            const data = await res.json();
            if (res.ok) {
                setSelectedContracts([]);
                fetchDeletedContracts()
                toast('Contratos restaurados correctamente', {
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
            } 
        } catch (error) {
            console.error(error);
            toast('Error al restaurar contratos', {
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
        }
    };

    const handleSelectAllContracts = (checked) => {
        setSelectAllContracts(checked);

        if (checked) {
            const allIds = contracts.map(contract => contract._id);
            setSelectedContracts(allIds);
        } else {
            setSelectedContracts([]);
        }
    };

    useEffect(() => {
        setSelectAllContracts(selectedContracts.length === contracts.length && contracts.length > 0);
    }, [selectedContracts, contracts]);

    const toggleSelectTicket = (id) => {
        setSelectedContracts(prev =>
            prev.includes(id)
            ? prev.filter(pId => pId !== id)
            : [...prev, id]
        );
    };

    const btnShowMenuOptions = () => {
        if(menuOptions) {
            setMenuOptions(false)
        } else {
            setMenuOptions(true)
        }
    };

    const handleInputFilteredContracts = (e) => {
        const value = e.target.value;
        const soloLetrasYNumeros = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
        setInputFilteredContracts(soloLetrasYNumeros);
    }

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

            <div className="binContainer">

                <div className="binContainer__title">
                    <div className="binContainer__title__prop">Papelera</div>
                </div>

                <div className="binContainer__subTitle">
                    <div className="binContainer__subTitle__prop">Contratos eliminados</div>
                </div>

                <div className='binContainer__labelInputSearch'>Buscar contratos</div>

                <div className='binContainer__inputSearchContract'>
                    <input type="text" onChange={handleInputFilteredContracts} value={inputFilteredContracts} placeholder={`Buscar contrato`} className='binContainer__inputSearchContract__prop' name="" id="" />
                </div>

                {
                    contracts.length > 0 &&
                    <>
                        <div className='binContainer__massDeleteBtnContainer'>
                            <button
                            onClick={handleMassDeleteContracts}
                            className='binContainer__massDeleteBtnContainer__btn'
                            >
                            Eliminar permamentemente ({selectedContracts.length})
                            </button>
                            <button
                            onClick={handleMassRestoreContracts}
                            className='binContainer__massDeleteBtnContainer__btn'
                            >
                            Restaurar ({selectedContracts.length})
                            </button>
                        </div>

                        <div className='binContainer__quantityContracts'>
                            <div className="binContainer__quantityContracts__massDeleteBtnContainer">
                                <input
                                type="checkbox"
                                checked={selectAllContracts}
                                onChange={(e) => handleSelectAllContracts(e.target.checked)}
                                />
                                <span>Seleccionar todos</span>
                            </div>
                            <div className='binContainer__quantityContracts__prop'>Cantidad de contratos: {contracts.length}</div>        
                        </div>
                    </>
                }

                {
                    contracts.length != 0 &&

                    <>
                        <div className='binContainer__headerTableContainer'>

                            <div className="binContainer__headerTableContainer__headerTable">

                                <div className="binContainer__headerTableContainer__headerTable__item">&nbsp;</div>
                                <div className="binContainer__headerTableContainer__headerTable__item">N° transacción</div>
                                <div className="binContainer__headerTableContainer__headerTable__item">Fecha y hora transacción</div>
                                <div className="binContainer__headerTableContainer__headerTable__item">Nombre</div>
                                <div className="binContainer__headerTableContainer__headerTable__item">Apellido</div>
                                <div className="binContainer__headerTableContainer__headerTable__item">DNI</div>
                                <div className="binContainer__headerTableContainer__headerTable__item">Teléfono</div>
                                <div className="binContainer__headerTableContainer__headerTable__item">Archivo de contrato</div>
                                <div className="binContainer__headerTableContainer__headerTable__item">Imagen DNI</div>

                            </div>

                        </div>

                        <div className='binContainer__headerTableMobileContainer'>

                            <div className="binContainer__headerTableMobileContainer__headerTable">

                                <div className="binContainer__headerTableMobileContainer__headerTable__item">&nbsp;</div>
                                <div className="binContainer__headerTableMobileContainer__headerTable__item">N° transacción</div>
                                <div className="binContainer__headerTableMobileContainer__headerTable__item">Fecha y hora transacción</div>
                                <div className="binContainer__headerTableMobileContainer__headerTable__item">Apellido</div>
                                <div className="binContainer__headerTableMobileContainer__headerTable__item" style={{width:'100px'}}></div>

                            </div>

                        </div>
                    </>
                }

                <div className="binContainer__contractsTable">

                    {
                        isLoadingContracts ? 
                            <>
                                <div className="binContainer__contractsTable__isLoadingLabel">
                                    Cargando contratos&nbsp;&nbsp;<Spinner/>
                                </div>
                            </>
                        : contracts.length > 0 ?
                            contracts.map((contract) => (
                                <>
                                    <ItemBinContract
                                    contract={contract}
                                    fetchDeletedContracts={fetchDeletedContracts}
                                    selectedContracts={selectedContracts}
                                    setSelectedContracts={setSelectedContracts}
                                    apiUrl={apiUrl}
                                    />
                                </>
                                
                            ))
                        :
                        <>
                            <div className="binContainer__contractsTable__isLoadingLabel">
                                Aún no existen contratos eliminados
                            </div>
                        </>
                    }
                    {
                    
                        !isLoadingContracts && contracts.length > 0 &&
                        <div className='contractsContainer__btnsPagesContainer'>
                            <button className='contractsContainer__btnsPagesContainer__btn'
                                disabled={!pageInfo.hasPrevPage}
                                onClick={() => fetchDeletedContracts(pageInfo.prevPage, inputFilteredContracts, 'all')}
                                >
                                Anterior
                            </button>
                            
                            <span>Página {pageInfo.page} de {pageInfo.totalPages}</span>

                            <button className='contractsContainer__btnsPagesContainer__btn'
                                disabled={!pageInfo.hasNextPage}
                                onClick={() => fetchDeletedContracts(pageInfo.nextPage, inputFilteredContracts, 'all')}
                                >
                                Siguiente
                            </button>
                        </div>
                    }

                </div>

            </div>

        </>

    )
    
}

export default Bin