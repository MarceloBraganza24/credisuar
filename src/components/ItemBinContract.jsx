import React, {useState} from 'react'
import Spinner from './Spinner';
import { toast } from 'react-toastify';

const ItemBinContract = ({contract,fetchDeletedContracts,selectedContracts,setSelectedContracts}) => {
    const [loading, setLoading] = useState(false);
    const [loadingBtnRestore, setLoadingBtnRestore] = useState(false);

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const handleBtnDeleteContract = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8081/api/contracts/${contract._id}`, {
                method: 'DELETE'
            });
            const result = await res.json();
            //console.log(result)
            if (res.ok) {
                toast('Has eliminado el contrato con éxito', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchDeletedContracts();
                setSelectedContracts([])
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
            setLoading(false);
        }
    };

    const handleBtnRestoreContract = async () => {
        try {
            setLoadingBtnRestore(true);
            const res = await fetch(`http://localhost:8081/api/contracts/${contract._id}/restore`, {
                method: 'PUT',
            });

            if (res.ok) {
                toast('Contrato restaurado correctamente', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchDeletedContracts(); // Recargá los productos para ver el cambio
                setSelectedContracts([])
            } else {
                toast('No se pudo restaurar el contrato', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
            }
        } catch (error) {
            console.error('Error al restaurar el contrato:', error);
        }finally {
            setLoadingBtnRestore(false);
        }
    };


    return (
        <>
            <div className="binContainer__contractsTable__itemContainer">

                <div className="binContainer__contractsTable__itemContainer__item">
                    <input
                        type="checkbox"
                        checked={selectedContracts.includes(contract._id)}
                        onChange={() => {
                        if (selectedContracts.includes(contract._id)) {
                            setSelectedContracts(selectedContracts.filter(id => id !== contract._id));
                        } else {
                            setSelectedContracts([...selectedContracts, contract._id]);
                        }
                        }}
                    />
                </div>

                <div className="binContainer__contractsTable__itemContainer__item">
                    <div className="binContainer__contractsTable__itemContainer__item__label">{contract.transaction_number}</div>
                </div>

                <div className="binContainer__contractsTable__itemContainer__item">
                    <div className="binContainer__contractsTable__itemContainer__item__label">{capitalizeFirstLetter(contract.first_name)}</div>
                </div>

                <div className="binContainer__contractsTable__itemContainer__item">
                    <div className="binContainer__contractsTable__itemContainer__item__description">{capitalizeFirstLetter(contract.last_name)}</div>
                </div>

                <div className="binContainer__contractsTable__itemContainer__item">
                    <div className="binContainer__contractsTable__itemContainer__item__label">{contract.dni}</div>
                </div>

                <div className="binContainer__contractsTable__itemContainer__item">
                    <div className="binContainer__contractsTable__itemContainer__item__label">{contract.phoneNumber}</div>
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

                <div className='binContainer__contractsTable__itemContainer__btnsContainer'>
                    {loadingBtnRestore ? (
                        <button
                        disabled
                        className='binContainer__contractsTable__itemContainer__btnsContainer__btn'
                        >
                        <Spinner/>
                        </button>
                    ) : (
                        <button
                        onClick={handleBtnRestoreContract}
                        className='binContainer__contractsTable__itemContainer__btnsContainer__btn'
                        >
                        Restaurar
                        </button>
                    )}

                    {loading ? (
                        <button
                        disabled
                        className='binContainer__contractsTable__itemContainer__btnsContainer__btn'
                        >
                        <Spinner/>
                        </button>
                    ) : (
                        <button
                        onClick={handleBtnDeleteContract}
                        className='binContainer__contractsTable__itemContainer__btnsContainer__btn'
                        >
                        Borrar <br /> permanentemente
                        </button>
                    )}

                </div>

            </div>

        </>
    )

}

export default ItemBinContract