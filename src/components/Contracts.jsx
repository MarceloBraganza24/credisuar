import {useEffect, useState} from 'react'
import { Link,useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import CreateContractModal from './CreateContractModal';
import UpdateContractModal from './UpdateContractModal';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from './FetchWithAuth.jsx';

const Contracts = () => {
    const { token } = useAuth(); // Usás el token desde el contexto
    const apiUrl = import.meta.env.VITE_API_URL;
    const [selectAllContracts, setSelectAll] = useState(false);
    const [selectedContracts, setSelectedContracts] = useState([]);
    const navigate = useNavigate();
    const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
    const [inputFilteredContracts, setInputFilteredContracts] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedPreview, setSelectedPreview] = useState(null); // { type: 'image' | 'pdf' | 'doc', url: string }
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [menuOptions, setMenuOptions] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [isLoadingContracts, setIsLoadingContracts] = useState(true);
    const [isOpenCreateContractModal, setIsOpenCreateContractModal] = useState(false);
    const [isOpenUpdateContractModal, setIsOpenUpdateContractModal] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [totalContracts, setTotalContracts] = useState("");
    const [totalPerPageContracts, setTotalPerPageContracts] = useState("");
    const [user, setUser] = useState('');
    const [loadingContractId, setLoadingContractId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [pageInfo, setPageInfo] = useState({
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
    });   

    const [contractFormData, setContractFormData] = useState({
        transaction_number: '',
        transaction_date: '',
        first_name: '',
        last_name: '',
        dni: '',
        phoneNumber: '',
        contract_file: null,
        contract_file_preview: '',
        image_dni: null,
        image_dni_preview: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContractFormData({
            ...contractFormData,
            [name]: value
        });
    };
    
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];

        if (!file) return;

        // Validaciones por tipo de archivo
        if (name === 'contract_file') {
            const validContractTypes = [
                'application/pdf',
                'application/msword', // .doc
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
            ];
            if (!validContractTypes.includes(file.type)) {
                toast('El archivo de contrato debe ser PDF o DOC/DOCX.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                return;
            }
        }
        
        if (name === 'image_dni') {
            const fileType = file.type;

            const updatedForm = {
                ...contractFormData,
                image_dni: file,
                image_dni_preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : file.name,
            };
            setContractFormData(updatedForm);
        }


        const updatedForm = {
            ...contractFormData,
            [name]: file,
        };

        if (name === 'contract_file') {
            updatedForm.contract_file_preview = file.name;
        } else if (name === 'image_dni') {
            updatedForm.image_dni_preview = URL.createObjectURL(file);
        }

        setContractFormData(updatedForm);
    };

    /* const handleBtnLogOut = async () => {
        const response = await fetch(`${apiUrl}/api/sessions/logout`, {
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
    } */
    const handleBtnLogOut = async () => {
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

    const formatToDatetimeLocal = (isoString) => {
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
    };

    const fetchContracts = async (page = 1, search = "",field = "", selectedDate = null) => {
        try {
            const response = await fetch(`${apiUrl}/api/contracts/byPage?page=${page}&search=${search}&field=${field}&selectedDate=${selectedDate}`)
            const contractsAll = await response.json();
            if(response.ok) {
                const formattedContracts = contractsAll.data.docs.map(contract => ({
                    ...contract,
                    transaction_date: formatToDatetimeLocal(contract.transaction_date)
                }));
                setContracts(formattedContracts);
                setTotalContracts(contractsAll.data.totalContracts)
                setTotalPerPageContracts(contractsAll.data.totalDocs)
                setPageInfo({
                    page: contractsAll.data.page,
                    totalPages: contractsAll.data.totalPages,
                    hasNextPage: contractsAll.data.hasNextPage,
                    hasPrevPage: contractsAll.data.hasPrevPage,
                    nextPage: contractsAll.data.nextPage,
                    prevPage: contractsAll.data.prevPage
                });
            } else {
                toast('Error al cargar contratos', {
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
            console.error('Error al obtener datos:', error);
            toast('Error al obtener datos', {
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
        } finally {
            setIsLoadingContracts(false)
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [pageInfo.page]);

    const handleBtnSubmitContract = async () => {
        // Validación de campos vacíos
        if (
            !contractFormData.transaction_number.trim() ||
            !contractFormData.transaction_date ||
            !contractFormData.first_name.trim() ||
            !contractFormData.last_name.trim() ||
            !contractFormData.dni.trim() ||
            !contractFormData.phoneNumber.trim() ||
            !contractFormData.contract_file ||
            !contractFormData.image_dni
        ) {
            toast('Por favor, completá todos los campos y cargá los archivos requeridos.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }

         // Validar tipo de contrato (solo .pdf, .doc, .docx)
        const validContractTypes = [
            'application/pdf',
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
        ];

        if (!validContractTypes.includes(contractFormData.contract_file.type)) {
            toast('El archivo de contrato debe ser PDF, DOC o DOCX.', {
                position: "top-right",
                autoClose: 3000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }

        // Validar imagen del DNI (solo .jpg, .jpeg, .png)
        const validImageTypes = ['image/jpeg', 'image/png'];

        if (!validImageTypes.includes(contractFormData.image_dni.type)) {
            toast('La imagen del DNI debe ser JPG, JPEG o PNG.', {
                position: "top-right",
                autoClose: 3000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }
        
        const formDataToSend = new FormData();
        formDataToSend.append('transaction_number', contractFormData.transaction_number);
        formDataToSend.append('transaction_date', contractFormData.transaction_date);
        formDataToSend.append('first_name', contractFormData.first_name);
        formDataToSend.append('last_name', contractFormData.last_name);
        formDataToSend.append('dni', contractFormData.dni);
        formDataToSend.append('phoneNumber', contractFormData.phoneNumber);
        formDataToSend.append('contract_file', contractFormData.contract_file);
        formDataToSend.append('image_dni', contractFormData.image_dni);

        try {
            const response = await fetch(`${apiUrl}/api/contracts`, {
                method: 'POST',
                body: formDataToSend,
            });
            if (response.ok) {
                toast('Contrato creado exitosamente!', {
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
                setContractFormData({
                    transaction_number: '',
                    transaction_date: '',
                    first_name: '',
                    last_name: '',
                    dni: '',
                    phoneNumber: '',
                    contract_file: null,
                    contract_file_preview: '',
                    image_dni: null,
                    image_dni_preview: ''
                });
                fetchContracts(1, inputFilteredContracts, 'all', formatDateToString(selectedDate))
            } else {
                toast('Error al crear el contrato!', {
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
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            toast(`Error al enviar los datos`, {
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
    };

    const handleContractFieldChange = (index, field, value) => {
        const updatedContracts = [...contracts];
        updatedContracts[index][field] = value;
        setContracts(updatedContracts);
    };

    const handleContractFileChange = (index, field, file) => {
        const updatedContracts = [...contracts];
        updatedContracts[index][field] = file;

        if (file) {
            if (file.type.startsWith("image/")) {
                updatedContracts[index][`${field}_preview`] = URL.createObjectURL(file);
            } else if (file.type === "application/pdf") {
                updatedContracts[index][`${field}_preview`] = file.name; // mostramos solo el nombre
            }
        }

        setContracts(updatedContracts);
    };


    const handleSaveContract = async (id, updatedContract) => {

        const formData = new FormData();

        for (const key in updatedContract) {
            if (key.endsWith('_preview')) continue; // saltar previews

            const value = updatedContract[key];

            if (value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value ?? '');

                // Si es uno de los campos de archivo y no fue reemplazado, mandamos la ruta existente como auxiliar
                if ((key === 'contract_file' || key === 'image_dni') && value) {
                    formData.append(`existing_${key}`, value); // Manda la ruta antigua
                }
            }
        }

        try {
            const response = await fetch(`${apiUrl}/api/contracts/${id}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                toast(`Contrato actualizado con éxito!`, {
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
                fetchContracts(1, inputFilteredContracts, 'all', formatDateToString(selectedDate));
            } else {
                toast(`Error al actualizar contrato!`, {
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
        } catch (error) {
            console.error(error);
            toast(`Error de conexión al actualizar!`, {
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
    };
    
    const handleBtnDeleteContract = async (contractId) => {
        setLoadingContractId(contractId);
        try {
            const res = await fetch(`${apiUrl}/api/contracts/${contractId}/soft-delete`, {
                method: 'PUT',  // Usamos PUT o PATCH para actualizar, no DELETE
            });

            if (res.ok) {
                toast('Has eliminado el contrato con éxito (soft delete)', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchContracts(1, inputFilteredContracts, 'all', formatDateToString(selectedDate))
                //setSelectedContracts([])
            } else {
                toast('No se ha podido borrar el contrato, intente nuevamente', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingContractId(null);
        }
    };

    const btnShowMenuOptions = () => {
        if(menuOptions) {
            setMenuOptions(false)
        } else {
            setMenuOptions(true)
        }
    };

    /* const fetchCurrentUser = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/sessions/current`, {
                method: 'GET',
                credentials: 'include', // MUY IMPORTANTE para enviar cookies
            });
            const data = await response.json();
            if(data.error === 'jwt must be provided') { 
                navigate('/')
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
    }; */
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
        fetchContracts(1, inputFilteredContracts, 'all', formatDateToString(selectedDate));
        fetchCurrentUser()
        return () => {
            contracts.forEach(contract => {
                if (contract.dni_image_preview && contract.dni_image_preview.startsWith('blob:')) {
                    URL.revokeObjectURL(contract.dni_image_preview);
                }
            });
        };
    },[])

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchContracts(1, inputFilteredContracts, 'all', formatDateToString(selectedDate));
        }, 300); // debounce

        return () => clearTimeout(delay);
    }, [inputFilteredContracts]);

    const handleInputFilteredContracts = (e) => {
        const value = e.target.value;
        const soloLetrasYNumeros = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
        setInputFilteredContracts(soloLetrasYNumeros);
    }

    const handleMassDeleteContracts = async () => {
        const confirm = window.confirm('¿Estás seguro que querés eliminar los contratos seleccionados?');
        if (!confirm) return;

        try {
            const res = await fetch(`${apiUrl}/api/contracts/mass-delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedContracts })
            });

            const data = await res.json();
            if (res.ok) {
                setSelectedContracts([]);
                fetchContracts(1, inputFilteredContracts, 'all', formatDateToString(selectedDate))
                toast('Contratos eliminados correctamente', {
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

    const handleSelectAllContracts = (checked) => {
        setSelectAll(checked);

        if (checked) {
            const allIds = contracts.map(contract => contract._id);
            setSelectedContracts(allIds);
        } else {
            setSelectedContracts([]);
        }
    };

    const toggleSelectContract = (id) => {
        setSelectedContracts(prev =>
            prev.includes(id)
            ? prev.filter(pId => pId !== id)
            : [...prev, id]
        );
    };

    useEffect(() => {
        setSelectAll(selectedContracts.length === contracts.length && contracts.length > 0);
    }, [selectedContracts, contracts]);

    const handleDownloadImage = async () => {
        try {
            const response = await fetch(`${apiUrl}/${selectedImage}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'image_dni';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar la imagen:', error);
        }
    };

    const handleBtnUpdateContractModal = (contract) => {
        //console.log(contract)


        setIsOpenUpdateContractModal(true)

    };

    const goToPreviousDay = () => {
        setIsLoadingContracts(true);
        const prevDate = new Date(selectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setSelectedDate(prevDate);
    };

    const goToNextDay = () => {
        setIsLoadingContracts(true);
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        setSelectedDate(nextDate);
    };

    const formatDateToString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Enero = 0
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        fetchContracts(1, inputFilteredContracts, 'all', formatDateToString(selectedDate))
    }, [selectedDate]);

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

            <div className='contractsContainer'>

                <div className='contractsContainer__title'>
                    <div className='contractsContainer__title__prop'>Contratos</div>
                </div>

                <div className='contractsContainer__subTitle'>Crear contrato</div>

                <div className='contractsContainer__btnCreateContract'>
                    <button onClick={()=>setIsOpenCreateContractModal(true)} className='contractsContainer__btnCreateContract__prop'>Crear contrato</button>
                </div>

                <div className="contractsContainer__contractsTableMobile">

                    <div className='contractsContainer__contractsTableMobile__subTitleTable'>Buscar contratos</div>

                    <div className='contractsContainer__contractsTableMobile__inputSearchProduct'>
                        <div className='contractsContainer__contractsTableMobile__inputSearchProduct__inputContainer'>
                            <input type="text" onChange={handleInputFilteredContracts} value={inputFilteredContracts} placeholder={`Buscar contrato`} className='contractsContainer__contractsTableMobile__inputSearchProduct__inputContainer__input' name="" id="" />
                        </div>
                    </div>

                    <div className='contractsContainer__contractsTableMobile__quantityContracts'>
                        <div className='contractsContainer__contractsTableMobile__quantityContracts__prop'>Cantidad de contratos: {totalPerPageContracts} de {totalContracts}</div>        
                    </div>

                    <div className='contractsContainer__contractsTableMobile__quantityContracts'>
                        <div className='contractsContainer__contractsTableMobile__quantityContracts__massDeleteBtnContainer'>
                            <input
                            type="checkbox"
                            checked={selectAllContracts}
                            onChange={(e) => handleSelectAllContracts(e.target.checked)}
                            />
                            <span>Seleccionar todos</span>
                            {selectedContracts.length > 0 ? (
                            <div className='contractsContainer__contractsTableMobile__quantityContracts__massDeleteBtnContainer'>
                                <button
                                onClick={handleMassDeleteContracts}
                                className='contractsContainer__contractsTableMobile__quantityContracts__massDeleteBtnContainer__btn'
                                >
                                Eliminar seleccionados ({selectedContracts.length})
                                </button>
                            </div>
                            )
                            :
                            <><div></div></>
                            }
                        </div>
                    </div>

                    {
                        !isLoadingContracts && !inputFilteredContracts &&
                        <div className="contractsContainer__contractsTableMobile__dateFilter">
                            <button className='contractsContainer__contractsTableMobile__dateFilter__btn' onClick={goToPreviousDay}>Anterior</button>
                            {/* <span className='contractsContainer__contractsTableMobile__dateFilter__date'>{formatDateToString(selectedDate)}</span> */}
                            <input
                                type="date"
                                className='contractsContainer__contractsTableMobile__dateFilter__date'
                                value={formatDateToString(selectedDate)}
                                onChange={(e) => {
                                    setIsLoadingContracts(true);
                                    const [year, month, day] = e.target.value.split('-').map(Number);
                                    const localDate = new Date(year, month - 1, day);
                                    setSelectedDate(localDate);
                                }}
                            />
                            <button className='contractsContainer__contractsTableMobile__dateFilter__btn' onClick={goToNextDay}>Siguiente</button>
                        </div>
                    }

                    {
                        contracts.length > 0 &&

                        <div className='contractsContainer__contractsTableMobile__header'>
                            <div className='contractsContainer__contractsTableMobile__header__item'></div>
                            <div className='contractsContainer__contractsTableMobile__header__item'>N° transacción</div>
                            <div className='contractsContainer__contractsTableMobile__header__item'>Fecha y hora transacción</div>
                            <div className='contractsContainer__contractsTableMobile__header__item'>Apellido</div>
                            <div className='contractsContainer__contractsTableMobile__header__item'></div>
                        </div>
                    }

                    {
                        isLoadingContracts ? 
                            <>
                                <div className="contractsContainer__contractsTableMobile__isLoadingLabel">
                                    Cargando contratos&nbsp;&nbsp;<Spinner/>
                                </div>
                            </>
                        : contracts.length > 0 ?
                            contracts.map((contract, index) => {
                                return (
                                    <div className="contractsContainer__contractsTableMobile__itemContractContainer" key={contract._id}>
                                        <div className="contractsContainer__contractsTableMobile__itemContractContainer__checkBox">
                                            <input
                                                className='contractsContainer__contractsTableMobile__itemContractContainer__checkBox__prop'
                                                type="checkbox"
                                                checked={selectedContracts.includes(contract._id)}
                                                onChange={() => toggleSelectContract(contract._id)}
                                            />
                                        </div>
                                        <div className="contractsContainer__contractsTableMobile__itemContractContainer__descriptionEllipsis">
                                            <div>{contract.transaction_number}</div>
                                        </div>
                                        <div className="contractsContainer__contractsTableMobile__itemContractContainer__descriptionEllipsis">
                                            <div>{contract.transaction_date.replace('T', ' ')}</div>
                                        </div>
                                        <div className="contractsContainer__contractsTableMobile__itemContractContainer__descriptionEllipsis">
                                            <div>{contract.last_name}</div>
                                        </div>
                                        <div className="contractsContainer__contractsTableMobile__itemContractContainer__btn">
                                            <button 
                                                className='contractsContainer__contractsTableMobile__itemContractContainer__btn__prop'
                                                onClick={() => {
                                                    setSelectedContract(contract); // <-- Seteás el contrato completo
                                                    setIsOpenUpdateContractModal(true); // <-- Mostrás el modal
                                                }}>Editar
                                            </button>
                                            {loadingContractId === contract._id ? (
                                                <button
                                                disabled
                                                className='cPanelProductsContainer__productsTable__itemContainer__btnsContainer__btn'
                                                >
                                                <Spinner/>
                                                </button>
                                            ) : (
                                                <button
                                                onClick={() => handleBtnDeleteContract(contract._id)}
                                                className='contractsContainer__contractsTableMobile__itemContractContainer__btn__prop'
                                                >
                                                Borrar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        :   
                        <div className="contractsContainer__contractsTableMobile__isLoadingLabel">Aún no existen contratos en el día seleccionado</div>
                    }

                </div>

                <div className='contractsContainer__headerTable'>
                    <div className='contractsContainer__headerTable__item'>N° transacción</div>
                    <div className='contractsContainer__headerTable__item'>Fecha y hora transacción</div>
                    <div className='contractsContainer__headerTable__item'>Nombre</div>
                    <div className='contractsContainer__headerTable__item'>Apellido</div>
                    <div className='contractsContainer__headerTable__item'>DNI</div>
                    <div className='contractsContainer__headerTable__item'>Teléfono</div>
                    <div className='contractsContainer__headerTable__item'>Archivo de contrato</div>
                    <div className='contractsContainer__headerTable__item'>Imagen DNI</div>
                    <div className='contractsContainer__headerTable__item'></div>
                </div>

                <div className='contractsContainer__contractsTable'>

                    <div className='contractsContainer__contractsTable__createContractContainer'>

                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleInputChange} value={contractFormData.transaction_number} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="text" name="transaction_number" placeholder="N° transacción" required/>
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleInputChange} value={contractFormData.transaction_date} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="datetime-local" name="transaction_date" placeholder="Fecha transacción" required/>
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleInputChange} value={contractFormData.first_name} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="text" name="first_name" placeholder="Nombre" required/>
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleInputChange} value={contractFormData.last_name} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="text" name="last_name" placeholder="Apellido" required/>
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleInputChange} value={contractFormData.dni} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="text" name="dni" placeholder="DNI" required/>
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleInputChange} value={contractFormData.phoneNumber} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="text" name="phoneNumber" placeholder="Teléfono" required/>
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <label htmlFor="contractFileInput" className="contractsContainer__contractsTable__createContractContainer__input__fileInputButton">
                                Seleccionar archivo
                            </label>
                            <input
                                id="contractFileInput"
                                type="file"
                                name="contract_file"
                                accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileChange}
                                className="contractsContainer__contractsTable__createContractContainer__input__propFile"
                                required
                            />
                            {contractFormData.contract_file && (
                                <div className='contractsContainer__contractsTable__createContractContainer__input__nameContract'>
                                    <p className="contractsContainer__contractsTable__createContractContainer__input__nameContract__item">{contractFormData.contract_file.name}</p>
                                </div>
                            )}
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <label htmlFor="contractFileImageInput" className="contractsContainer__contractsTable__createContractContainer__input__fileInputButton">
                                Seleccionar imagen
                            </label>
                            <input id="contractFileImageInput" onChange={handleFileChange} className='contractsContainer__contractsTable__createContractContainer__input__propFile' type="file" name="image_dni" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"  required/>
                            {contractFormData.image_dni && (
                                <div className='contractsContainer__contractsTable__createContractContainer__input__nameContract'>
                                    <p 
                                    onClick={() => {
                                        const file = contractFormData.image_dni;
                                        const fileType = file.type;

                                        if (fileType.startsWith('image/')) {
                                            setSelectedPreview({ type: 'image', url: URL.createObjectURL(file) });
                                        } else if (fileType === 'application/pdf') {
                                            setSelectedPreview({ type: 'pdf', url: URL.createObjectURL(file) });
                                        } else {
                                            setSelectedPreview({ type: 'doc', url: file.name });
                                        }
                                    }}
                                    className="contractsContainer__contractsTable__createContractContainer__input__nameContract__item">
                                        {contractFormData.image_dni.name}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__btn'>
                            <button className='contractsContainer__contractsTable__createContractContainer__btn__prop' onClick={handleBtnSubmitContract}>Crear Contrato</button>
                        </div>

                    </div>

                    <div className='contractsContainer__contractsTable__subTitleTable'>Buscar contratos</div>

                    <div className='contractsContainer__inputSearchProduct'>
                        <div className='contractsContainer__inputSearchProduct__inputContainer'>
                            <input type="text" onChange={handleInputFilteredContracts} value={inputFilteredContracts} placeholder={`Buscar contrato`} className='contractsContainer__inputSearchProduct__inputContainer__input' name="" id="" />
                        </div>
                    </div>

                    <div className='contractsContainer__quantityContracts'>
                        <div className='contractsContainer__quantityContracts__massDeleteBtnContainer'>
                            <input
                            type="checkbox"
                            checked={selectAllContracts}
                            onChange={(e) => handleSelectAllContracts(e.target.checked)}
                            />
                            <span>Seleccionar todos</span>
                            {selectedContracts.length > 0 ? (
                            <div className='contractsContainer__quantityContracts__massDeleteBtnContainer'>
                                <button
                                onClick={handleMassDeleteContracts}
                                className='contractsContainer__quantityContracts__massDeleteBtnContainer__btn'
                                >
                                Eliminar seleccionados ({selectedContracts.length})
                                </button>
                            </div>
                            )
                            :
                            <><div></div></>
                            }
                        </div>
                        <div className='contractsContainer__quantityContracts__prop'>Cantidad de contratos: {totalPerPageContracts} de {totalContracts}</div>        
                    </div>

                    {
                        !isLoadingContracts && !inputFilteredContracts &&
                        <div className="contractsContainer__dateFilter">
                            <button className='contractsContainer__dateFilter__btn' onClick={goToPreviousDay}>Anterior</button>
                            {/* <span className='contractsContainer__dateFilter__date'>{formatDateToString(selectedDate)}</span> */}
                            <input
                                type="date"
                                className='contractsContainer__dateFilter__date'
                                value={formatDateToString(selectedDate)}
                                onChange={(e) => {
                                    setIsLoadingContracts(true);
                                    const [year, month, day] = e.target.value.split('-').map(Number);
                                    const localDate = new Date(year, month - 1, day);
                                    setSelectedDate(localDate);
                                }}
                            />
                            <button className='contractsContainer__dateFilter__btn' onClick={goToNextDay}>Siguiente</button>
                        </div>
                    }

                    {
                        contracts.length > 0 &&

                        <div className='contractsContainer__contractsTable__header'>
                            <div className='contractsContainer__contractsTable__header__item'></div>
                            <div className='contractsContainer__contractsTable__header__item'>N° transacción</div>
                            <div className='contractsContainer__contractsTable__header__item'>Fecha y hora transacción</div>
                            <div className='contractsContainer__contractsTable__header__item'>Nombre</div>
                            <div className='contractsContainer__contractsTable__header__item'>Apellido</div>
                            <div className='contractsContainer__contractsTable__header__item'>DNI</div>
                            <div className='contractsContainer__contractsTable__header__item'>Teléfono</div>
                            <div className='contractsContainer__contractsTable__header__item'>Archivo de contrato</div>
                            <div className='contractsContainer__contractsTable__header__item'>Imagen DNI</div>
                            <div className='contractsContainer__contractsTable__header__item'></div>
                        </div>
                    }

                    {
                        isLoadingContracts ? 
                            <>
                                <div className="contractsContainer__contractsTable__isLoadingLabel">
                                    Cargando contratos&nbsp;&nbsp;<Spinner/>
                                </div>
                            </>
                        : contracts.length > 0 ?
                            contracts.map((contract, index) => {
                                return (
                                    <div className="contractsContainer__contractsTable__itemContractContainer" key={contract._id}>
                                        <div className="contractsContainer__contractsTable__itemContractContainer__checkBox">
                                            <input
                                                className='contractsContainer__contractsTable__itemContractContainer__checkBox__prop'
                                                type="checkbox"
                                                checked={selectedContracts.includes(contract._id)}
                                                onChange={() => toggleSelectContract(contract._id)}
                                            />
                                        </div>
                                        <div className="contractsContainer__contractsTable__itemContractContainer__input">
                                            <input
                                                className='contractsContainer__contractsTable__itemContractContainer__input__prop'
                                                type="text"
                                                value={contract.transaction_number}
                                                onChange={(e) => handleContractFieldChange(index, 'transaction_number', e.target.value)}
                                            />
                                        </div>
                                        <div className="contractsContainer__contractsTable__itemContractContainer__input">
                                            <input
                                            className='contractsContainer__contractsTable__itemContractContainer__input__prop'
                                            type="datetime-local"
                                            value={contract.transaction_date}
                                            onChange={(e) => handleContractFieldChange(index, 'transaction_date', e.target.value)}
                                            />
                                        </div>
                                        <div className="contractsContainer__contractsTable__itemContractContainer__input">
                                            <input
                                                className='contractsContainer__contractsTable__itemContractContainer__input__prop'
                                                type="text"
                                                value={contract.first_name}
                                                onChange={(e) => handleContractFieldChange(index, 'first_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="contractsContainer__contractsTable__itemContractContainer__input">
                                            <input
                                                className='contractsContainer__contractsTable__itemContractContainer__input__prop'
                                                type="text"
                                                value={contract.last_name}
                                                onChange={(e) => handleContractFieldChange(index, 'last_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="contractsContainer__contractsTable__itemContractContainer__input">
                                            <input
                                                className='contractsContainer__contractsTable__itemContractContainer__input__prop'
                                                type="text"
                                                value={contract.dni}
                                                onChange={(e) => handleContractFieldChange(index, 'dni', e.target.value)}
                                            />
                                        </div>
                                        <div className="contractsContainer__contractsTable__itemContractContainer__input">
                                            <input
                                                className='contractsContainer__contractsTable__itemContractContainer__input__prop'
                                                type="text"
                                                value={contract.phoneNumber}
                                                onChange={(e) => handleContractFieldChange(index, 'phoneNumber', e.target.value)}
                                            />
                                        </div>
                                        <div className="contractsContainer__contractsTable__itemContractContainer__inputFile">
                                            <label htmlFor={`itemContractListFileInput_${index}`} className="contractsContainer__contractsTable__itemContractContainer__inputFile__fileInputButton">
                                                Seleccionar archivo
                                            </label>
                                            <input
                                                id={`itemContractListFileInput_${index}`}
                                                type="file"
                                                className='contractsContainer__contractsTable__itemContractContainer__inputFile__propFile'
                                                accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                onChange={(e) => handleContractFileChange(index, 'contract_file', e.target.files[0])}
                                            />
                                            {contract.contract_file && (
                                                <>
                                                <p
                                                style={{ color: 'black', textDecoration: 'underline', cursor: 'pointer' }}
                                                onClick={() => {
                                                    const isFile = contract.contract_file instanceof File;
                                                    const url = isFile
                                                    ? URL.createObjectURL(contract.contract_file)
                                                    : `${apiUrl}/${contract.contract_file}`;

                                                    const extension = url.split('.').pop().toLowerCase();

                                                    if (extension !== 'pdf') {
                                                    // Si no es PDF, abrir en nueva pestaña y no mostrar modal
                                                    window.open(url, '_blank');
                                                    } else {
                                                    // Si es PDF, mostrarlo en el modal
                                                    setSelectedPdf(url);
                                                    }
                                                }}
                                                >
                                                Ver contrato
                                                </p>

                                                </>
                                            )}

                                        </div>
                                        <div className="contractsContainer__contractsTable__itemContractContainer__inputFile">
                                            <label htmlFor={`itemContractListImageFileInput_${index}`} className="contractsContainer__contractsTable__itemContractContainer__inputFile__fileInputButton">
                                                Seleccionar imagen
                                            </label>
                                            <input
                                                id={`itemContractListImageFileInput_${index}`}
                                                className='contractsContainer__contractsTable__itemContractContainer__inputFile__propFile'
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                onChange={(e) => handleContractFileChange(index, 'image_dni', e.target.files[0])}
                                            />
                                            {contract.image_dni ? (
                                            <p
                                                style={{ color: 'black', textDecoration: 'underline', cursor: 'pointer' }}
                                                onClick={() => setSelectedImage(contract.image_dni)}
                                            >
                                                Ver imagen
                                            </p>
                                            ) :  null}

                                        </div>  


                                        <div className="contractsContainer__contractsTable__itemContractContainer__btn">
                                            <button className='contractsContainer__contractsTable__itemContractContainer__btn__prop' onClick={() => handleSaveContract(contract._id, contract)}>Guardar</button>
                                            {loadingContractId === contract._id ? (
                                                <button
                                                disabled
                                                className='cPanelProductsContainer__productsTable__itemContainer__btnsContainer__btn'
                                                >
                                                <Spinner/>
                                                </button>
                                            ) : (
                                                <button
                                                onClick={() => handleBtnDeleteContract(contract._id)}
                                                className='contractsContainer__contractsTable__itemContractContainer__btn__prop'
                                                >
                                                Borrar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        :   
                        <div className="contractsContainer__contractsTable__isLoadingLabel">Aún no existen contratos en el día seleccionado</div>
                    }

                </div>
                {
                    
                    !isLoadingContracts && contracts.length > 0 &&
                    <div className='contractsContainer__btnsPagesContainer'>
                        <button className='contractsContainer__btnsPagesContainer__btn'
                            disabled={!pageInfo.hasPrevPage}
                            onClick={() => fetchContracts(pageInfo.prevPage, inputFilteredContracts, 'all', formatDateToString(selectedDate))}
                            >
                            Anterior
                        </button>
                        
                        <span>Página {pageInfo.page} de {pageInfo.totalPages}</span>

                        <button className='contractsContainer__btnsPagesContainer__btn'
                            disabled={!pageInfo.hasNextPage}
                            onClick={() => fetchContracts(pageInfo.nextPage, inputFilteredContracts, 'all', formatDateToString(selectedDate))}
                            >
                            Siguiente
                        </button>
                    </div>
                }


                <div className='contractsContainer__contractsTableBottom'></div>

            </div>

            {selectedPreview && (
            <div
                onClick={() => setSelectedPreview(null)}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                    cursor: 'pointer'
                }}
            >
                {selectedPreview.type === 'image' && (
                    <img
                        src={selectedPreview.url}
                        alt="Vista previa"
                        style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '10px' }}
                    />
                )}
                {selectedPreview.type === 'pdf' && (
                    <iframe
                        src={selectedPreview.url}
                        title="Vista previa PDF"
                        style={{ width: '80%', height: '90%', border: 'none', borderRadius: '10px' }}
                    />
                )}
                {selectedPreview.type === 'doc' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '10px' }}>
                        <p style={{ color: 'black' }}>
                            Archivo cargado: <strong>{selectedPreview.url}</strong>
                        </p>
                        <p style={{ color: 'gray' }}>(No se puede previsualizar este tipo de archivo)</p>
                    </div>
                )}
            </div>
        )}

            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                        flexDirection: 'column',
                    }}
                >
                    {/* Contenedor interno que no cierra el modal al hacer clic */}
                    <div
                        style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            maxWidth: '90%',
                            maxHeight: '90%',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Botón de cerrar */}
                        <button
                            onClick={() => setSelectedImage(null)}
                            style={{
                                marginBottom: '10px',
                                background: 'linear-gradient(to bottom, #b8860b 0%, #ffd700 20%, #fff8dc 40%, #ffd700 60%, #b8860b 80%, #ffd700 100%)',
                                color: 'black',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                        >
                            Cerrar
                        </button>
                        <img
                            src={`${apiUrl}/${selectedImage}`}
                            alt="Imagen en grande"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                borderRadius: '10px',
                            }}
                        />

                        {/* Botón de descarga */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // evita que se cierre el modal
                                handleDownloadImage();
                            }}
                            style={{
                                marginTop: '20px',
                                background: 'linear-gradient(to bottom, #b8860b 0%, #ffd700 20%, #fff8dc 40%, #ffd700 60%, #b8860b 80%, #ffd700 100%)',
                                color: 'black',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                            }}
                        >
                            Descargar imagen
                        </button>


                        
                    </div>
                </div>
            )}

            {selectedPdf && (
                <div
                    onClick={() => setSelectedPdf(null)}
                    style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999
                    }}
                >
                    <iframe
                    src={selectedPdf}
                    title="Contrato PDF"
                    style={{ width: '80%', height: '90%', border: 'none', borderRadius: '10px' }}
                    />
                </div>
            )}


            {
                isOpenCreateContractModal && 
                <CreateContractModal
                setIsOpenCreateContractModal={setIsOpenCreateContractModal}
                fetchContracts={fetchContracts}
                selectedDate={selectedDate}
                apiUrl={apiUrl}
                />
            }

            {
                isOpenUpdateContractModal && 
                <UpdateContractModal
                setIsOpenUpdateContractModal={setIsOpenUpdateContractModal}
                fetchContracts={fetchContracts}
                contract={selectedContract}
                selectedDate={selectedDate}
                apiUrl={apiUrl}
                />
            }
        </>
    )

}

export default Contracts