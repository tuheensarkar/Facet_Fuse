import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface CategoryRadarChartProps {
  categoryAverages: Record<string, number>;
}

export const CategoryRadarChart: React.FC<CategoryRadarChartProps> = ({ categoryAverages }) => {
  const data = Object.entries(categoryAverages).map(([category, average]) => ({
    category: category.replace(' ', '\n'),
    score: average,
    fullMark: 5
  }));

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Performance Radar</h4>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 5]} 
            tick={{ fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};