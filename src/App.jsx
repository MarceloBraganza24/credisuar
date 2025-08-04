import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import Home from './components/Home.jsx';
import Login from './components/Login.jsx';
import SignIn from './components/SignIn.jsx';
import Contracts from './components/Contracts.jsx';
import Bin from './components/Bin.jsx';
import CPanel from './components/CPanel.jsx';
import SendMailPass from './components/SendMailPass.jsx';
import ResetPass from './components/ResetPass.jsx';
import ChatBot from './components/ChatBot.jsx';

import { fetchWithAuth } from './components/FetchWithAuth.jsx';
import { useAuth, AuthProvider } from './context/AuthContext.jsx';
import { IsLoggedInContext } from './context/IsLoggedContext.jsx';

function ChatbotWrapper({ isOpen, setIsOpen }) {
  const location = useLocation();
  const hiddenRoutes = ["/contracts", "/login", "/bin", "/signIn", "/resetPass", "/sendMail", "/cPanel"];
  if (hiddenRoutes.includes(location.pathname)) return null;
  return <ChatBot isOpen={isOpen} setIsOpen={setIsOpen} />;
}

function AppContent() {
  const { setToken, fetchCurrentUser } = useAuth();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(30);
  const countdownIntervalRef = useRef(null);
  const logoutTimeoutRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = parseJwt(token);
      if (!decoded?.exp) return;

      const now = Date.now();
      const expirationTime = decoded.exp * 1000;
      const timeUntilExpire = expirationTime - now;

      if (timeUntilExpire <= 0) {
        handleLogout();
      } else if (timeUntilExpire <= 30000 && !showSessionModal) {
        setShowSessionModal(true);
        startLogoutCountdown();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showSessionModal]);

  const startLogoutCountdown = () => {
    let seconds = 30;
    setLogoutCountdown(seconds);

    countdownIntervalRef.current = setInterval(() => {
      seconds -= 1;
      setLogoutCountdown(seconds);
      if (seconds <= 0) clearInterval(countdownIntervalRef.current);
    }, 1000);

    logoutTimeoutRef.current = setTimeout(() => {
      setShowSessionModal(false);
      window.location.reload();
    }, 30000);
  };

  const cancelCountdown = () => {
    clearTimeout(logoutTimeoutRef.current);
    clearInterval(countdownIntervalRef.current);
    setLogoutCountdown(30);
  };

  const handleExtendSession = async () => {
    cancelCountdown();

    const res = await fetch(`${apiUrl}/api/sessions/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    if (res.ok && data.data?.token) {
      localStorage.setItem("token", data.data.token);
      setToken(data.data.token);
      await fetchCurrentUser();
      setShowSessionModal(false);
    } else {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    cancelCountdown();
    const response = await fetchWithAuth('/api/sessions/logout', {
      method: 'POST',
    });

    if (response) {
      toast('Gracias por visitar nuestra página', {
        position: "top-right",
        autoClose: 1500,
        theme: "dark",
        className: "custom-toast",
      });
      localStorage.removeItem("token");
      setTimeout(() => {
        setShowSessionModal(false);
        window.location.href = '/';
      }, 2000);
    }
  };

  return (
    <>
      {showSessionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Tu sesión está por expirar</h2>
            <p>¿Querés continuar con la sesión?</p>
            <p><strong>Se cerrará automáticamente en {logoutCountdown} segundos</strong></p>
            <button onClick={handleExtendSession}>Continuar sesión</button>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      )}

      <ChatbotWrapper isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

      <Routes>
        <Route path="/" element={<Home openChatbot={() => setIsChatOpen(true)} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/bin" element={<Bin />} />
        <Route path="/cPanel" element={<CPanel />} />
        <Route path="/sendMail" element={<SendMailPass />} />
        <Route path="/resetPass" element={<ResetPass />} />
      </Routes>

      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <IsLoggedInContext>
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
      </IsLoggedInContext>
    </AuthProvider>
  );
}

export default App;
