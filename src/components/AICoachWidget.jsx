import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BoxingGloveIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19,8c0-2.21-1.79-4-4-4h-1.1c-0.61,0-1.17,0.26-1.55,0.72c-0.38-0.46-0.94-0.72-1.55-0.72h-1.1c-0.61,0-1.17,0.26-1.55,0.72 C7.77,4.26,7.21,4,6.6,4H5.5c-2.21,0-4,1.79-4,4v6.5c0,3.59,2.91,6.5,6.5,6.5h6c3.59,0,6.5-2.91,6.5-6.5V8z M14.5,13h-2.5V8.5 c0-0.83,0.67-1.5,1.5-1.5h0.5c0.83,0,1.5,0.67,1.5,1.5V13z M9.5,13H7V8.5c0-0.83,0.67-1.5,1.5-1.5h0.5c0.83,0,1.5,0.67,1.5,1.5V13 z M18.5,14.5c0,2.48-2.02,4.5-4.5,4.5h-6c-2.48,0-4.5-2.02-4.5-4.5V8.5C3.5,7.67,4.17,7,5,7h0.5c0.83,0,1.5,0.67,1.5,1.5V11 c0,0.55,0.45,1,1,1h1.5v2.5h1V12h1.5c0.55,0,1-0.45,1-1V8.5C11.5,7.67,12.17,7,13,7h0.5c0.83,0,1.5,0.67,1.5,1.5V11 c0,0.55,0.45,1,1,1h1.5v2.5h1V12H17c0.55,0,1-0.45,1-1V8.5C18,7.67,18.67,7,19.5,7c0.83,0,1.5,0.67,1.5,1.5V14.5z" />
    </svg>
);

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

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Przygotuj nową wiadomość AI, która będzie aktualizowana
        const requestId = Date.now() + 1;
        setMessages(prev => [...prev, { id: requestId, sender: 'ai', text: '' }]);

        try {
            const response = await fetch('/api/cornerman', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages.concat(userMsg).map(m => ({
                        role: m.sender === 'user' ? 'user' : 'model',
                        content: m.text
                    }))
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Błąd połączenia z CornerManem');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6);
                        if (dataStr === '[DONE]') break;
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.text) {
                                fullText += data.text;
                                setMessages(prev => prev.map(msg =>
                                    msg.id === requestId ? { ...msg, text: fullText } : msg
                                ));
                            }
                        } catch (e) {
                            console.error("Błąd parsowania streamu:", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage = error.message.includes('Błąd CornerMana')
                ? error.message
                : "Błąd połączenia. Spróbuj za chwilę.";

            setMessages(prev => prev.map(msg =>
                msg.id === requestId ? { ...msg, text: errorMessage } : msg
            ));
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.05, x: -5 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 bg-boxing-neon text-black px-6 py-4 rounded-full shadow-[0_0_30px_rgba(204,255,0,0.6)] border border-white/20 flex items-center gap-3 font-black tracking-widest text-sm group"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <BoxingGloveIcon className="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform" />
                        <span className="hidden md:block">CORNERMAN AI</span>
                    </>
                )}
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
                                <p className="text-xs text-gray-400">System Analityczny v1.2-LIVE</p>
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
