import {useEffect, useState} from 'react'
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const Contracts = () => {
    const [selectedField, setSelectedField] = useState('first_name');
    const [inputFilteredContracts, setInputFilteredContracts] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [menuOptions, setMenuOptions] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [totalContracts, setTotalContracts] = useState("");
    const [user, setUser] = useState('');
    const [isLoadingContracts, setIsLoadingContracts] = useState(true);
    const [pageInfo, setPageInfo] = useState({
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null
    });   
    const fieldLabels = {
        first_name: 'Nombre',
        last_name: 'Apellido',
        dni: 'DNI',
        phoneNumber: 'Teléfono',
        all: 'Todos'
    };
    const [contractformData, setContractformData] = useState({
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
        setContractformData({
            ...contractformData,
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
            const validImageTypes = ['image/jpeg', 'image/png'];
            if (!validImageTypes.includes(file.type)) {
                toast('La imagen del DNI debe ser JPG o PNG.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                return;
            }
        }

        const updatedForm = {
            ...contractformData,
            [name]: file,
        };

        if (name === 'contract_file') {
            updatedForm.contract_file_preview = file.name;
        } else if (name === 'image_dni') {
            updatedForm.image_dni_preview = URL.createObjectURL(file);
        }

        setContractformData(updatedForm);
    };


    const fetchContracts = async (page = 1, search = "",field = "") => {
        try {
            const response = await fetch(`http://localhost:8081/api/contracts/byPage?page=${page}&search=${search}&field=${field}`)
            const contractsAll = await response.json();
            if(response.ok) {
                setTotalContracts(contractsAll.data.totalDocs)
                setContracts(contractsAll.data.docs)
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
            !contractformData.first_name.trim() ||
            !contractformData.last_name.trim() ||
            !contractformData.dni.trim() ||
            !contractformData.phoneNumber.trim() ||
            !contractformData.contract_file ||
            !contractformData.image_dni
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

        if (!validContractTypes.includes(contractformData.contract_file.type)) {
            toast('El archivo de contrato debe ser PDF, DOC o DOCX.', {
                position: "top-right",
                autoClose: 3000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }

        // Validar imagen del DNI (solo .jpg, .jpeg, .png)
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];

        if (!validImageTypes.includes(contractformData.image_dni.type)) {
            toast('La imagen del DNI debe ser JPG, JPEG o PNG.', {
                position: "top-right",
                autoClose: 3000,
                theme: "dark",
                className: "custom-toast",
            });
            return;
        }
        
        const formDataToSend = new FormData();
        formDataToSend.append('first_name', contractformData.first_name);
        formDataToSend.append('last_name', contractformData.last_name);
        formDataToSend.append('dni', contractformData.dni);
        formDataToSend.append('phoneNumber', contractformData.phoneNumber);
        formDataToSend.append('contract_file', contractformData.contract_file);
        formDataToSend.append('image_dni', contractformData.image_dni);

        try {
            const response = await fetch('http://localhost:8081/api/contracts', {
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
                setContractformData({
                    first_name: '',
                    last_name: '',
                    dni: '',
                    phoneNumber: '',
                    contract_file: null,
                    image_dni: null,
                });
                fetchContracts(1, inputFilteredContracts, selectedField)
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
            }
        }

        try {
            const response = await fetch(`http://localhost:8081/api/contracts/${id}`, {
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
                fetchContracts(1, inputFilteredContracts, selectedField);
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
    
    
    const handleDeleteContract = async (id) => {
        try {
            const response = await fetch(`http://localhost:8081/api/contracts/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast(`Contrato eliminado con éxito!`, {
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
                fetchContracts(1, inputFilteredContracts, selectedField);
            } else {
                toast(`Error al eliminar contrato!`, {
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
            toast(`Error de conexión!`, {
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
        }
    };

    useEffect(() => {
        fetchContracts(1, inputFilteredContracts, selectedField);
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
            fetchContracts(1, inputFilteredContracts, 'all');
        }, 300); // debounce

        return () => clearTimeout(delay);
    }, [inputFilteredContracts]);

    const handleInputFilteredContracts = (e) => {
        const value = e.target.value;
        const soloLetrasYNumeros = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
        setInputFilteredContracts(soloLetrasYNumeros);
    }


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
                    </div>
                </div>
            }

            <div className='contractsContainer'>

                <div className='contractsContainer__title'>
                    <div className='contractsContainer__title__prop'>Contratos</div>
                </div>

                <div className='contractsContainer__subTitle'>Buscar contratos</div>

                <div className='contractsContainer__inputSearchProduct'>
                    {/* <div className='contractsContainer__inputSearchProduct__selectContainer'>
                        <div>Buscar por:</div>
                        <select
                            className='contractsContainer__inputSearchProduct__selectContainer__select'
                            value={selectedField}
                            onChange={(e) => setSelectedField(e.target.value)}
                            >
                            {Object.entries(fieldLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div> */}
                    <div className='contractsContainer__inputSearchProduct__inputContainer'>
                        <input type="text" onChange={handleInputFilteredContracts} value={inputFilteredContracts} placeholder={`Buscar contrato`} className='contractsContainer__inputSearchProduct__inputContainer__input' name="" id="" />
                    </div>
                </div>

                <div className='contractsContainer__headerTable'>
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
                            <input onChange={handleInputChange} value={contractformData.first_name} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="text" name="first_name" placeholder="Nombre" required/>
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleInputChange} value={contractformData.last_name} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="text" name="last_name" placeholder="Apellido" required/>
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleInputChange} value={contractformData.dni} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="text" name="dni" placeholder="DNI" required/>
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleInputChange} value={contractformData.phoneNumber} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="text" name="phoneNumber" placeholder="Teléfono" required/>
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleFileChange} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="file" name="contract_file" accept=".pdf,.doc,.docx" required/>
                            {contractformData.contract_file && (
                            <p
                                style={{ color: 'black', textDecoration: 'underline', cursor: 'pointer' }}
                                onClick={() => setSelectedPdf(URL.createObjectURL(contractformData.contract_file))}
                            >
                                Ver archivo
                            </p>
                            )}
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleFileChange} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="file" name="image_dni" accept=".jpg,.jpeg,.png"  required/>
                            {contractformData.image_dni && (
                            <p
                                style={{ color: 'black', textDecoration: 'underline', cursor: 'pointer' }}
                                onClick={() => setSelectedImage(contractformData.image_dni_preview)}
                            >
                                Ver imagen
                            </p>
                            )}
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__btn'>
                            <button className='contractsContainer__contractsTable__createContractContainer__btn__prop' onClick={handleBtnSubmitContract}>Crear Contrato</button>
                        </div>

                    </div>

                    <div className='contractsContainer__contractsTable__titleTable'>Lista de contratos</div>

                    {
                        !isLoadingContracts &&
                        <div className='contractsContainer__contractsTable__subTitleTable'>Cantidad de contratos: {totalContracts}</div>
                    }

                    {
                        isLoadingContracts ? 
                            <>
                                <div className="contractsContainer__contractsTable__isLoadingLabel">
                                    Cargando contratos&nbsp;&nbsp;<Spinner/>
                                </div>
                            </>
                        :
                        contracts.map((contract, index) => (
                            <div className="contractsContainer__contractsTable__itemContractContainer" key={contract._id}>
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
                                    <input
                                        className='contractsContainer__contractsTable__itemContractContainer__inputFile__prop'
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => handleContractFileChange(index, 'contract_file', e.target.files[0])}
                                    />
                                    {contract.contract_file && (
                                    <p
                                        style={{ color: 'black', textDecoration: 'underline', cursor: 'pointer' }}
                                        onClick={() => {
                                        const isFile = contract.contract_file instanceof File;
                                        const url = isFile
                                            ? URL.createObjectURL(contract.contract_file)
                                            : `http://localhost:8081/${contract.contract_file}`;
                                        setSelectedPdf(url);
                                        }}
                                    >
                                        Ver contrato
                                    </p>
                                    )}

                                </div>
                                <div className="contractsContainer__contractsTable__itemContractContainer__inputFile">
                                    <input
                                        className='contractsContainer__contractsTable__itemContractContainer__inputFile__prop'
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleContractFileChange(index, 'image_dni', e.target.files[0])}
                                    />
                                    {contract.dni_image_preview ? (
                                    <p
                                        style={{ color: 'black', textDecoration: 'underline', cursor: 'pointer' }}
                                        onClick={() => setSelectedImage(contract.dni_image_preview)}
                                    >
                                        Ver imagen
                                    </p>
                                    ) : contract.image_dni ? (
                                    <p
                                        style={{ color: 'black', textDecoration: 'underline', cursor: 'pointer' }}
                                        onClick={() => setSelectedImage(`http://localhost:8081/${contract.dni_image}`)}
                                    >
                                        Ver imagen
                                    </p>
                                    ) : null}

                                </div>  


                                <div className="contractsContainer__contractsTable__itemContractContainer__btn">
                                    <button className='contractsContainer__contractsTable__itemContractContainer__btn__prop' onClick={() => handleSaveContract(contract._id, contract)}>Guardar</button>
                                    <button className='contractsContainer__contractsTable__itemContractContainer__btn__prop' onClick={() => handleDeleteContract(contract._id)}>Borrar</button>
                                </div>
                            </div>
                        ))
                    }

                </div>
                {
                    
                    !isLoadingContracts &&
                    <div className='contractsContainer__btnsPagesContainer'>
                        <button className='contractsContainer__btnsPagesContainer__btn'
                            disabled={!pageInfo.hasPrevPage}
                            onClick={() => fetchContracts(pageInfo.prevPage, inputFilteredContracts, selectedField)}
                            >
                            Anterior
                        </button>
                        
                        <span>Página {pageInfo.page} de {pageInfo.totalPages}</span>

                        <button className='contractsContainer__btnsPagesContainer__btn'
                            disabled={!pageInfo.hasNextPage}
                            onClick={() => fetchContracts(pageInfo.nextPage, inputFilteredContracts, selectedField)}
                            >
                            Siguiente
                        </button>
                    </div>
                }


                <div className='contractsContainer__contractsTableBottom'></div>

            </div>

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
                    cursor: 'pointer'
                    }}
                >
                    <img
                    src={selectedImage}
                    alt="Imagen en grande"
                    style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '10px' }}
                    />
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



        </>
    )

}

export default Contracts