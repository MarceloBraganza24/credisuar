import { useEffect,useState,useContext } from "react";
import { Link, useNavigate } from 'react-router-dom'
import ItemBinContract from "./ItemBinContract.jsx";
import Spinner from "./Spinner";
import { toast } from "react-toastify";

const Bin = () => {
    const [selectedContracts, setSelectedContracts] = useState([]);
    const [selectAllContracts, setSelectAllContracts] = useState(false);
    const [user, setUser] = useState('');
    const [isLoadingContracts, setIsLoadingContracts] = useState(true);
    const [contracts, setContracts] = useState([]);
    const navigate = useNavigate();
    const [menuOptions, setMenuOptions] = useState(false);

    const fetchDeletedContracts = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/contracts/deleted');
            const data = await response.json();
            if (response.ok) {
                setContracts(data.payload);
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
            const response = await fetch('http://localhost:8081/api/sessions/current', {
                method: 'GET',
                credentials: 'include', // MUY IMPORTANTE para enviar cookies
            });
            const data = await response.json();
            if(data.error === 'jwt must be provided') { 
                navigate('/')
                setUser(null)
            } else {
                const user = data.data
                if(user) {
                    setUser(user)
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    /* useEffect(() => {
        if (user?.isLoggedIn) {
            setShowLogOutContainer(true);
        } else {
            setShowLogOutContainer(false);
        }
    }, [user]); */

    useEffect(() => {
        fetchCurrentUser();
        fetchDeletedContracts();
    }, []);

    const handleMassDeleteContracts = async () => {
        const confirm = window.confirm('¿Estás seguro que querés eliminar los contratos seleccionados permanentemente?');
        if (!confirm) return;

        try {
            const res = await fetch('http://localhost:8081/api/contracts/mass-delete-permanent', {
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
            const res = await fetch('http://localhost:8081/api/contracts/mass-restore', {
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

    return (

        <>

            {
                user.role == 'admin' &&
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
                    </div>
                </div>
            }

            <div className="binContainer">

                <div className="binContainer__title">
                    <div className="binContainer__title__prop">Papelera</div>
                </div>

                <div className="binContainer__subTitle">
                    <div className="binContainer__subTitle__prop">Contratos eliminados:</div>
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
                    <div className='binContainer__headerTableContainer'>

                        <div className="binContainer__headerTableContainer__headerTable">

                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}></div>
                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>N° transacción</div>
                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Nombre</div>
                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Apellido</div>
                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>DNI</div>
                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Teléfono</div>
                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Archivo de contrato</div>
                            <div className="binContainer__headerTableContainer__headerTable__item" style={{borderRight:'0.3vh solid black'}}>Imagen DNI</div>

                        </div>

                    </div>
                }

                <div className="binContainer__contractsTable">

                    {
                        isLoadingContracts ? 
                            <>
                                <div className="catalogContainer__grid__catalog__isLoadingLabel">
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
                                    />
                                </>
                                
                            ))
                        :
                        <>
                            <div className="catalogContainer__grid__catalog__isLoadingLabel">
                                Aún no existen contratos eliminados
                            </div>
                        </>
                    }

                </div>

            </div>

        </>

    )
    
}

export default Bin