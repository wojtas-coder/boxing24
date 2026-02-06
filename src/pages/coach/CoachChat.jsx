import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, User, Search, Loader2 } from 'lucide-react';

const CoachChat = () => {
    const { user, session } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);

    // 1. Fetch Conversations (unique users who have messaged or booked)
    useEffect(() => {
        if (user) fetchConversations();
    }, [user]);

    // 2. Poll active chat
    useEffect(() => {
        let interval;
        if (selectedChat) {
            fetchMessages(selectedChat.id);
            interval = setInterval(() => fetchMessages(selectedChat.id), 3000); // Simple polling
        }
        return () => clearInterval(interval);
    }, [selectedChat]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            // This endpoint should ideally return a list of unique users the coach has spoken to
            // For now, let's reuse coach-fighters to get the list of clients, 
            // and maybe eventually filter by "has_messages" if we optimize.
            // TEMPORARY PROD FIX: Hardcode Coach ID
            const coachId = 'wojciech-rewczuk';
            const res = await fetch(`/api/coach-fighters?coachId=${coachId}`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data.fighters || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (clientId) => {
        try {
            const res = await fetch(`/api/messages?user1=${user.id}&user2=${clientId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || !selectedChat) return;

        const payload = {
            sender_id: user.id,
            receiver_id: selectedChat.profile?.id || selectedChat.id, // Ensure UUID
            content: input
        };

        const tempId = Date.now();
        const optimisticMsg = { ...payload, id: tempId, created_at: new Date().toISOString() };
        setMessages([...messages, optimisticMsg]);
        setInput('');

        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            fetchMessages(selectedChat.id); // Refresh to get real ID
        } catch (e) {
            console.error(e);
            alert('Send failed');
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex gap-6 animate-in fade-in">
            {/* LEFT: Users List */}
            <div className="w-1/3 bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5 bg-black/20">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">Wiadomości</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input className="w-full bg-black border border-white/10 rounded-lg py-2 pl-10 text-sm text-white focus:border-blue-500 outline-none" placeholder="Szukaj..." />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? <Loader2 className="mx-auto animate-spin" /> : conversations.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedChat(c)}
                            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${selectedChat?.id === c.id ? 'bg-blue-600/20 border border-blue-500/50' : 'hover:bg-white/5 border border-transparent'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold text-xs border border-white/10">
                                {c.name?.[0] || <User className="w-4 h-4" />}
                            </div>
                            <div className="text-left">
                                <div className="text-white text-sm font-bold">{c.name}</div>
                                <div className="text-zinc-500 text-[10px] uppercase">Kliknij aby otworzyć</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT: Chat Area */}
            <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden flex flex-col relative">
                {!selectedChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                        <span className="uppercase font-bold tracking-widest text-xs">Wybierz rozmowę</span>
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-3">
                            <div className="text-white font-bold">{selectedChat.name}</div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map(m => {
                                const isMe = m.sender_id === user.id;
                                return (
                                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-300 rounded-bl-none'}`}>
                                            {m.content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-4 bg-black/40 border-t border-white/5">
                            <div className="flex gap-4">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Napisz wiadomość..."
                                />
                                <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CoachChat;
