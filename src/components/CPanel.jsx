import {useState,useEffect} from 'react'
import { Link,useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const CPanel = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [menuOptions, setMenuOptions] = useState(false);
    const [user, setUser] = useState('');
    const [loadingUserId, setLoadingUserId] = useState(null);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [adminUsers, setAdminUsers] = useState([]);
    const [adminsEdited, setAdminsEdited] = useState([]);
    const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
    const navigate = useNavigate();

    const btnShowMenuOptions = () => {
        if(menuOptions) {
            setMenuOptions(false)
        } else {
            setMenuOptions(true)
        }
    };

    const [userformData, setUserformData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserformData({
            ...userformData,
            [name]: value
        });
    };

    const fetchCurrentUser = async () => {
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
    };

    const fetchAdminUsers = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/users/getAdmins`, {
                method: 'GET',
                credentials: 'include', // MUY IMPORTANTE para enviar cookies
            });
            const data = await response.json();
            if(data.error === 'jwt must be provided') { 
                navigate('/')
                setUser(null)
            } else if(response.ok) {
                setAdminUsers(data.data)
                setAdminsEdited(data.data.map(admin => ({ ...admin })));
                //setAdminsEdited(data.data.map(admin => ({ ...admin })));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchCurrentUser()
        fetchAdminUsers()
    },[])

    const handleBtnSubmitUser = async () => {
        // Validación de campos vacíos
        if (
            !userformData.first_name.trim() ||
            !userformData.last_name.trim() ||
            !userformData.email.trim() ||
            !userformData.password.trim() ||
            !userformData.role || userformData.role === ''
        ) {
            toast('Por favor, completá todos los campos', {
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

        try {
            const response = await fetch(`${apiUrl}/api/sessions/signIn`, {
                method: 'POST',  
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: userformData.first_name,
                    last_name: userformData.last_name,
                    email: userformData.email,
                    role: userformData.role,
                    password: userformData.password,
                })
            });
            if (response.ok) {
                toast('Usuario creado exitosamente!', {
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
                setUserformData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    role: '',
                });
                fetchAdminUsers()
            } else {
                toast('Error al crear el usuario!', {
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

    const handleSaveUser = async (index) => {
        const adminToSave = adminUsers[index];
        try {
            const response = await fetch(`${apiUrl}/api/users/${adminToSave._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: adminToSave.first_name,
                    last_name: adminToSave.last_name,
                    email: adminToSave.email,
                    role: adminToSave.role,
                }),
            });
            if (response.ok) {
                const updatedAdmin = await response.json();

                toast('Has guardado los cambios', {
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
                fetchAdminUsers()

            } else {
                toast('Error al guardar cambios', {
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
            toast('Error en la conexión', {
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

    const handleBtnDeleteUser = async (userId) => {
        setLoadingUserId(userId);
        try {
            const res = await fetch(`${apiUrl}/api/users/delete-one/${userId}`, {
                method: 'DELETE',  // Usamos PUT o PATCH para actualizar, no DELETE
            });
            if (res.ok) {
                toast('Has eliminado el usuario con éxito', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
                fetchAdminUsers()
            } else {
                toast('No se ha podido borrar el usuario, intente nuevamente', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                    className: "custom-toast",
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingUserId(null);
        }
    };


    const handleUserFieldChange = (index, field, value) => {
        const updatedUsers = [...adminUsers];
        updatedUsers[index][field] = value;
        setAdminUsers(updatedUsers);
    };

    const handleBtnLogOut = async () => {
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
    }

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

            <div className='cPanelContainer'>

                <div className='cPanelContainer__title'>
                    <div className='cPanelContainer__title__prop'>Panel de control</div>
                </div>

                <div className='cPanelContainer__subTitle'>Crear usuario</div>

                <div className="cPanelContainer__gridLabelInput">

                    <div className="cPanelContainer__gridLabelInput__label">
                        <div className="cPanelContainer__gridLabelInput__label__prop">Nombre</div>
                    </div>

                    <div className="cPanelContainer__gridLabelInput__input">
                        <input
                            name="first_name"
                            value={userformData.first_name}
                            onChange={handleInputChange}
                            placeholder="Nombre"
                            className="cPanelContainer__gridLabelInput__input__prop"
                        />
                    </div>

                </div>

                <div className="cPanelContainer__gridLabelInput">

                    <div className="cPanelContainer__gridLabelInput__label">
                        <div className="cPanelContainer__gridLabelInput__label__prop">Apellido</div>
                    </div>

                    <div className="cPanelContainer__gridLabelInput__input">
                        <input
                            name="last_name"
                            placeholder="Apellido"
                            value={userformData.last_name}
                            onChange={handleInputChange}
                            className="cPanelContainer__gridLabelInput__input__prop"
                        />
                    </div>

                </div>

                <div className="cPanelContainer__gridLabelInput">

                    <div className="cPanelContainer__gridLabelInput__label">
                        <div className="cPanelContainer__gridLabelInput__label__prop">Email</div>
                    </div>

                    <div className="cPanelContainer__gridLabelInput__input">
                        <input
                            name="email"
                            type='email'
                            placeholder="Apellido"
                            value={userformData.email}
                            onChange={handleInputChange}
                            className="cPanelContainer__gridLabelInput__input__prop"
                        />
                    </div>

                </div>

                <div className="cPanelContainer__gridLabelInput">

                    <div className="cPanelContainer__gridLabelInput__label">
                        <div className="cPanelContainer__gridLabelInput__label__prop">Contraseña</div>
                    </div>

                    <div className="cPanelContainer__gridLabelInput__input">
                        <input
                            name="password"
                            type='password'
                            placeholder="Contraseña"
                            value={userformData.password}
                            onChange={handleInputChange}
                            className="cPanelContainer__gridLabelInput__input__prop"
                        />
                    </div>

                </div>

                <div className="cPanelContainer__gridLabelInput">

                    <div className="cPanelContainer__gridLabelInput__label">
                        <div className="cPanelContainer__gridLabelInput__label__prop">Rol</div>
                    </div>

                    <div className="cPanelContainer__gridLabelInput__input">
                        <select
                            name="role"
                            value={userformData.role}
                            onChange={handleInputChange}
                            className='cPanelContainer__gridLabelInput__input__prop'
                            required
                        >
                            <option value="">Seleccionar rol</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                </div>

                <div className='cPanelContainer__separator'>
                    <div className='cPanelContainer__separator__prop'></div>
                </div>

                <div className='cPanelContainer__headerTable'>
                    <div className='cPanelContainer__headerTable__item'>Nombre</div>
                    <div className='cPanelContainer__headerTable__item'>Apellido</div>
                    <div className='cPanelContainer__headerTable__item'>Email</div>
                    <div className='cPanelContainer__headerTable__item'>Contraseña</div>
                    <div className='cPanelContainer__headerTable__item'>Rol</div>
                </div>

                <div className='cPanelContainer__contractsTable'>

                    <div className='cPanelContainer__contractsTable__createContractContainer'>

                        <div className='cPanelContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleInputChange} value={userformData.first_name} className='cPanelContainer__contractsTable__createContractContainer__input__prop' type="text" name="first_name" placeholder="Nombre" required/>
                        </div>
                        <div className='cPanelContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleInputChange} value={userformData.last_name} className='cPanelContainer__contractsTable__createContractContainer__input__prop' type="text" name="last_name" placeholder="Apellido" required/>
                        </div>
                        <div className='cPanelContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleInputChange} value={userformData.email} className='cPanelContainer__contractsTable__createContractContainer__input__prop' type="email" name="email" placeholder="Email" required/>
                        </div>
                        <div className='cPanelContainer__contractsTable__createContractContainer__input'>
                            <input onChange={handleInputChange} value={userformData.password} className='cPanelContainer__contractsTable__createContractContainer__input__prop' type="password" name="password" placeholder="Contraseña" required/>
                        </div>
                        <div className='cPanelContainer__contractsTable__createContractContainer__input'>
                            <select
                                name="role"
                                value={userformData.role}
                                onChange={handleInputChange}
                                className='cPanelContainer__contractsTable__createContractContainer__input__prop'
                                required
                            >
                                <option value="">Seleccionar rol</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <div className='cPanelContainer__contractsTable__createContractContainer__btn'>
                            <button className='cPanelContainer__contractsTable__createContractContainer__btn__prop' onClick={handleBtnSubmitUser}>Crear usuario</button>
                        </div>

                    </div>

                    <div className='cPanelContainer__contractsTable__subTitleTable'>Usuarios administradores</div>

                    <div className='cPanelContainer__quantityContracts__prop'>Cantidad de usuarios: {adminUsers.length}</div>        


                    <div className='cPanelContainer__contractsTable__header'>
                        <div className='cPanelContainer__contractsTable__header__item'></div>
                        <div className='cPanelContainer__headerTable__item'>Nombre</div>
                        <div className='cPanelContainer__headerTable__item'>Apellido</div>
                        <div className='cPanelContainer__headerTable__item'>Email</div>
                        <div className='cPanelContainer__headerTable__item'>Contraseña</div>
                        <div className='cPanelContainer__contractsTable__header__item'></div>
                    </div>

                    {
                        isLoadingUsers ? 
                            <>
                                <div className="cPanelContainer__contractsTable__isLoadingLabel">
                                    Cargando usuarios&nbsp;&nbsp;<Spinner/>
                                </div>
                            </>
                        :
                        adminUsers.map((user, index) => (
                            <>
                                <div className="cPanelContainer__contractsTable__itemContractContainer" key={user._id}>
                                    <div className="cPanelContainer__contractsTable__itemContractContainer__input">
                                        <input
                                            className='cPanelContainer__contractsTable__itemContractContainer__input__prop'
                                            type="text"
                                            value={user.first_name}
                                            onChange={(e) => handleUserFieldChange(index, 'first_name', e.target.value)}
                                            />
                                    </div>
                                    <div className="cPanelContainer__contractsTable__itemContractContainer__input">
                                        <input
                                            className='cPanelContainer__contractsTable__itemContractContainer__input__prop'
                                            type="text"
                                            value={user.last_name}
                                            onChange={(e) => handleUserFieldChange(index, 'last_name', e.target.value)}
                                            />
                                    </div>
                                    <div className="cPanelContainer__contractsTable__itemContractContainer__input">
                                        <input
                                            className='cPanelContainer__contractsTable__itemContractContainer__input__prop'
                                            type="email"
                                            value={user.email}
                                            onChange={(e) => handleUserFieldChange(index, 'email', e.target.value)}
                                            />
                                    </div>
                                    <div className="cPanelContainer__contractsTable__itemContractContainer__input">
                                        -
                                    </div>
                                    <div className="cPanelContainer__contractsTable__itemContractContainer__input">
                                        {user.role}
                                    </div>


                                    <div className="cPanelContainer__contractsTable__itemContractContainer__btn">
                                        <button className='cPanelContainer__contractsTable__itemContractContainer__btn__prop' onClick={() => handleSaveUser(index)}>Actualizar</button>
                                        {loadingUserId === user._id ? (
                                            <button
                                            disabled
                                            className='cPanelProductsContainer__productsTable__itemContainer__btnsContainer__btn'
                                            >
                                            <Spinner/>
                                            </button>
                                        ) : (
                                            <button
                                            onClick={() => handleBtnDeleteUser(user._id)}
                                            className='cPanelContainer__contractsTable__itemContractContainer__btn__prop'
                                            >
                                            Borrar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="cPanelContainer__contractsTable__itemContractContainerMobile" key={user._id}>
                                    <div className="cPanelContainer__contractsTable__itemContractContainerMobile__input">
                                        <input
                                            className='cPanelContainer__contractsTable__itemContractContainerMobile__input__prop'
                                            type="text"
                                            placeholder='Nombre'
                                            value={user.first_name}
                                            onChange={(e) => handleUserFieldChange(index, 'first_name', e.target.value)}
                                            />
                                    </div>
                                    <div className="cPanelContainer__contractsTable__itemContractContainerMobile__input">
                                        <input
                                            className='cPanelContainer__contractsTable__itemContractContainerMobile__input__prop'
                                            type="text"
                                            placeholder='Apellido'
                                            value={user.last_name}
                                            onChange={(e) => handleUserFieldChange(index, 'last_name', e.target.value)}
                                            />
                                    </div>
                                    <div className="cPanelContainer__contractsTable__itemContractContainerMobile__input">
                                        <input
                                            placeholder='Email'
                                            className='cPanelContainer__contractsTable__itemContractContainerMobile__input__prop'
                                            type="email"
                                            value={user.email}
                                            onChange={(e) => handleUserFieldChange(index, 'email', e.target.value)}
                                            />
                                    </div>

                                    <div className="cPanelContainer__contractsTable__itemContractContainerMobile__btn">
                                        <button className='cPanelContainer__contractsTable__itemContractContainerMobile__btn__prop' onClick={() => handleSaveUser(index)}>Actualizar</button>
                                        {loadingUserId === user._id ? (
                                            <button
                                            disabled
                                            className='cPanelProductsContainer__productsTable__itemContainer__btnsContainer__btn'
                                            >
                                            <Spinner/>
                                            </button>
                                        ) : (
                                            <button
                                            onClick={() => handleBtnDeleteUser(user._id)}
                                            className='cPanelContainer__contractsTable__itemContractContainerMobile__btn__prop'
                                            >
                                            Borrar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        ))
                    }

                </div>

            </div>
        
        </>
    )
}

export default CPanel