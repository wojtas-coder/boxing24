import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
    Menu, Plus, Trash2, ArrowUp, ArrowDown,
    Save, AlertTriangle, Link as LinkIcon, Edit2, Check
} from 'lucide-react';

const AdminNavigation = () => {
    const [navItems, setNavItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);

    useEffect(() => {
        fetchNav();
    }, []);

    const fetchNav = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('navigation_menu')
                .eq('id', 1)
                .single();

            if (error) throw error;
            if (data?.navigation_menu) {
                setNavItems(data.navigation_menu);
            }
        } catch (err) {
            console.error("Fetch Nav Error:", err);
            setError("Błąd pobierania nawigacji. Upewnij się, że zaktualizowałeś bazę skryptem SQL.");
        } finally {
            setLoading(false);
        }
    };

    const saveNav = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const { error } = await supabase
                .from('site_settings')
                .update({ navigation_menu: navItems })
                .eq('id', 1);

            if (error) throw error;
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Save Nav Error:", err);
            setError(`Błąd zapisu: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // ITEM MOVEMENT
    const moveItem = (index, direction, parentIndex = null) => {
        const newItems = [...navItems];
        if (parentIndex !== null) {
            // Moving a child
            const children = [...newItems[parentIndex].children];
            if (direction === 'up' && index > 0) {
                [children[index - 1], children[index]] = [children[index], children[index - 1]];
            } else if (direction === 'down' && index < children.length - 1) {
                [children[index + 1], children[index]] = [children[index], children[index + 1]];
            }
            newItems[parentIndex].children = children;
        } else {
            // Moving a parent
            if (direction === 'up' && index > 0) {
                [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
            } else if (direction === 'down' && index < newItems.length - 1) {
                [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
            }
        }
        setNavItems(newItems);
    };

    // CRUD OPERATIONS
    const handleDelete = (id, parentIndex = null) => {
        if (!window.confirm("Na pewno usunąć ten link?")) return;
        const newItems = [...navItems];
        if (parentIndex !== null) {
            newItems[parentIndex].children = newItems[parentIndex].children.filter(c => c.id !== id);
        } else {
            const filtered = newItems.filter(i => i.id !== id);
            setNavItems(filtered);
            return;
        }
        setNavItems(newItems);
    };

    const handleAdd = (parentIndex = null) => {
        const newItem = {
            id: Date.now().toString(),
            label: "Nowy Link",
            path: "/",
            color: ""
        };

        const newItems = [...navItems];
        if (parentIndex !== null) {
            if (!newItems[parentIndex].children) newItems[parentIndex].children = [];
            newItems[parentIndex].children.push(newItem);
        } else {
            newItems.push(newItem);
        }
        setNavItems(newItems);
        // Auto-open edit
        setEditingId(newItem.id);
        setEditForm(newItem);
    };

    const handleSaveEdit = (parentIndex = null, childIndex = null) => {
        const newItems = [...navItems];
        if (parentIndex !== null && childIndex !== null) {
            newItems[parentIndex].children[childIndex] = editForm;
        } else if (parentIndex !== null) {
            newItems[parentIndex] = editForm;
        }
        setNavItems(newItems);
        setEditingId(null);
        setEditForm(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm(null);
    };

    const colorOptions = [
        { label: 'Brak', value: '' },
        { label: 'Czerwony', value: 'text-red-500' },
        { label: 'Zielony', value: 'text-boxing-green' },
        { label: 'Szary', value: 'text-zinc-400' },
        { label: 'Biały', value: 'text-white' },
        { label: 'Żółty', value: 'text-yellow-500' },
        { label: 'Niebieski', value: 'text-blue-500' }
    ];

    if (loading) return <div className="animate-pulse text-zinc-500">Ładowanie drzewa nawigacji...</div>;

    const renderItemForm = (item, parentIndex = null, childIndex = null) => {
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
                            placeholder="np. /news lub https://..."
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Klasa Koloru (Opcjonalnie)</label>
                        <select
                            value={editForm.color || ''}
                            onChange={e => setEditForm({ ...editForm, color: e.target.value })}
                            className="w-full bg-black border border-white/10 rounded p-2 text-white text-sm"
                        >
                            {colorOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                    <button onClick={handleCancelEdit} className="px-4 py-2 text-xs font-bold uppercase text-zinc-500 hover:text-white transition-colors">Anuluj</button>
                    <button onClick={() => handleSaveEdit(parentIndex, childIndex)} className="px-4 py-2 bg-red-600 text-white rounded text-xs font-bold uppercase flex items-center gap-2 hover:bg-red-500">
                        <Check className="w-4 h-4" /> Zatwierdź
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
            {/* HDR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Menu className="text-red-600 w-8 h-8" /> Nawigacja <span className="text-red-600">Menu</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Konfiguracja głównego paska nawigacji witryny</p>
                </div>
                <button
                    onClick={saveNav}
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 font-bold flex items-center gap-2 rounded-xl transition-all disabled:opacity-50 uppercase tracking-widest text-sm shadow-lg shadow-red-500/20"
                >
                    <Save className="w-4 h-4" /> {saving ? 'Zapisywanie...' : 'Opublikuj Zmiany'}
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
                    <span className="text-sm font-bold">Menu zostało zaktualizowane dla wszystkich użytkowników.</span>
                </div>
            )}

            {/* NAV EDITOR LIST */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 md:p-8">
                <div className="space-y-4">
                    {navItems.map((item, index) => (
                        <div key={item.id} className="border border-white/5 bg-zinc-950/50 rounded-xl overflow-hidden shadow-lg">

                            {/* ITEM HEADER */}
                            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 bg-black/40">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col gap-1 text-zinc-600">
                                        <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="hover:text-white disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                                        <button onClick={() => moveItem(index, 'down')} disabled={index === navItems.length - 1} className="hover:text-white disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                                        <div>
                                            <div className={`font-bold uppercase tracking-wider ${item.color || 'text-white'}`}>{item.label}</div>
                                            <div className="text-xs font-mono text-blue-400 mt-1 flex items-center gap-1 opacity-70">
                                                <LinkIcon className="w-3 h-3" /> {item.path}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setEditingId(item.id); setEditForm(item); }} className="p-2 text-zinc-400 border border-white/10 hover:bg-zinc-800 rounded transition-colors" title="Edytuj">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleAdd(index)} className="p-2 text-zinc-400 border border-white/10 hover:bg-zinc-800 rounded transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2" title="Dodaj sub-link">
                                        <Plus className="w-4 h-4" /> Dropdown
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded transition-colors" title="Usuń">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* PARENT EDIT FORM */}
                            {editingId === item.id && (
                                <div className="p-4 bg-zinc-900 border-b border-white/5">
                                    {renderItemForm(item, index)}
                                </div>
                            )}

                            {/* CHILDREN / DROPDOWN LIST */}
                            {item.children && item.children.length > 0 && (
                                <div className="p-4 pl-12 space-y-3 bg-black/20">
                                    {item.children.map((child, childIndex) => (
                                        <div key={child.id} className="relative">
                                            {/* decorative connecting line */}
                                            <div className="absolute -left-6 top-1/2 w-4 border-t border-white/10"></div>

                                            <div className="bg-zinc-900 border border-white/5 p-3 rounded-lg flex items-center justify-between">
                                                {editingId === child.id ? (
                                                    <div className="w-full">{renderItemForm(child, index, childIndex)}</div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex flex-col gap-1 text-zinc-600">
                                                                <button onClick={() => moveItem(childIndex, 'up', index)} disabled={childIndex === 0} className="hover:text-white disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                                                                <button onClick={() => moveItem(childIndex, 'down', index)} disabled={childIndex === item.children.length - 1} className="hover:text-white disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                                                            </div>
                                                            <div>
                                                                <div className={`text-sm tracking-wide font-bold uppercase ${child.color || 'text-zinc-300'}`}>{child.label}</div>
                                                                <div className="text-[10px] font-mono text-zinc-500">{child.path}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => { setEditingId(child.id); setEditForm(child); }} className="p-2 text-zinc-400 hover:text-white transition-colors" title="Edytuj">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(child.id, index)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors" title="Usuń">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* ADD PARENT BUTTON */}
                    <button
                        onClick={() => handleAdd()}
                        className="w-full py-4 border-2 border-dashed border-white/10 hover:border-red-500/50 hover:bg-red-500/5 rounded-xl text-zinc-400 hover:text-red-500 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm transition-all"
                    >
                        <Plus className="w-5 h-5" /> Dodaj Nowy Link Główny
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminNavigation;
