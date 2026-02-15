import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AICoachWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: 'Witaj w Narożniku. Jestem Twoim analitykiem bokserskim – CornerMan AI. Zapytaj mnie o technikę, taktykę, zawodników lub regenerację. Jestem gotowy do analizy. 🥊'
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
                            // skip parse errors for partial chunks
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
            {/* Toggle Button – Cinematic Premium */}
            <motion.button
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.05, x: -5 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 bg-zinc-900/90 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 flex items-center gap-3 font-bold tracking-widest text-sm group hover:border-red-500/30 hover:shadow-[0_8px_32px_rgba(220,38,38,0.15)] transition-all duration-300"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <Brain className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="hidden md:block uppercase text-xs">CornerMan AI</span>
                    </>
                )}
            </motion.button>

            {/* Chat Window – Cinematic Realism */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[420px] h-[520px] bg-zinc-950/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3 bg-zinc-900/50">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-zinc-950"></div>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm tracking-wider uppercase">CornerMan AI</h3>
                                <p className="text-[11px] text-zinc-500">Twój Analityk Bokserski • Online</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-red-600/90 text-white rounded-br-md'
                                        : 'bg-white/[0.04] text-zinc-300 border border-white/[0.06] rounded-bl-md backdrop-blur-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/[0.04] p-3.5 rounded-2xl rounded-bl-md border border-white/[0.06] flex gap-1.5">
                                        <div className="w-2 h-2 bg-red-500/60 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-red-500/60 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                                        <div className="w-2 h-2 bg-red-500/60 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/[0.06] bg-zinc-900/30">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Zapytaj o taktykę, technikę..."
                                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-zinc-600"
                                />
                                <button
                                    onClick={handleSend}
                                    className="bg-red-600 hover:bg-red-500 text-white p-2.5 rounded-xl transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="text-[10px] text-zinc-600 text-center mt-2">
                                AI nie udziela porad medycznych. Powered by Boxing24.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AICoachWidget;
