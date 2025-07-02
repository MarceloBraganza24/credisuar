import Home from './components/Home.jsx';
import { IsLoggedInContext } from './context/IsLoggedContext.jsx';
import {useState} from 'react'

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login.jsx';
import SignIn from './components/SignIn.jsx';
import Contracts from './components/Contracts.jsx';
import ChatBot from './components/ChatBot.jsx';

function App() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    function ChatbotWrapper({ isOpen, setIsOpen }) {
        const location = useLocation();

        // Ocultar en /contracts
        if (location.pathname === "/contracts" || location.pathname === "/logIn") return null;

        return <ChatBot isOpen={isOpen} setIsOpen={setIsOpen} />;
    }

    return (

        <>

        {/* <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} /> */}
        
        <BrowserRouter>

                <IsLoggedInContext>

                    <ChatbotWrapper isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

                    <Routes>

                        <Route exact path="/" element={<Home openChatbot={() => setIsChatOpen(true)} />} />
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
