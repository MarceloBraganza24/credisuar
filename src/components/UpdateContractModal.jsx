import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const UpdateContractModal = ({ apiUrl, setIsOpenUpdateContractModal, contract, fetchContracts, selectedDate }) => {
    const [selectedPreview, setSelectedPreview] = useState(null);
    const [selectedPdf, setSelectedPdf] = useState(null);
    //console.log(selectedPdf)
    const [selectedImage, setSelectedImage] = useState(null);
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
    console.log(contractFormData)

    /* useEffect(() => {
        if (contract) {
            setContractFormData({
                transaction_number: contract.transaction_number || '',
                transaction_date: contract.transaction_date,
                first_name: contract.first_name || '',
                last_name: contract.last_name || '',
                dni: contract.dni || '',
                phoneNumber: contract.phoneNumber || '',
                contract_file: null,
                contract_file_preview: contract.contract_file || '',
                image_dni: null,
                image_dni_preview: contract.image_dni || ''
            });
        }
    }, [contract]); */
    useEffect(() => {
        if (contract) {
            setContractFormData(prev => ({
            transaction_number: contract.transaction_number || '',
            transaction_date: contract.transaction_date,
            first_name: contract.first_name || '',
            last_name: contract.last_name || '',
            dni: contract.dni || '',
            phoneNumber: contract.phoneNumber || '',
            contract_file: null,
            contract_file_preview: prev.contract_file ? prev.contract_file_preview : contract.contract_file || '',
            image_dni: null,
            image_dni_preview: prev.image_dni ? prev.image_dni_preview : contract.image_dni || ''
            }));
        }
    }, [contract]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContractFormData(prev => ({ ...prev, [name]: value }));
    };

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

    /* const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files?.[0];
        if (!file) return;

        setContractFormData(prev => ({
            ...prev,
            [name]: file,
            ...(name === 'contract_file' && { contract_file_preview: file.name }),
            ...(name === 'image_dni' && { image_dni_preview: URL.createObjectURL(file) }),
        }));

        setTimeout(() => {
            e.target.value = null;
        }, 100);
    }; */
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files?.[0];
        if (!file) return;

        // Limpia el preview anterior si existía y era URL.createObjectURL
        setContractFormData(prev => {
            if (prev[`${name}_preview`] && prev[`${name}_preview`].startsWith('blob:')) {
            URL.revokeObjectURL(prev[`${name}_preview`]);
            }

            return {
            ...prev,
            [name]: file,
            ...(name === 'contract_file' && { contract_file_preview: file.name }),
            ...(name === 'image_dni' && { image_dni_preview: URL.createObjectURL(file) }),
            };
        });

        e.target.value = null;  // Limpio el input inmediatamente (sin timeout)
    };


    const handleBtnUpdateContract = async (id, updatedContract) => {

        const formData = new FormData();

        for (const key in updatedContract) {
            if (key.endsWith('_preview')) continue;

            const value = updatedContract[key];

            if (value instanceof File) {
                formData.append(key, value);
            } else {
                if (key === 'transaction_date' && value) {
                    const localDate = new Date(value);
                    formData.append('transaction_date', localDate.toISOString()); // lo manda como UTC (compatible con Mongo)
                } else {
                    formData.append(key, value ?? '');
                }

                if ((key === 'contract_file' || key === 'image_dni') && value) {
                    formData.append(`existing_${key}`, value); // Manda la ruta antigua si no se reemplazó
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
                fetchContracts(1, "", 'all', selectedDate)
                setIsOpenUpdateContractModal(false)
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

    /* function formatToDatetimeLocal(isoDateString) {
        const date = new Date(isoDateString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    } */
    /* function formatToDatetimeLocal(isoDateString) {
        if (!isoDateString) return '';

        const date = new Date(isoDateString);
        if (isNaN(date.getTime())) return '';

        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    } */
    function formatToDatetimeLocal(isoDateString) {
        if (!isoDateString) return '';

        const date = new Date(isoDateString);
        if (isNaN(date.getTime())) return '';

        // Ajustamos a local sin modificar el valor base
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // mes 0-indexado
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    useEffect(() => {
        return () => {
            if (contractFormData.image_dni && contractFormData.image_dni instanceof File) {
            URL.revokeObjectURL(contractFormData.image_dni_preview);
            }
            if (contractFormData.contract_file && contractFormData.contract_file instanceof File) {
            URL.revokeObjectURL(contractFormData.contract_file_preview);
            }
        };
    }, [contractFormData.image_dni, contractFormData.contract_file]);
    


    return (

        <>
            <div className='updateContractModalContainer'>
                
                <div className='updateContractModalContainer__updateContractModal'>

                    <div className='updateContractModalContainer__updateContractModal__btnCloseModal'>
                        <div onClick={() => setIsOpenUpdateContractModal(false)} className='updateContractModalContainer__updateContractModal__btnCloseModal__btn'>X</div>
                    </div>

                    <div className='updateContractModalContainer__updateContractModal__title'>
                        <div className='updateContractModalContainer__updateContractModal__title__prop'>Editar contrato</div>
                    </div>

                    <div className="updateContractModalContainer__updateContractModal__gridLabelInput">

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label">
                            <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label__prop">N° transacción</div>
                        </div>

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__input">
                            <input
                                name="transaction_number"
                                value={contractFormData.transaction_number}
                                onChange={handleInputChange}
                                className="updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__prop"
                            />
                        </div>

                    </div>

                    <div className="updateContractModalContainer__updateContractModal__gridLabelInput">

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label">
                            <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label__prop">Fecha y hora transacción</div>
                        </div>

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__input">
                            <input
                                name="transaction_date"
                                //value={contractFormData.transaction_date}
                                value={formatToDatetimeLocal(contractFormData.transaction_date)}
                                type="datetime-local"
                                className="updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__prop"
                                onChange={handleInputChange}
                            />
                        </div>

                    </div>

                    <div className="updateContractModalContainer__updateContractModal__gridLabelInput">

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label">
                            <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label__prop">Nombre</div>
                        </div>

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__input">
                            <input
                                name="first_name"
                                className="updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__prop"
                                value={contractFormData.first_name}
                                onChange={handleInputChange}
                            />
                        </div>

                    </div>

                    <div className="updateContractModalContainer__updateContractModal__gridLabelInput">

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label">
                            <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label__prop">Apellido</div>
                        </div>

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__input">
                            <input
                                name="last_name"
                                value={contractFormData.last_name}
                                className="updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__prop"
                                onChange={handleInputChange}
                            />
                        </div>

                    </div>

                    <div className="updateContractModalContainer__updateContractModal__gridLabelInput">

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label">
                            <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label__prop">DNI</div>
                        </div>

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__input">
                            <input
                                name="dni"
                                value={contractFormData.dni}
                                onChange={handleInputChange}
                                className="updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__prop"
                            />
                        </div>

                    </div>

                    <div className="updateContractModalContainer__updateContractModal__gridLabelInput">

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label">
                            <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label__prop">Teléfono</div>
                        </div>

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__input">
                            <input
                                name="phoneNumber"
                                className="updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__prop"
                                value={contractFormData.phoneNumber}
                                onChange={handleInputChange}
                            />
                        </div>

                    </div>

                    <div className="updateContractModalContainer__updateContractModal__gridLabelInput">

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label">
                            <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label__prop">Archivo de contrato</div>
                        </div>

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__inputFile">
                            {/* <label htmlFor={`itemContractListFileInput`} className="updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__fileInputButton">
                                Seleccionar archivo
                            </label> */}
                            <input
                                id={`itemContractListFileInput`}
                                type="file"
                                name="contract_file"
                                accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileChange}
                                className="updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__propFile"
                                required
                            />
                            {contractFormData.contract_file_preview && (
                                <>
                                <p
                                className='updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__label'
                                onClick={() => {
                                    const url = contractFormData.contract_file instanceof File
                                    ? URL.createObjectURL(contractFormData.contract_file)
                                    : `${apiUrl}/${contractFormData.contract_file_preview}`;

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

                    </div>

                    <div className="updateContractModalContainer__updateContractModal__gridLabelInput">

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label">
                            <div className="updateContractModalContainer__updateContractModal__gridLabelInput__label__prop">Imagen DNI</div>
                        </div>

                        <div className="updateContractModalContainer__updateContractModal__gridLabelInput__inputFile">
                            {/* <label htmlFor={`itemContractListImageFileInput`} className="updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__fileInputButton">
                                Seleccionar imagen
                            </label> */}
                            <input
                                id={`itemContractListImageFileInput`}
                                className='updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__propFile'
                                type="file"
                                name="image_dni"
                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileChange}
                            />
                            {/* {contractFormData.image_dni_preview ? (
                            <p
                                className='updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__label'
                                onClick={() => setSelectedImage(contractFormData.image_dni_preview)}
                            >
                                Ver imagen
                            </p>
                            ) :  null} */}
                            {/* {contractFormData.image_dni_preview ? (
                                <p
                                    className='updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__label'
                                    onClick={() => {
                                    const isFile = contractFormData.image_dni instanceof File;
                                    const url = isFile
                                        ? URL.createObjectURL(contractFormData.image_dni)
                                        : `${contractFormData.image_dni_preview}`;

                                    setSelectedImage(url);
                                    }}
                                >
                                    Ver imagen
                                </p>
                            ) : null} */}
                            {contractFormData.image_dni_preview && (
                            <p
                                className="updateContractModalContainer__updateContractModal__gridLabelInput__inputFile__label"
                                onClick={() => setSelectedImage(contractFormData.image_dni_preview)}
                            >
                                Ver imagen
                            </p>
                            )}

                        </div>  

                    </div>

                    <div className='updateContractModalContainer__updateContractModal__btnUpdateContract'>
                        <button onClick={() => handleBtnUpdateContract(contract._id, contractFormData)} className='updateContractModalContainer__updateContractModal__btnUpdateContract__prop'>Actualizar contrato</button>
                    </div>
                </div>

            </div>
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
                        //onClick={(e) => e.stopPropagation()}
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
                        {/* <img
                            src={`${apiUrl}/${selectedImage}`}
                            alt="Imagen en grande"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                borderRadius: '10px',
                            }}
                        /> */}
                        <img
                        src={
                            selectedImage.startsWith('blob:') || selectedImage.startsWith('http')
                            ? selectedImage
                            : `${apiUrl}/${selectedImage}`
                        }
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
                                border:'0.3vh solid black',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                            }}
                        >
                            Descargar imagen
                        </button>


                        
                    </div>
                </div>
            )}
        </>
    );
};

export default UpdateContractModal;
