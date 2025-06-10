import {useState} from 'react'

const Contracts = () => {

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
                console.log('Contrato creado exitosamente');
                // Hacer algo tras el envío exitoso
            } else {
                console.error('Error al crear el contrato');
                // Manejar el error de manera adecuada
            }
        } catch (error) {
            console.error('Error al enviar los datos:', error);
        }
    };

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
                </div>

                <div className='contractsContainer__contractsTable'>
                    <div className='contractsContainer__contractsTable__input'>
                        <input onChange={handleInputChange} value={contractformData.first_name} className='contractsContainer__contractsTable__input__prop' type="text" name="first_name" placeholder="Nombre" required/>
                    </div>
                    <div className='contractsContainer__contractsTable__input'>
                        <input onChange={handleInputChange} value={contractformData.last_name} className='contractsContainer__contractsTable__input__prop' type="text" name="last_name" placeholder="Apellido" required/>
                    </div>
                    <div className='contractsContainer__contractsTable__input'>
                        <input onChange={handleInputChange} value={contractformData.dni} className='contractsContainer__contractsTable__input__prop' type="text" name="dni" placeholder="DNI" required/>
                    </div>
                    <div className='contractsContainer__contractsTable__input'>
                        <input onChange={handleInputChange} value={contractformData.phoneNumber} className='contractsContainer__contractsTable__input__prop' type="text" name="phoneNumber" placeholder="Teléfono" required/>
                    </div>
                    <div className='contractsContainer__contractsTable__input'>
                        <input onChange={handleFileChange} className='contractsContainer__contractsTable__input__prop' type="file" name="contract_file" accept=".pdf" required/>
                    </div>
                    <div className='contractsContainer__contractsTable__input'>
                        <input onChange={handleFileChange} className='contractsContainer__contractsTable__input__prop' type="file" name="image_dni" accept="image/*" required/>
                    </div>
                    <button onClick={handleBtnSubmitContract}>Crear Contrato</button>
                </div>

            </div>

        </>
    )

}

export default Contracts