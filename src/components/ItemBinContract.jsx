import React, {useState} from 'react'
import Spinner from './Spinner';
import { toast } from 'react-toastify';

const ItemBinContract = ({contract,fetchDeletedContracts,selectedContracts,setSelectedContracts}) => {
    const [loading, setLoading] = useState(false);
    const [loadingBtnRestore, setLoadingBtnRestore] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const handleDownloadImage = async () => {
        try {
            const response = await fetch(`http://localhost:8081/${selectedImage}`);
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

    const formatToReadableDatetime = (isoString) => {
        const date = new Date(isoString);

        const pad = (n) => n.toString().padStart(2, '0');

        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1); // Los meses en JS van de 0 a 11
        const year = date.getFullYear();
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${day}/${month}/${year} ${hours}:${minutes}`;
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
                    <div className="binContainer__contractsTable__itemContainer__item__label">{formatToReadableDatetime(contract.transaction_date)}</div>
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
                        disabled
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
                        disabled
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
                        //onClick={() => setSelectedImage(`http://localhost:8081/${contract.dni_image}`)}
                        onClick={() => setSelectedImage(contract.image_dni)}
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
                            src={`http://localhost:8081/${selectedImage}`}
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

        </>
    )

}

export default ItemBinContract