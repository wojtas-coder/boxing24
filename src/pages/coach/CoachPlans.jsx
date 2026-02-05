import React, { useState } from 'react';
import { Dumbbell, Plus, Save, Trash2, Calendar } from 'lucide-react';

const CoachPlans = () => {
    const [plans, setPlans] = useState([
        { id: 1, name: 'Fundamenty Boksu', difficulty: 'Początkujący', duration: '4 tygodnie' },
        { id: 2, name: 'Szybkość i Dynamika', difficulty: 'Zaawansowany', duration: '6 tygodni' }
    ]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                        Kreator <span className="text-blue-500">Planów</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Projektuj cykle treningowe</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 font-bold flex items-center gap-2 rounded-xl transition-all">
                    <Plus className="w-4 h-4" /> Nowy Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl hover:border-blue-500/50 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                                <Dumbbell className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-mono text-zinc-500 border border-white/10 px-2 py-1 rounded">{plan.duration}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                        <p className="text-sm text-zinc-400 mb-4">{plan.difficulty}</p>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                            <button className="flex-1 py-2 text-xs font-bold uppercase bg-white/5 hover:bg-white/10 rounded text-center transition-colors">Edytuj</button>
                            <button className="p-2 text-zinc-500 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}

                {/* Add New Placeholder */}
                <button className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-zinc-600 hover:text-blue-500 hover:border-blue-500/30 transition-all min-h-[200px]">
                    <Plus className="w-12 h-12 mb-2" />
                    <span className="font-bold uppercase tracking-widest text-sm">Stwórz szablon</span>
                </button>
            </div>
        </div>
    );
};

export default CoachPlans;
