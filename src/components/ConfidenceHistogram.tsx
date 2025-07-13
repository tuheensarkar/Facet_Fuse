import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FacetScore } from '../types/evaluation';

interface ConfidenceHistogramProps {
  facetScores: Record<string, FacetScore>;
}

export const ConfidenceHistogram: React.FC<ConfidenceHistogramProps> = ({ facetScores }) => {
  // Create confidence bins
  const bins = [
    { range: '0.0-0.2', min: 0.0, max: 0.2, count: 0 },
    { range: '0.2-0.4', min: 0.2, max: 0.4, count: 0 },
    { range: '0.4-0.6', min: 0.4, max: 0.6, count: 0 },
    { range: '0.6-0.8', min: 0.6, max: 0.8, count: 0 },
    { range: '0.8-1.0', min: 0.8, max: 1.0, count: 0 }
  ];

  // Count facets in each bin
  Object.values(facetScores).forEach(facet => {
    const bin = bins.find(b => facet.confidence >= b.min && facet.confidence <= b.max);
    if (bin) bin.count++;
  });

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Confidence Distribution</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={bins}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};