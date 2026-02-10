
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center font-sans">
                    <div className="bg-zinc-900 border border-red-500/30 p-8 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>

                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <h2 className="text-2xl text-white font-black uppercase italic mb-2 tracking-tighter">
                            Krytyczny Błąd Systemu
                        </h2>

                        <p className="text-zinc-400 text-sm mb-6">
                            Aplikacja napotkała niespodziewany problem.
                        </p>

                        <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-left mb-6 overflow-auto max-h-32">
                            <p className="text-red-400 font-mono text-xs">
                                {this.state.error?.toString()}
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Restart Systemu
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
