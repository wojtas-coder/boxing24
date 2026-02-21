import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
    Layers, Plus, Trash2, ArrowUp, ArrowDown,
    Save, AlertTriangle, Link as LinkIcon, Edit2, Check
} from 'lucide-react';

const AdminFooter = () => {
    const [footerMenu, setFooterMenu] = useState({ quick_links: [], bottom_links: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Edit state
    const [editingSection, setEditingSection] = useState(null); // 'quick_links' | 'bottom_links'
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);

    useEffect(() => {
        fetchFooter();
    }, []);

    const fetchFooter = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('footer_menu')
                .eq('id', 1)
                .single();

            if (error) throw error;
            if (data?.footer_menu) {
                // Ensure defaults if empty object keys
                setFooterMenu({
                    quick_links: data.footer_menu.quick_links || [],
                    bottom_links: data.footer_menu.bottom_links || []
                });
            }
        } catch (err) {
            console.error("Fetch Footer Error:", err);
            setError("Błąd pobierania stopki. Upewnij się, że zaktualizowałeś bazę skryptem SQL.");
        } finally {
            setLoading(false);
        }
    };

    const saveFooter = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const { error } = await supabase
                .from('site_settings')
                .update({ footer_menu: footerMenu })
                .eq('id', 1);

            if (error) throw error;
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Save Footer Error:", err);
            setError(`Błąd zapisu: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // ITEM MOVEMENT
    const moveItem = (section, index, direction) => {
        const newSection = [...footerMenu[section]];
        if (direction === 'up' && index > 0) {
            [newSection[index - 1], newSection[index]] = [newSection[index], newSection[index - 1]];
        } else if (direction === 'down' && index < newSection.length - 1) {
            [newSection[index + 1], newSection[index]] = [newSection[index], newSection[index + 1]];
        }
        setFooterMenu({ ...footerMenu, [section]: newSection });
    };

    // CRUD OPERATIONS
    const handleDelete = (section, id) => {
        if (!window.confirm("Na pewno usunąć ten link ze stopki?")) return;
        const newSection = footerMenu[section].filter(i => i.id !== id);
        setFooterMenu({ ...footerMenu, [section]: newSection });
    };

    const handleAdd = (section) => {
        const newItem = {
            id: `new_${Date.now()}`,
            label: "Nowy Link",
            path: "/"
        };
        const newSection = [...footerMenu[section], newItem];
        setFooterMenu({ ...footerMenu, [section]: newSection });

        // Auto-open edit
        setEditingSection(section);
        setEditingId(newItem.id);
        setEditForm(newItem);
    };

    const handleSaveEdit = (section, index) => {
        const newSection = [...footerMenu[section]];
        newSection[index] = editForm;
        setFooterMenu({ ...footerMenu, [section]: newSection });

        setEditingSection(null);
        setEditingId(null);
        setEditForm(null);
    };

    const handleCancelEdit = () => {
        setEditingSection(null);
        setEditingId(null);
        setEditForm(null);
    };

    const renderItemForm = (section, index) => {
        return (
            <div className="bg-zinc-900 border border-white/10 p-4 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Etykieta (Tekst)</label>
                        <input
                            value={editForm.label}
                            onChange={e => setEditForm({ ...editForm, label: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded p-2 text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Ścieżka (URL)</label>
                        <input
                            value={editForm.path}
                            onChange={e => setEditForm({ ...editForm, path: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded p-2 text-white text-sm font-mono text-blue-400"
                            placeholder="np. /privacy lub https://..."
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                    <button onClick={handleCancelEdit} className="px-4 py-2 text-xs font-bold uppercase text-zinc-500 hover:text-white transition-colors">Anuluj</button>
                    <button onClick={() => handleSaveEdit(section, index)} className="px-4 py-2 bg-red-600 text-white rounded text-xs font-bold uppercase flex items-center gap-2 hover:bg-red-500">
                        <Check className="w-4 h-4" /> Zatwierdź
                    </button>
                </div>
            </div>
        );
    };

    const renderList = (sectionKey, sectionTitle, description) => {
        const items = footerMenu[sectionKey];

        return (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
                        {sectionTitle}
                    </h2>
                    <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">{description}</p>
                </div>

                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={item.id} className="border border-white/5 bg-zinc-950/50 rounded-xl overflow-hidden shadow-lg">
                            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 bg-black/40">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col gap-1 text-zinc-600">
                                        <button onClick={() => moveItem(sectionKey, index, 'up')} disabled={index === 0} className="hover:text-white disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                                        <button onClick={() => moveItem(sectionKey, index, 'down')} disabled={index === items.length - 1} className="hover:text-white disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                                        <div>
                                            <div className="font-bold uppercase tracking-wider text-white">{item.label}</div>
                                            <div className="text-xs font-mono text-blue-400 mt-1 flex items-center gap-1 opacity-70">
                                                <LinkIcon className="w-3 h-3" /> {item.path}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setEditingSection(sectionKey); setEditingId(item.id); setEditForm(item); }} className="p-2 text-zinc-400 border border-white/10 hover:bg-zinc-800 rounded transition-colors" title="Edytuj">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(sectionKey, item.id)} className="p-2 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded transition-colors" title="Usuń">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* EDIT FORM INLINE */}
                            {editingSection === sectionKey && editingId === item.id && (
                                <div className="p-4 bg-zinc-900 border-b border-white/5">
                                    {renderItemForm(sectionKey, index)}
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={() => handleAdd(sectionKey)}
                        className="w-full py-4 border-2 border-dashed border-white/10 hover:border-red-500/50 hover:bg-red-500/5 rounded-xl text-zinc-400 hover:text-red-500 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm transition-all"
                    >
                        <Plus className="w-5 h-5" /> Dodaj Link ({sectionTitle})
                    </button>
                </div>
            </div>
        );
    };

    if (loading) return <div className="animate-pulse text-zinc-500">Ładowanie edytora stopki...</div>;

    return (
        <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
            {/* HDR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Layers className="text-red-600 w-8 h-8" /> Edytor <span className="text-red-600">Stopki</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Zarządzanie linkami u dołu witryny (Footer CMS)</p>
                </div>
                <button
                    onClick={saveFooter}
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 font-bold flex items-center gap-2 rounded-xl transition-all disabled:opacity-50 uppercase tracking-widest text-sm shadow-lg shadow-red-500/20"
                >
                    <Save className="w-4 h-4" /> {saving ? 'Zapisywanie...' : 'Opublikuj Stopkę'}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-bold">{error}</span>
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-900/20 border border-green-500/20 text-green-500 rounded-xl flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-bold">Stopka została pomyślnie zaktualizowana dla wszystkich użytkowników.</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                {renderList('quick_links', 'Szybkie Linki', 'Główna kolumna nawigacji pośrodku stopki')}
                {renderList('bottom_links', 'Linki Dolne', 'Małe linki obok praw autorskich (np. Płytyka Prywatności)')}
            </div>
        </div>
    );
};

export default AdminFooter;
