
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Search, Send, User, Clock, CheckCircle } from 'lucide-react';

const AdminMessages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            fetchMessages(selectedUserId);
        }
    }, [selectedUserId]);

    const fetchConversations = async () => {
        // Fetch all profiles. In a real app with thousands of users, we'd filter by 'has_messages' or similar.
        // For now, we fetch profiles and maybe join with messages count.
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .neq('is_admin', true); // Exclude other admins for now

        if (profiles) {
            setConversations(profiles);
        }
        setLoading(false);
    };

    const fetchMessages = async (userId) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUserId) return;

        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('messages')
            .insert({
                sender_id: user.id,
                recipient_id: selectedUserId,
                content: newMessage
            });

        if (!error) {
            setNewMessage('');
            fetchMessages(selectedUserId); // Refresh
        } else {
            alert('Error sending message');
        }
    };

    const selectedUser = conversations.find(c => c.id === selectedUserId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
            {/* Sidebar: User List */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/5 bg-zinc-900/50">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Klienci</h3>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {loading ? <div className="text-center p-4 text-xs text-zinc-500">Ładowanie...</div> :
                        conversations.map(user => (
                            <button
                                key={user.id}
                                onClick={() => setSelectedUserId(user.id)}
                                className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${selectedUserId === user.id ? 'bg-boxing-green text-black' : 'hover:bg-zinc-900 text-zinc-400'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedUserId === user.id ? 'bg-black/20' : 'bg-zinc-800'}`}>
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm leading-none">{user.full_name || 'Użytkownik'}</div>
                                    <div className={`text-[10px] uppercase tracking-wider ${selectedUserId === user.id ? 'text-black/60' : 'text-zinc-600'}`}>{user.email}</div>
                                </div>
                            </button>
                        ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
                            <div className="text-sm font-bold text-white">Rozmowa z: <span className="text-boxing-green">{selectedUser.full_name || selectedUser.email}</span></div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Historia</div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-dots-pattern">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                                    <p className="text-sm">Brak wiadomości. Rozpocznij rozmowę.</p>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.sender_id !== selectedUserId; // Assuming "I" am the admin
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${isMe
                                                    ? 'bg-zinc-800 text-white rounded-tr-none border border-white/10'
                                                    : 'bg-boxing-green text-black rounded-tl-none font-medium'
                                                }`}>
                                                {msg.content}
                                                <div className={`text-[9px] mt-2 opacity-50 uppercase tracking-wider ${isMe ? 'text-zinc-400' : 'text-black'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={sendMessage} className="p-4 border-t border-white/5 bg-zinc-900/30 flex gap-4">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Napisz wiadomość..."
                                className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-boxing-green/50 transition-colors"
                            />
                            <button type="submit" disabled={!newMessage.trim()} className="bg-boxing-green text-black px-6 py-2 rounded-xl font-bold uppercase disabled:opacity-50 hover:bg-white transition-colors">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                        <p className="text-sm">Wybierz użytkownika z listy.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessages;
