import {useEffect, useState} from 'react'
import { toast } from 'react-toastify';

const CreateContractModal = ({setIsOpenCreateContractModal,selectedDate,fetchContracts}) => {
    const [selectedPreview, setSelectedPreview] = useState(null); 
    
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
        const file = files?.[0];

        if (!file) return;

        if (name === 'contract_file') {
            const validTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            if (!validTypes.includes(file.type)) {
                toast('El archivo de contrato debe ser PDF o DOC/DOCX.');
                return;
            }
        }

        setContractFormData(prev => {
            const updated = {
                ...prev,
                [name]: file,
                ...(name === 'contract_file' && { contract_file_preview: file.name }),
                ...(name === 'image_dni' && { image_dni_preview: URL.createObjectURL(file) }),
            };
            return updated;
        });
        
        setTimeout(() => {
        e.target.value = null;
        }, 100);
    };

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
                fetchContracts(1, "", 'all', selectedDate)
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

    return (

        <>
            
            <div className='createContractModalContainer'>

                <div className='createContractModalContainer__btnCloseModal'>
                    <div onClick={()=>setIsOpenCreateContractModal(false)} className='createContractModalContainer__btnCloseModal__btn'>X</div>
                </div>

                <div className='createContractModalContainer__title'>
                    <div className='createContractModalContainer__title__prop'>Crear contrato</div>
                </div>

                <div className="createContractModalContainer__gridLabelInput">

                    <div className="createContractModalContainer__gridLabelInput__label">
                        <div className="createContractModalContainer__gridLabelInput__label__prop">N° transacción</div>
                    </div>

                    <div className="createContractModalContainer__gridLabelInput__input">
                        <input onChange={handleInputChange} value={contractFormData.transaction_number} className='createContractModalContainer__gridLabelInput__input__prop' type="text" name="transaction_number" placeholder="N° transacción" required/>
                    </div>

                </div>

                <div className="createContractModalContainer__gridLabelInput">

                    <div className="createContractModalContainer__gridLabelInput__label">
                        <div className="createContractModalContainer__gridLabelInput__label__prop">Fecha y hora transacción</div>
                    </div>

                    <div className="createContractModalContainer__gridLabelInput__input">
                        <input onChange={handleInputChange} value={contractFormData.transaction_date} className='createContractModalContainer__gridLabelInput__input__prop' type="datetime-local" name="transaction_date" placeholder="Fecha transacción" required/>
                    </div>

                </div>

                <div className="createContractModalContainer__gridLabelInput">

                    <div className="createContractModalContainer__gridLabelInput__label">
                        <div className="createContractModalContainer__gridLabelInput__label__prop">Nombre</div>
                    </div>

                    <div className="createContractModalContainer__gridLabelInput__input">
                        <input onChange={handleInputChange} value={contractFormData.first_name} className='createContractModalContainer__gridLabelInput__input__prop' type="text" name="first_name" placeholder="Nombre" required/>
                    </div>

                </div>

                <div className="createContractModalContainer__gridLabelInput">

                    <div className="createContractModalContainer__gridLabelInput__label">
                        <div className="createContractModalContainer__gridLabelInput__label__prop">Apellido</div>
                    </div>

                    <div className="createContractModalContainer__gridLabelInput__input">
                        <input onChange={handleInputChange} value={contractFormData.last_name} className='createContractModalContainer__gridLabelInput__input__prop' type="text" name="last_name" placeholder="Apellido" required/>
                    </div>

                </div>

                <div className="createContractModalContainer__gridLabelInput">

                    <div className="createContractModalContainer__gridLabelInput__label">
                        <div className="createContractModalContainer__gridLabelInput__label__prop">DNI</div>
                    </div>

                    <div className="createContractModalContainer__gridLabelInput__input">
                        <input onChange={handleInputChange} value={contractFormData.dni} className='createContractModalContainer__gridLabelInput__input__prop' type="text" name="dni" placeholder="DNI" required/>
                    </div>

                </div>

                <div className="createContractModalContainer__gridLabelInput">

                    <div className="createContractModalContainer__gridLabelInput__label">
                        <div className="createContractModalContainer__gridLabelInput__label__prop">Teléfono</div>
                    </div>

                    <div className="createContractModalContainer__gridLabelInput__input">
                        <input onChange={handleInputChange} value={contractFormData.phoneNumber} className='createContractModalContainer__gridLabelInput__input__prop' type="text" name="phoneNumber" placeholder="Teléfono" required/>
                    </div>

                </div>

                <div className="createContractModalContainer__gridLabelInput">

                    <div className="createContractModalContainer__gridLabelInput__label">
                        <div className="createContractModalContainer__gridLabelInput__label__prop">Archivo de contrato</div>
                    </div>

                    <div className="createContractModalContainer__gridLabelInput__inputFile">
                        {/* <label htmlFor="contractFileInput" className="createContractModalContainer__gridLabelInput__inputFile__label">
                            Seleccionar archivo
                        </label> */}
                        <input
                            id="contractFileInput"
                            type="file"
                            name="contract_file"
                            accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                            className="createContractModalContainer__gridLabelInput__inputFile__prop"
                            required
                        />
                        {contractFormData.contract_file && (
                            <div className='createContractModalContainer__gridLabelInput__inputFile__nameContract'>
                                <p className="createContractModalContainer__gridLabelInput__inputFile__nameContract__item">{contractFormData.contract_file.name}</p>
                            </div>
                        )}
                    </div>

                </div>

                <div className="createContractModalContainer__gridLabelInput">

                    <div className="createContractModalContainer__gridLabelInput__label">
                        <div className="createContractModalContainer__gridLabelInput__label__prop">Imagen DNI</div>
                    </div>

                    <div className="createContractModalContainer__gridLabelInput__inputFile">
                        
                        {/* <label htmlFor="contractFileImageInput" className="createContractModalContainer__gridLabelInput__inputFile__label">
                            Seleccionar imagen
                        </label> */}
                        <input id="contractFileImageInput" onChange={handleFileChange} className='createContractModalContainer__gridLabelInput__inputFile__prop' type="file" name="image_dni" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"  required/>
                        {contractFormData.image_dni && (
                            <div className='createContractModalContainer__gridLabelInput__inputFile__nameContract'>
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
                                className="createContractModalContainer__gridLabelInput__inputFile__nameContract__item">
                                    {contractFormData.image_dni.name}
                                </p>
                            </div>
                        )}
                        
                    </div>

                </div>

                <div className='createContractModalContainer__btnCreateContract'>
                    <button onClick={handleBtnSubmitContract} className='createContractModalContainer__btnCreateContract__prop'>Crear contrato</button>
                </div> 

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

        </>

    )

}

export default CreateContractModal