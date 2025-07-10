import React, { useState } from "react";
import { FaTimes, FaCommentDots } from "react-icons/fa";

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
        { text: "Sí", next: "final_contacto" },
        { text: "No", next: "imposible_solicitar_prestamo" },
        ]
    },
    imposible_solicitar_prestamo: {
        question: "No es posible solicitar el préstamo.",
        options: [
        { text: "Volver al inicio", next: "start" }
        ]
    },
    final_contacto: {
        question: "¿Cuál es tu DNI?",
        options: [] // se maneja con input
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
        dni: "",
    });

    const step = chatbotFlow[currentStep];

    const handleOptionClick = (nextStep) => {
        const selectedOption = chatbotFlow[currentStep].options.find(
            (opt) => opt.next === nextStep
        );

        if (selectedOption) {
            const currentQuestion = chatbotFlow[currentStep].question;
            const currentAnswer = selectedOption.text;

            // Evitamos duplicados exactos en el historial
            const isDuplicate = history.some(
                (item) => item.question === currentQuestion && item.answer === currentAnswer
            );

            if (currentQuestion && !isDuplicate) {
                setHistory((prev) => [
                    ...prev,
                    {
                        question: currentQuestion,
                        answer: currentAnswer,
                    },
                ]);
            }
        }

        setCurrentStep(nextStep);
    };

    const handleInputChange = (e) => {
        setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = () => {
        const { nombre, monto, cuotas, dni } = formData;
        const whatsappNumber = "5492926459172";

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
        🪪 DNI: ${dni}
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
                ) : currentStep === "final_contacto" ? (
                    <>
                    <input
                        type="number"
                        name="dni"
                        placeholder="DNI"
                        value={formData.dni}
                        onChange={handleInputChange}
                    />
                    <button
                        onClick={() => {
                        if (formData.dni) {
                            setCurrentStep("final_confirmacion");
                        }
                        }}
                    >
                        Continuar
                    </button>
                    <button
                        onClick={() => {
                        setCurrentStep("start");
                        setHistory([]);
                        }}
                    >
                        Volver al inicio
                    </button>
                    </>
                ) : currentStep === "final_confirmacion" ? (
                    <>
                    <button onClick={handleSubmit}>Contactar asesor</button>
                    </>
                ) : (
                    step.options.map((option, index) => (
                    <button key={index} onClick={() => handleOptionClick(option.next)}>
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
