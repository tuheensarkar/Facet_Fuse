import React from 'react';
import { EvaluationResult, BatchEvaluationResult } from '../types/evaluation';
import { ExportButtons } from './ExportButtons';
import { CategoryRadarChart } from './CategoryRadarChart';
import { ConfidenceHistogram } from './ConfidenceHistogram';
import { BatchSummaryDashboard } from './BatchSummaryDashboard';
import { TrendingUp, Target, Shield, Heart, AlertTriangle, CheckCircle, Edit3, BarChart3 } from 'lucide-react';

interface EvaluationResultsProps {
  results: EvaluationResult[] | BatchEvaluationResult;
  onClearResults: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Linguistic Quality': return <TrendingUp className="w-5 h-5" />;
    case 'Pragmatics': return <Target className="w-5 h-5" />;
    case 'Safety': return <Shield className="w-5 h-5" />;
    case 'Emotion': return <Heart className="w-5 h-5" />;
    default: return <TrendingUp className="w-5 h-5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Linguistic Quality': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Pragmatics': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'Safety': return 'text-red-600 bg-red-50 border-red-200';
    case 'Emotion': return 'text-purple-600 bg-purple-50 border-purple-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 4.5) return 'text-green-600 bg-green-50';
  if (score >= 3.5) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

export const EvaluationResults: React.FC<EvaluationResultsProps> = ({ 
  results, 
  onClearResults 
}) => {
  // Handle both individual results and batch results
  const isBatchResult = 'batch_summary' in results;
  const evaluationResults = isBatchResult ? results.results : results;
  
  if (evaluationResults.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Batch Summary Dashboard */}
      {isBatchResult && (
        <BatchSummaryDashboard batchResult={results as BatchEvaluationResult} />
      )}

      {/* Merge Controls */}
      {evaluationResults.length > 1 && !isBatchResult && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Batch Export Options ({evaluationResults.length} evaluations)
          </h3>
          <ExportButtons results={evaluationResults} isMergeMode={true} />
        </div>
      )}

      {/* Individual Results */}
      {evaluationResults.map((result, index) => (
        <div key={result.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Evaluation Result {evaluationResults.length > 1 ? `#${index + 1}` : ''}
                  {result.flagged && (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </h3>
                <div className="text-sm text-gray-500">
                  {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
              <ExportButtons results={[result]} isMergeMode={false} />
            </div>
            
            {/* Flagged Warning */}
            {result.flagged && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Content Flagged</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{result.flag_reason}</p>
              </div>
            )}
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Evaluated Text:</h4>
              <p className="text-gray-900 italic">"{result.text}"</p>
            </div>
            
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <CategoryRadarChart categoryAverages={result.category_averages} />
              <ConfidenceHistogram facetScores={result.facet_scores} />
            </div>

            {/* Category Averages */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(result.category_averages).map(([category, average]) => (
                  <div 
                    key={category}
                    className={`p-4 rounded-lg border ${getCategoryColor(category)} transition-all duration-200 hover:shadow-md`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(category)}
                      <h5 className="font-medium">{category}</h5>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(average)}`}>
                      {average.toFixed(2)}
                    </div>
                    <div className="text-sm opacity-75">out of 5.0</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Scoring Facets */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.low_scoring_facets.map((facet, idx) => (
                  <div key={idx} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h5 className="font-medium text-yellow-800">{facet.facet}</h5>
                    <div className="text-2xl font-bold text-yellow-600">{facet.score}/5</div>
                    <div className="text-sm text-yellow-700">{facet.category}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Suggested Rewrite */}
            {result.suggested_rewrite && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-green-600" />
                  Suggested Improvement
                </h4>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-green-900 italic">"{result.suggested_rewrite}"</p>
                </div>
              </div>
            )}

            {/* Drift Analysis */}
            {result.score_drift_check && result.drift_log && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Score Drift Analysis</h4>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-purple-900 text-sm mb-2">
                    Consistency check: Re-evaluated the same text to measure score stability
                  </p>
                  <div className="text-sm text-purple-700">
                    Average drift: ±{(
                      Object.values(result.drift_log)
                        .map(scores => Math.abs(scores[0] - scores[1]))
                        .reduce((sum, drift) => sum + drift, 0) / Object.values(result.drift_log).length
                    ).toFixed(3)} points
                  </div>
                </div>
              </div>
            )}

            {/* Facet Scores Summary */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Facet Analysis Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h5 className="font-medium text-green-800 mb-2">High Scores (4-5)</h5>
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(result.facet_scores).filter(f => f.score >= 4).length}
                  </div>
                  <div className="text-sm text-green-700">facets</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h5 className="font-medium text-yellow-800 mb-2">Medium Scores (2-3)</h5>
                  <div className="text-2xl font-bold text-yellow-600">
                    {Object.values(result.facet_scores).filter(f => f.score >= 2 && f.score < 4).length}
                  </div>
                  <div className="text-sm text-yellow-700">facets</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h5 className="font-medium text-red-800 mb-2">Low Scores (1)</h5>
                  <div className="text-2xl font-bold text-red-600">
                    {Object.values(result.facet_scores).filter(f => f.score === 1).length}
                  </div>
                  <div className="text-sm text-red-700">facets</div>
                </div>
              </div>
            </div>

            {/* Confidence Statistics */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Confidence Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-2">Average Confidence</h5>
                  <div className="text-2xl font-bold text-blue-600">
                    {(Object.values(result.facet_scores).reduce((sum, f) => sum + f.confidence, 0) / Object.values(result.facet_scores).length).toFixed(3)}
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <h5 className="font-medium text-indigo-800 mb-2">High Confidence (≥0.8)</h5>
                  <div className="text-2xl font-bold text-indigo-600">
                    {Object.values(result.facet_scores).filter(f => f.confidence >= 0.8).length}
                  </div>
                  <div className="text-sm text-indigo-700">facets</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h5 className="font-medium text-purple-800 mb-2">Low Confidence (&lt;0.5)</h5>
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(result.facet_scores).filter(f => f.confidence < 0.5).length}
                  </div>
                  <div className="text-sm text-purple-700">facets</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Clear Results */}
      <div className="text-center">
        <button
          onClick={onClearResults}
          className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Clear All Results
        </button>
      </div>
    </div>
  );
};