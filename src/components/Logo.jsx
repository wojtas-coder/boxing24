import React from 'react';

const Logo = ({ className }) => {
    return (
        <svg
            viewBox="0 0 240 60"
            className={`fill-current ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Boxing24 Logo"
        >
            <defs>
                <linearGradient id="brushGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#22c55e" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* BOXING - Modern Heavy Sans */}
            <text
                x="5"
                y="45"
                fontFamily="Inter, Arial, sans-serif"
                fontWeight="900"
                fontSize="40"
                fill="white"
                letterSpacing="-1"
                className="select-none"
            >
                BOXING
            </text>

            {/* 24 - Green Filled Accent - Matches #22c55e */}
            {/* Adjusted position to be distinct but close */}
            <text
                x="165"
                y="45"
                fontFamily="Inter, Arial, sans-serif"
                fontWeight="900"
                fontSize="40"
                fill="#22c55e"
                letterSpacing="-2"
                className="select-none"
            >
                24
            </text>

            {/* Brush Stroke Effect */}
            {/* Dynamic tapered path, fading out, shorter than text */}
            <path
                d="M 5 55 Q 60 58 140 52 L 138 54 Q 50 62 5 57 Z"
                fill="url(#brushGradient)"
                opacity="0.9"
            />
        </svg>
    );
};

export default Logo;
