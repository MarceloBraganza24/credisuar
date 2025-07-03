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
import Bin from './components/Bin.jsx';

function App() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    function ChatbotWrapper({ isOpen, setIsOpen }) {
        const location = useLocation();
        if (location.pathname === "/contracts"
            || location.pathname === "/login"
            || location.pathname === "/bin")
            return null;
        return <ChatBot isOpen={isOpen} setIsOpen={setIsOpen} />;
    }

    return (

        <>

            <BrowserRouter>

                    <IsLoggedInContext>

                        <ChatbotWrapper isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

                        <Routes>

                            <Route exact path="/" element={<Home openChatbot={() => setIsChatOpen(true)} />} />
                            <Route exact path="/login" element={<Login/>}/>
                            <Route exact path="/signIn" element={<SignIn/>}/>
                            <Route exact path="/contracts" element={<Contracts/>}/>
                            <Route exact path="/bin" element={<Bin/>}/>

                        </Routes>

                        <ToastContainer />
                        
                    </IsLoggedInContext>

            </BrowserRouter>
        
        </>
    )
}

export default App
