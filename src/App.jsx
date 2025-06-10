import Home from './components/Home.jsx';
import { IsLoggedInContext } from './context/IsLoggedContext.jsx';

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login.jsx';
import SignIn from './components/SignIn.jsx';
import Contracts from './components/Contracts.jsx';

function App() {

    return (

        <>
        
        <BrowserRouter>

                <IsLoggedInContext>

                        <Routes>

                            <Route exact path="/" element={<Home/>}/>
                            <Route exact path="/login" element={<Login/>}/>
                            <Route exact path="/signIn" element={<SignIn/>}/>
                            <Route exact path="/contracts" element={<Contracts/>}/>

                        </Routes>

                        <ToastContainer />
                    
                </IsLoggedInContext>

        </BrowserRouter>
        
        </>
    )
}

export default App
