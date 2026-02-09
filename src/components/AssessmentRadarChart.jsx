import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const AssessmentRadarChart = ({ result }) => {
    if (!result) return null;

    const { categoryScores, globalScore } = result;

    const data = [
        { subject: 'Fundamenty', A: categoryScores.foundation || 0, fullMark: 100 },
        { subject: 'Siła', A: categoryScores.strength || 0, fullMark: 100 },
        { subject: 'Moc', A: categoryScores.power || 0, fullMark: 100 },
        { subject: 'Wydolność', A: categoryScores.capacity || 0, fullMark: 100 },
    ];

    // Color Logic
    let chartColor = '#ef4444'; // Red < 50
    if (globalScore >= 50) chartColor = '#f97316'; // Orange 50-69
    if (globalScore >= 70) chartColor = '#00ff00'; // Green 70-84
    if (globalScore >= 85) chartColor = '#fbbf24'; // Gold 85+

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Wynik"
                        dataKey="A"
                        stroke={chartColor}
                        strokeWidth={2}
                        fill={chartColor}
                        fillOpacity={0.3}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AssessmentRadarChart;
