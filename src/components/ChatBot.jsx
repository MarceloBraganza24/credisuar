import React, { useState } from "react";
import { FaTimes, FaCommentDots } from "react-icons/fa";

const HISTORY_START_STEP = "tarjeta_de_crédito_activa";

const chatbotFlow = {
    inicio: {
        question: "Completá tus datos para empezar:",
        options: [] // se maneja con inputs
    },
    start: {
        question: "", // personalizado dinámicamente
        options: [
        { text: "Continuar", next: "tarjeta_de_crédito_activa" },
        { text: "Volver al inicio", next: "inicio" },
        ]
    },
    tarjeta_de_crédito_activa: {
        question: "¿Tenés tarjeta de crédito activa?",
        options: [
        { text: "Sí", next: "que_tarjeta_tenes" },
        { text: "No", next: "imposible_solicitar_prestamo" },
        ]
    },
    que_tarjeta_tenes: {
        question: "¿Qué tarjeta tenés?",
        options: [
        { text: "Visa", next: "sos_titular_de_la_tarjeta" },
        { text: "Mastercard", next: "sos_titular_de_la_tarjeta" },
        { text: "Naranja", next: "sos_titular_de_la_tarjeta" },
        { text: "Otra", next: "sos_titular_de_la_tarjeta" }
        ]
    },
    sos_titular_de_la_tarjeta: {
        question: "¿Sos titular de la tarjeta?",
        options: [
        { text: "Sí", next: "final_confirmacion" },
        { text: "No", next: "imposible_solicitar_prestamo" },
        ]
    },
    imposible_solicitar_prestamo: {
        question: "No es posible solicitar el préstamo.",
        options: [
        { text: "Volver al inicio", next: "start" }
        ]
    },
    final_confirmacion: {
        question: "¡Gracias! Ya tenemos todo.\nA partir de ahora te contactamos con nuestro asesor para finalizar tu solicitud.",
        options: [] // botón se maneja desde código
    }
};

export default function ChatBot({ isOpen, setIsOpen }) {
    const [currentStep, setCurrentStep] = useState("inicio");
    const [history, setHistory] = useState([]);
    const [formData, setFormData] = useState({
        nombre: "",
        monto: "",
        cuotas: "",
    });

    const step = chatbotFlow[currentStep];

    const handleOptionClick = (option) => {
        const { text, next } = option;

        const currentQuestion = chatbotFlow[currentStep].question;

        // 🧼 Si se vuelve al inicio o al paso previo al flujo (start), limpiamos historial
        if (next === "inicio" || next === "start") {
            setCurrentStep(next);
            setHistory([]);
            return;
        }

        // ❌ Si va a "imposible_solicitar_prestamo", también reseteamos el historial
        if (next === "imposible_solicitar_prestamo") {
            setHistory([]);
        }

        // 🪪 Guardar la tarjeta si estamos en ese paso
        if (currentStep === "que_tarjeta_tenes") {
            setFormData((prev) => ({
                ...prev,
                tarjeta: text
            }));
        }

        // ✅ Guardamos la pregunta solo si estamos en o después de la pregunta clave
        const shouldStoreHistory =
            Object.keys(chatbotFlow).indexOf(currentStep) >=
            Object.keys(chatbotFlow).indexOf(HISTORY_START_STEP);

        const isDuplicate = history.some(
            (item) => item.question === currentQuestion && item.answer === text
        );

        if (currentQuestion && !isDuplicate && shouldStoreHistory) {
            setHistory((prev) => [
                ...prev,
                { question: currentQuestion, answer: text }
            ]);
        }

        setCurrentStep(next);
    };



    const handleInputChange = (e) => {
        setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = () => {
        const { nombre, monto, cuotas } = formData;
        const whatsappNumber = "5492926507044";

        const now = new Date();

        const fechaId = now.toISOString().slice(0, 10).replace(/-/g, ""); // para el ID: 20250710
        const id = `PRE-${fechaId}`;

        // Formatear fecha con hora
        const dia = now.getDate().toString().padStart(2, "0");
        const mes = (now.getMonth() + 1).toString().padStart(2, "0");
        const anio = now.getFullYear();
        const horas = now.getHours().toString().padStart(2, "0");
        const minutos = now.getMinutes().toString().padStart(2, "0");

        const fecha = `${dia}/${mes}/${anio} ${horas}:${minutos}`; // 10/07/2025 16:08

        const seleccion = history
        .map((item) => `• ${item.question}\n→ ${item.answer}`)
        .join("\n\n");

        const message = `✅ Solicitud de préstamo

🆔 ID: ${id}
📅 Fecha: ${fecha} hs.
🙋‍♂️ Nombre: ${nombre}
💰 Monto solicitado: $${monto}
📆 Cuotas: ${cuotas}

📋 Respuestas:
${seleccion}`;

        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
        )}`;

        window.open(whatsappURL, "_blank");
    };

    return (
        <>
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
            <FaCommentDots color="black" size={24} />
        </button>

        {isOpen && (
            <div className="chatbot-window">
                <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                    <FaTimes color="black" size={25} />
                </button>

                <div className="chatbot-messages">
                    <p>
                    {currentStep === "start"
                        ? `¡Hola ${formData.nombre}! Recibimos tu solicitud de $${formData.monto} en ${formData.cuotas} cuotas. Antes de conectarte con un asesor, respondé estas breves preguntas:`
                        : step.question}
                    </p>
                </div>

                <div className="chatbot-options">
                {currentStep === "inicio" ? (
                    <>
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre completo"
                        value={formData.nombre}
                        onChange={handleInputChange}
                    />
                    <input
                        type="number"
                        name="monto"
                        placeholder="Monto a solicitar"
                        value={formData.monto}
                        onChange={handleInputChange}
                    />
                    <input
                        type="number"
                        name="cuotas"
                        placeholder="Cantidad de cuotas"
                        value={formData.cuotas}
                        onChange={handleInputChange}
                    />
                    <button
                        onClick={() => {
                        if (formData.nombre && formData.monto && formData.cuotas) {
                            setCurrentStep("start");
                        }
                        }}
                    >
                        Continuar
                    </button>
                    </>
                ) : currentStep === "final_confirmacion" ? (
                    <>
                    <button className="btnChatBot" onClick={handleSubmit}>Contactar asesor</button>
                    </>
                ) : (
                   step.options.map((option, index) => (
                        <button style={{backgroundColor:'black', color:'white'}} key={index} onClick={() => handleOptionClick(option)}>
                            {option.text}
                        </button>
                    ))

                )}
                </div>

            </div>
        )}
        </>
    );
}
