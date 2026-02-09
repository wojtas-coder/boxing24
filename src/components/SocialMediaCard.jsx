import React, { forwardRef } from 'react';
import Logo from './Logo';

const SocialMediaCard = forwardRef(({ result, format = 'square', userName = 'Zawodnik' }, ref) => {
    if (!result) return null;

    const { globalScore } = result;
    const isStory = format === 'story'; // 9:16 vs 1:1

    // Dynamic Styling
    let accentColor = 'text-red-500';
    let borderColor = 'border-red-500/30';
    let gradientFrom = 'from-red-900/20';
    let glowColor = 'bg-red-500';
    let levelTitle = 'ROOKIE';

    if (globalScore >= 50) {
        accentColor = 'text-orange-500';
        borderColor = 'border-orange-500/30';
        gradientFrom = 'from-orange-900/20';
        glowColor = 'bg-orange-500';
        levelTitle = 'CONTENDER';
    }
    if (globalScore >= 70) {
        accentColor = 'text-[#00ff00]';
        borderColor = 'border-[#00ff00]/30';
        gradientFrom = 'from-[#00ff00]/20';
        glowColor = 'bg-[#00ff00]';
        levelTitle = 'ADVANCED';
    }
    if (globalScore >= 85) {
        accentColor = 'text-amber-400';
        borderColor = 'border-amber-400/30';
        gradientFrom = 'from-amber-900/20';
        glowColor = 'bg-amber-400';
        levelTitle = 'ELITE';
    }

    return (
        <div
            ref={ref}
            className={`relative overflow-hidden bg-[#050505] flex flex-col items-center justify-center font-sans ${isStory ? 'w-[1080px] h-[1920px] p-24' : 'w-[1080px] h-[1080px] p-16'
                }`}
            style={{
                // Force strict dimensions for screenshot consistency
                width: 1080,
                height: isStory ? 1920 : 1080
            }}
        >
            {/* Background Effects */}
            <div className={`absolute inset-0 bg-gradient-to-b ${gradientFrom} to-black opacity-50`}></div>
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>

            {/* Top Branding */}
            <div className="absolute top-24 w-full flex flex-col items-center">
                <div className="scale-150 mb-8 opacity-80"><Logo /></div>
            </div>

            {/* Main Visual - BIG SCORE */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Glow behind score */}
                <div className={`absolute inset-0 ${glowColor} blur-[120px] opacity-20 rounded-full`}></div>

                <div className={`w-[500px] h-[500px] rounded-full border border-white/10 flex items-center justify-center bg-black/40 backdrop-blur-md relative`}>
                    <div className="absolute inset-0 rounded-full border border-white/5 border-dashed opacity-50"></div>

                    <div className={`text-[250px] font-black leading-none tracking-tighter text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]`}>
                        {globalScore}
                    </div>
                </div>

                <div className="mt-12">
                    <div className="text-4xl font-bold text-gray-400 uppercase tracking-[0.5em] text-center mb-4">Global Score</div>
                    <div className={`text-6xl font-black uppercase tracking-[0.2em] text-center ${accentColor}`}>
                        {levelTitle}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-16 text-3xl text-zinc-600 font-mono tracking-widest uppercase">
                {new Date().toLocaleDateString('pl-PL')} • {userName}
            </div>
        </div>
    );
});

export default SocialMediaCard;
