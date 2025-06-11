import {useEffect, useState} from 'react'
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Contracts = () => {
    const [menuOptions, setMenuOptions] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [isLoadingContracts, setIsLoadingContracts] = useState(true);
    console.log(contracts)
    const [contractformData, setContractformData] = useState({
        first_name: '',
        last_name: '',
        dni: '',
        phoneNumber: '',
        contract_file: null,
        image_dni: null,
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
        setContractformData({
            ...contractformData,
            [name]: files[0] // Suponiendo que solo se sube un archivo
        });
    };

    const fetchContracts = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/contracts');
            const data = await response.json();
            if (response.ok) {
                //setContracts(data.data.docs)
                const formattedContracts = data.data.docs.map(contract => ({
                    ...contract,
                    contract_file_preview: contract.contract_file
                        ? `http://localhost:8081/${contract.contract_file}`
                        : null,
                    dni_image_preview: contract.image_dni
                        ? `http://localhost:8081/${contract.image_dni}`
                        : null
                }));

                setContracts(formattedContracts);
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
            console.error(error);
            toast(`Error al cargar los contratos`, {
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
        } finally {
            setIsLoadingContracts(false)
        }
    };

    const handleBtnSubmitContract = async () => {
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

    /* const handleContractFileChange = (index, field, file) => {
        const updatedContracts = [...contracts];
        updatedContracts[index][field] = file; // archivo directamente
        setContracts(updatedContracts);
    }; */
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
            if (updatedContract[key] instanceof File) {
                formData.append(key, updatedContract[key]);
            } else {
                formData.append(key, updatedContract[key] ?? ''); // null-safe
            }
        }

        try {
            const response = await fetch(`http://localhost:8081/api/contracts/${id}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                toast('Contrato actualizado con éxito!', { theme: "dark" });
                fetchContracts();
            } else {
                toast('Error al actualizar contrato', { theme: "dark" });
            }
        } catch (error) {
            console.error(error);
            toast('Error de conexión al actualizar', { theme: "dark" });
        }
    };
    
    const btnShowMenuOptions = () => {
        if(menuOptions) {
            setMenuOptions(false)
        } else {
            setMenuOptions(true)
        }
    };

    useEffect(() => {
        fetchContracts()

        return () => {
            contracts.forEach(contract => {
                if (contract.dni_image_preview && contract.dni_image_preview.startsWith('blob:')) {
                    URL.revokeObjectURL(contract.dni_image_preview);
                }
            });
        };
    },[])


    return (

        <>
            <div className='menuContainer'>
                <div onClick={btnShowMenuOptions} className='menuContainer__arrow'>v</div>
                <div className={`menuContainer__menu ${menuOptions ? 'menuContainer__menu--active' : ''}`}>
                    <Link to={"/"} className='menuContainer__menu__item'>
                        - Home
                    </Link>
                    <Link to={"/contracts"} className='menuContainer__menu__item'>
                        - Contratos
                    </Link>
                </div>
            </div>

            <div className='contractsContainer'>

                <div className='contractsContainer__title'>
                    <div className='contractsContainer__title__prop'>Contratos</div>
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
                            <input onChange={handleFileChange} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="file" name="contract_file" accept=".pdf" required/>
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleFileChange} className='contractsContainer__contractsTable__createContractContainer__input__prop' type="file" name="image_dni" accept="image/*" required/>
                        </div>
                        <div className='contractsContainer__contractsTable__createContractContainer__btn'>
                            <button className='contractsContainer__contractsTable__createContractContainer__btn__prop' onClick={handleBtnSubmitContract}>Crear Contrato</button>
                        </div>

                    </div>

                    {contracts.map((contract, index) => (
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
                                {contract.contract_file_preview ? (
                                    // Si ya seleccionaste uno nuevo, mostramos su nombre
                                    contract.contract_file instanceof File ? (
                                        <p style={{color:'white'}}>Archivo seleccionado: {contract.contract_file_preview}</p>
                                    ) : (
                                        // Si viene del backend, mostramos el link
                                        <a
                                            href={`http://localhost:8081/${contract.contract_file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Ver contrato
                                        </a>
                                    )
                                ) : null}
                            </div>
                            <div className="contractsContainer__contractsTable__itemContractContainer__inputFile">
                                <input
                                    className='contractsContainer__contractsTable__itemContractContainer__inputFile__prop'
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleContractFileChange(index, 'dni_image', e.target.files[0])}
                                />
                                {contract.dni_image_preview ? (
                                    <img
                                        src={contract.dni_image_preview}
                                        alt="Vista previa DNI"
                                        style={{ width: '40px' }}
                                    />
                                ) : contract.dni_image ? (
                                    <a
                                        href={`http://localhost:8081/${contract.dni_image}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Ver DNI
                                    </a>
                                ) : null}
                            </div>
                            <div className="contractsContainer__contractsTable__itemContractContainer__btn">
                                <button className='contractsContainer__contractsTable__itemContractContainer__btn__prop' onClick={() => handleSaveContract(contract._id, contract)}>Guardar</button>
                            </div>
                        </div>
                    ))}

                </div>

            </div>

        </>
    )

}

export default Contracts