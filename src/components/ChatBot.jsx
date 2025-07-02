// ChatBot.jsx
import React, { useState } from "react";
import { FaTimes,FaCommentDots } from "react-icons/fa"; // ícono de burbuja de chat

const rootOptions = ["Préstamos personales", "Requisitos", "Contacto"];

const chatbotFlow = {
    start: {
        question: "¿En qué podemos ayudarte?",
        options: [
        { text: "Préstamos personales", next: "prestamos" },
        { text: "Requisitos", next: "requisitos" },
        { text: "Contacto", next: "contacto" }
        ]
    },
    prestamos: {
        question: "¿Qué tipo de préstamo te interesa?",
        options: [
        { text: "Con recibo de sueldo", next: "prestamo_sueldo" },
        { text: "Sin recibo de sueldo", next: "prestamo_sin_sueldo" }
        ]
    },
    prestamo_sueldo: {
        question: "Ofrecemos préstamos con tasa preferencial. ¿Querés que te llamemos?",
        options: [
        { text: "Sí, quiero que me llamen", next: "final_contacto" },
        { text: "Volver al inicio", next: "start" }
        ]
    },
    prestamo_sin_sueldo: {
        question: "Podemos ayudarte con un préstamo adaptado. ¿Querés más info?",
        options: [
        { text: "Sí, por favor", next: "final_contacto" },
        { text: "Volver al inicio", next: "start" }
        ]
    },
    final_contacto: {
        question: "Perfecto. Completá el formulario y te contactamos.",
        options: [] // se maneja desde el código con un formulario
    },
    requisitos: {
        question: "Los requisitos son: DNI, servicio y recibo de sueldo.",
        options: [
        { text: "Volver al inicio", next: "start" }
        ]
    },
    contacto: {
        question: "Podés escribirnos a WhatsApp o visitar nuestras oficinas.",
        options: [
            { text: "Ir a WhatsApp", next: "final_contacto" },
            { text: "Volver al inicio", next: "start" }
        ]
    },
    link_whatsapp: {
        question: "Abrí este enlace para contactarnos: https://wa.me/5492926459172",
        options: [
            { text: "Volver al inicio", next: "start" }
        ]
    }
};

export default function ChatBot({ isOpen, setIsOpen }) {
    const [currentStep, setCurrentStep] = useState("start");
    const [history, setHistory] = useState([]);

  // Form state
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        phone: "",
        email: ""
    });

    const step = chatbotFlow[currentStep];

    const handleOptionClick = (nextStep) => {
        const selectedOption = chatbotFlow[currentStep].options.find(opt => opt.next === nextStep);

        if (selectedOption) {
            const isRoot = rootOptions.includes(selectedOption.text);
            
            setHistory(prev =>
                isRoot ? [selectedOption.text] : [...prev, selectedOption.text]
                );
        }

        setCurrentStep(nextStep);
    };



    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        const { nombre, apellido, phone, email } = formData;
        const whatsappNumber = "5492926459172"; // reemplazar por el número de la financiera

        const seleccion = history.map((item, i) => `• ${item}`).join("\n");

        const message = `Hola, soy ${nombre} ${apellido} y me gustaría recibir información. \nEmail: ${email} \nTeléfono: ${phone} \nSeleccioné:\n${seleccion}`;

        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, "_blank");
    };

    /* if (!isOpen) {
        return null;
    } */

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
                        {step.question.includes("https://") ? (
                            <p>
                            {step.question.split("https://")[0]}
                            <a
                                href={`https://${step.question.split("https://")[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                https://{step.question.split("https://")[1]}
                            </a>
                            </p>
                        ) : (
                            <p>{step.question}</p>
                        )}
                    </div>


                <div className="chatbot-options">
                    {currentStep === "final_contacto" ? (
                    <>
                        <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        />
                        <input
                        type="text"
                        name="apellido"
                        placeholder="Apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        />
                        <input
                        type="text"
                        name="phone"
                        placeholder="Teléfono"
                        value={formData.phone}
                        onChange={handleInputChange}
                        />
                        <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        />
                        <button onClick={handleSubmit}>Enviar mensaje</button>
                        <button onClick={() => {
                            setCurrentStep("start");
                            setHistory([]);
                            }}>
                            Volver al inicio
                        </button>
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
