import Home from './components/Home.jsx';
import { IsLoggedInContext } from './context/IsLoggedContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import {useState} from 'react'

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login.jsx';
import SignIn from './components/SignIn.jsx';
import Contracts from './components/Contracts.jsx';
import ChatBot from './components/ChatBot.jsx';
import Bin from './components/Bin.jsx';
import CPanel from './components/CPanel.jsx';
import SendMailPass from './components/SendMailPass.jsx';
import ResetPass from './components/ResetPass.jsx';

function App() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    function ChatbotWrapper({ isOpen, setIsOpen }) {
        const location = useLocation();
        if (location.pathname === "/contracts"
            || location.pathname === "/login"
            || location.pathname === "/bin"
            || location.pathname === "/signIn"
            || location.pathname === "/resetPass"
            || location.pathname === "/sendMail"
            || location.pathname === "/cPanel")
            return null;
        return <ChatBot isOpen={isOpen} setIsOpen={setIsOpen} />;
    }

    return (

        <>

            <BrowserRouter>
            
                <AuthProvider>
                    
                    <IsLoggedInContext>

                        <ChatbotWrapper isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

                        <Routes>

                            <Route exact path="/" element={<Home openChatbot={() => setIsChatOpen(true)} />} />
                            <Route exact path="/login" element={<Login/>}/>
                            <Route exact path="/signIn" element={<SignIn/>}/>
                            <Route exact path="/contracts" element={<Contracts/>}/>
                            <Route exact path="/bin" element={<Bin/>}/>
                            <Route exact path="/cPanel" element={<CPanel/>}/>
                            <Route exact path="/sendMail" element={<SendMailPass/>}/>
                            <Route exact path="/resetPass" element={<ResetPass/>}/>

                        </Routes>

                        <ToastContainer />
                        
                    </IsLoggedInContext>

                </AuthProvider>

            </BrowserRouter>
        
        </>
    )
}

export default App
