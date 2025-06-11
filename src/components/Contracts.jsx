import {useEffect, useState} from 'react'
import { toast } from 'react-toastify';

const Contracts = () => {

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
                setContracts(data.data.docs)
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

    const handleContractFileChange = (index, field, file) => {
        const updatedContracts = [...contracts];
        updatedContracts[index][field] = file; // archivo directamente
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

    useEffect(() => {
        fetchContracts()
    },[])

    return (

        <>

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

                    <div className="contractsContainer__contractsTable__itemsList">
                        {contracts.map((contract, index) => (
                            <div className="contractsContainer__contractsTable__itemRow" key={contract._id}>
                                <div className="contractsContainer__contractsTable__item">
                                    <input
                                        type="text"
                                        value={contract.first_name}
                                        onChange={(e) => handleContractFieldChange(index, 'first_name', e.target.value)}
                                    />
                                </div>
                                <div className="contractsContainer__contractsTable__item">
                                    <input
                                        type="text"
                                        value={contract.last_name}
                                        onChange={(e) => handleContractFieldChange(index, 'last_name', e.target.value)}
                                    />
                                </div>
                                <div className="contractsContainer__contractsTable__item">
                                    <input
                                        type="text"
                                        value={contract.dni}
                                        onChange={(e) => handleContractFieldChange(index, 'dni', e.target.value)}
                                    />
                                </div>
                                <div className="contractsContainer__contractsTable__item">
                                    <input
                                        type="text"
                                        value={contract.phoneNumber}
                                        onChange={(e) => handleContractFieldChange(index, 'phoneNumber', e.target.value)}
                                    />
                                </div>
                                <div className="contractsContainer__contractsTable__item">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => handleContractFileChange(index, 'contract_file', e.target.files[0])}
                                    />
                                    {contract.contract_file && (
                                        <a href={`http://localhost:8081/${contract.contract_file}`} target="_blank" rel="noopener noreferrer">
                                            Ver contrato
                                        </a>
                                    )}
                                </div>
                                <div className="contractsContainer__contractsTable__item">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleContractFileChange(index, 'dni_image', e.target.files[0])}
                                    />
                                    {contract.image_dni && (
                                        <a href={`http://localhost:8081/${contract.image_dni}`} target="_blank" rel="noopener noreferrer">
                                            Ver DNI
                                        </a>
                                    )}
                                </div>
                                <div className="contractsContainer__contractsTable__item">
                                    <button onClick={() => handleSaveContract(contract._id, contract)}>Guardar</button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

            </div>

        </>
    )

}

export default Contracts