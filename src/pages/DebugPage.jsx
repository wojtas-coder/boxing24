import React from 'react';

const DebugPage = () => {
    return (
        <div className="min-h-screen bg-red-600 flex items-center justify-center text-white p-10 text-center">
            <div>
                <h1 className="text-6xl font-black mb-4">DEPLOYMENT SUCCESS</h1>
                <p className="text-2xl font-mono">Current Time: {new Date().toISOString()}</p>
                <p className="mt-8 text-xl">If you see this red screen, the server IS updating.</p>
                <a href="/admin" className="block mt-8 bg-white text-red-600 px-8 py-4 font-bold rounded-xl hover:bg-black hover:text-white transition-all">
                    GO TO ADMIN PANEL
                </a>
            </div>
        </div>
    );
};

export default DebugPage;
