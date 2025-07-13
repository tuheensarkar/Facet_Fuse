import React from 'react';
import { BatchEvaluationResult } from '../types/evaluation';
import { AlertTriangle, TrendingUp, Flag, BarChart3 } from 'lucide-react';

interface BatchSummaryDashboardProps {
  batchResult: BatchEvaluationResult;
}

export const BatchSummaryDashboard: React.FC<BatchSummaryDashboardProps> = ({ batchResult }) => {
  const { batch_summary, total_turns } = batchResult;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        Batch Evaluation Summary ({total_turns} turns)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(batch_summary.category_averages).map(([category, average]) => (
          <div key={category} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-gray-900">{category}</h4>
            </div>
            <div className="text-2xl font-bold text-blue-600">{average.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Average Score</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-600" />
            Most Flagged Facets
          </h4>
          <div className="space-y-2">
            {batch_summary.most_flagged_facets.slice(0, 5).map((facet, index) => (
              <div key={facet.facet} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{facet.facet.replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium text-red-600">{facet.count} times</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            Quality Metrics
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Flagged Messages</span>
              <span className="text-sm font-medium text-yellow-600">
                {batch_summary.flagged_percentage.toFixed(1)}%
              </span>
            </div>
            {batch_summary.mean_drift && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Mean Score Drift</span>
                <span className="text-sm font-medium text-purple-600">
                  ±{batch_summary.mean_drift.toFixed(3)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};