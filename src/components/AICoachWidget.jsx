import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AICoachWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: 'Witaj w Narożniku. Jestem Twoim analitykiem (CornerMan AI). Analizuję dane biometryczne i taktykę. W czym mogę pomóc? (Technika, Strategia, Regeneracja)'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        // User Message
        const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulated AI Response (Ekspercki ton)
        setTimeout(() => {
            const responses = [
                "Analizuję Twój profil... Wykryłem potencjalną asymetrię w rotacji biodra przy ciosie prostym. Sugeruję skupienie się na module 'Internal Rotation' w sekcji Compendium.",
                "Z biologicznego punktu widzenia, Twój układ nerwowy wymaga teraz 48h regeneracji (HRV dropped). Zalecam protokół sauny i suplementację magnezem.",
                "Jeśli przeciwnik jest wyższy, musisz skrócić dystans używając balansu tułowiem (Slip & Roll). Nie wchodź w linię prostą, bo nadziejesz się na kontrę.",
                "To pytanie wymaga głębszej analizy Twojego stylu walki. Zapraszam do sekcji VIP na konsultację."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: randomResponse
            }]);
            setIsTyping(false);
        }, 2000);
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 bg-boxing-neon text-black p-4 rounded-full shadow-[0_0_20px_rgba(204,255,0,0.4)] border border-white/20"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Brain className="w-6 h-6" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[400px] h-[500px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
                            <div className="w-2 h-2 rounded-full bg-boxing-neon animate-pulse"></div>
                            <div>
                                <h3 className="text-white font-bold text-sm tracking-wider uppercase">CornerMan AI</h3>
                                <p className="text-xs text-gray-400">System Analityczny v1.0</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                            ? 'bg-zinc-800 text-white rounded-br-none'
                                            : 'bg-boxing-neon/10 text-gray-200 border border-boxing-neon/20 rounded-bl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-boxing-neon/10 p-3 rounded-2xl rounded-bl-none border border-boxing-neon/20 flex gap-2">
                                        <div className="w-2 h-2 bg-boxing-neon rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-boxing-neon rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-boxing-neon rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Zapytaj o analizę..."
                                    className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-boxing-neon focus:ring-1 focus:ring-boxing-neon transition-all placeholder:text-gray-600"
                                />
                                <button
                                    onClick={handleSend}
                                    className="bg-boxing-neon text-black p-2 rounded-xl hover:bg-[#bbe000] transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="text-[10px] text-gray-600 text-center mt-2">
                                AI nie udziela porad medycznych.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AICoachWidget;
