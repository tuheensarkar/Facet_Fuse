import React, { useState } from 'react';
import { MessageSquare, Zap } from 'lucide-react';

interface EvaluationFormProps {
  onEvaluate: (text: string) => void;
  onBatchEvaluate: (texts: string[]) => void;
  isLoading: boolean;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({ 
  onEvaluate, 
  onBatchEvaluate, 
  isLoading 
}) => {
  const [text, setText] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [batchTexts, setBatchTexts] = useState('');

  const handleSingleEvaluate = () => {
    if (text.trim()) {
      onEvaluate(text.trim());
    }
  };

  const handleBatchEvaluate = () => {
    const texts = batchTexts
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    if (texts.length > 0) {
      onBatchEvaluate(texts);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !batchMode) {
      e.preventDefault();
      handleSingleEvaluate();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Conversation Benchmarking System</h2>
      </div>
      
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
          <input
            type="checkbox"
            checked={batchMode}
            onChange={(e) => setBatchMode(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Zap className="w-4 h-4" />
          Batch Mode: Evaluate Multiple Turns
        </label>
      </div>

      {!batchMode ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter text to evaluate:
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a conversation turn or text snippet to evaluate across 300 facets..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            disabled={isLoading}
          />
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Press Enter to evaluate • 300 facets across 4 categories
            </div>
            <button
              onClick={handleSingleEvaluate}
              disabled={!text.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Evaluating...' : 'Evaluate Turn'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter multiple turns (one per line):
          </label>
          <textarea
            value={batchTexts}
            onChange={(e) => setBatchTexts(e.target.value)}
            placeholder="Enter multiple conversation turns, one per line:&#10;&#10;I'm sorry this happened — I'll fix it right away.&#10;Thank you for your patience during this process.&#10;Let me help you resolve this issue quickly."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={8}
            disabled={isLoading}
          />
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {batchTexts.split('\n').filter(t => t.trim()).length} turns to evaluate
            </div>
            <button
              onClick={handleBatchEvaluate}
              disabled={!batchTexts.trim() || isLoading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing Batch...' : 'Evaluate All Turns'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};