import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
    DatabaseBackup, Download, Upload, AlertTriangle,
    CheckCircle2, FileJson, Clock, HardDriveDownload,
    HardDriveUpload, ShieldAlert
} from 'lucide-react';

const AdminBackup = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const fileInputRef = useRef(null);

    // EXPORT (DOWNLOAD)
    const handleExport = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('id', 1)
                .single();

            if (error) throw error;

            // Prepare JSON Blob
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });

            // Create Download Link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dateStr = new Date().toISOString().split('T')[0];
            a.download = `boxing24_backup_${dateStr}.json`;

            // Trigger Download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setSuccess("Kopia zapasowa bazy danych została pobrana na twój dysk.");
        } catch (err) {
            console.error("Export Error:", err);
            setError(`Błąd eksportu: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // IMPORT (UPLOAD)
    const handleImportClick = () => {
        // Trigger hidden file input
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset input so the same file could be selected again if needed
        e.target.value = null;

        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            setError("Tylko pliki .json są obsługiwane.");
            return;
        }

        // CONFIRMATION DIALOG
        if (!window.confirm("Zagrożenie krytyczne: Import tego pliku trwale nadpisze całą obecną konfigurację strony, menu, seo i opisy. Masz pewność, że to prawidłowy plik zapasowy?")) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const fileReader = new FileReader();

            fileReader.onload = async (event) => {
                try {
                    const jsonContent = JSON.parse(event.target.result);

                    // Basic Validation
                    if (!jsonContent || typeof jsonContent !== 'object') {
                        throw new Error("Nieprawidłowy format JSON.");
                    }

                    // Remove protected/auto-generated fields if they exist in the backup
                    const { id, updated_at, ...updateData } = jsonContent;

                    // Update DB
                    const { error: dbError } = await supabase
                        .from('site_settings')
                        .update(updateData)
                        .eq('id', 1);

                    if (dbError) throw dbError;

                    setSuccess("Baza danych została pomyślnie przywrócona z pliku! Odśwież stronę (F5), aby zaktualizować globalne ustawienia CMS.");
                } catch (parseErr) {
                    setError(`Błąd odczytu JSON: ${parseErr.message}`);
                } finally {
                    setLoading(false);
                }
            };

            fileReader.onerror = () => {
                setError("Nie udało się odczytać pliku z dysku.");
                setLoading(false);
            };

            fileReader.readAsText(file);

        } catch (err) {
            console.error("Import Error:", err);
            setError(`Wystąpił nieznany błąd: ${err.message}`);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
            {/* HDR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <DatabaseBackup className="text-red-600 w-8 h-8" /> Kopia <span className="text-red-600">Zapasowa</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Eksport i import globalnej konfiguracji systemu (Settings, Menu, SEO)</p>
                </div>
            </div>

            <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-6 flex gap-4">
                <ShieldAlert className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div className="space-y-2">
                    <h3 className="text-red-500 font-bold uppercase tracking-wider text-sm">Zagrożenie Danych (Uwaga)</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Ten moduł operuje na głównej tabeli <code className="bg-black text-red-400 px-1 rounded">site_settings</code>. Przywrócenie pliku kopii zapasowej nadpisze absolutnie **wszystkie** ustawienia w panelu (SEO, Nawigację z kolorami, Stopkę, Dane kontaktowe, Kolory globalne). Zawsze polecamy wykonanie Eksportu ("Zrzutu") zanim wgrasz stary plik.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 text-red-500 font-bold rounded-xl flex items-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-900/20 border border-green-500/20 text-green-500 font-bold rounded-xl flex items-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{success}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* EXPORT CARD */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 hover:border-blue-500/30 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-150"></div>

                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                        <HardDriveDownload className="w-8 h-8" />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Pobierz Kopię (Eksport)</h2>
                    <p className="text-zinc-400 text-sm mb-8 min-h-[60px]">
                        Generuje i pobiera plik JSON zawierający strukturę całej nawigacji, stopki i wierszy tekstowych oraz konfiguracji SEO i mediów społecznościowych.
                    </p>

                    <button
                        onClick={handleExport}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors uppercase tracking-widest text-sm disabled:opacity-50 disabled:grayscale"
                    >
                        <Download className="w-5 h-5" />
                        {loading ? 'Przetwarzanie zrzutu...' : 'Zapisz plik na dysk'}
                    </button>
                </div>

                {/* IMPORT CARD */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 hover:border-red-500/30 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-150"></div>

                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                        <Upload className="w-8 h-8" />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Przywróć (Import)</h2>
                    <p className="text-zinc-400 text-sm mb-8 min-h-[60px]">
                        Wgraj plik <code className="text-xs text-white bg-white/10 px-1 rounded">.json</code> wcześniej pobrany z tego narzędzia aby zmazać obecne ustawienia i wrzucić stare. Odbuduje to natychmiastowo całą stronę do wskazanego okresu.
                    </p>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json,application/json"
                        className="hidden"
                    />

                    <button
                        onClick={handleImportClick}
                        disabled={loading}
                        className="w-full bg-transparent border-2 border-red-600/50 hover:bg-red-600/10 hover:border-red-600 text-red-500 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors uppercase tracking-widest text-sm disabled:opacity-50 disabled:grayscale"
                    >
                        <Upload className="w-5 h-5" />
                        {loading ? 'Wczytywanie i nadpisywanie...' : 'Wgraj plik JSON'}
                    </button>
                </div>

            </div>

            <div className="flex items-center justify-center gap-2 text-zinc-500 text-xs uppercase tracking-widest border-t border-white/5 pt-8 mt-8">
                <Clock className="w-4 h-4" /> Bazy Danych Supabase są również automatycznie backupowane co 24h na serwerach zewnętrznych.
            </div>
        </div>
    );
};

export default AdminBackup;
