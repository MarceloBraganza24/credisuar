import Home from './components/Home.jsx';
import { IsLoggedInContext } from './context/IsLoggedContext.jsx';

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

    return (

        <>
        
        <BrowserRouter>

                <IsLoggedInContext>

                        <Routes>

                            <Route exact path="/" element={<Home/>}/>

                        </Routes>

                        <ToastContainer />
                    
                </IsLoggedInContext>

        </BrowserRouter>
        
        </>
    )
}

export default App
