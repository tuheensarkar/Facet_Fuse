import React, { useState } from 'react';
import { MessageSquare, Zap } from 'lucide-react';

interface EvaluationFormProps {
  onEvaluate: (text: string, enableDriftCheck?: boolean) => void;
  onBatchEvaluate: (texts: string[], enableDriftCheck?: boolean) => void;
  isLoading: boolean;
  onLoadCustomSchema: (schema: any) => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({ 
  onEvaluate, 
  onBatchEvaluate, 
  isLoading,
  onLoadCustomSchema
}) => {
  const [text, setText] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [batchTexts, setBatchTexts] = useState('');
  const [enableDriftCheck, setEnableDriftCheck] = useState(false);

  const handleSingleEvaluate = () => {
    if (text.trim()) {
      onEvaluate(text.trim(), enableDriftCheck);
    }
  };

  const handleBatchEvaluate = () => {
    const texts = batchTexts
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    if (texts.length > 0) {
      onBatchEvaluate(texts, enableDriftCheck);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const schema = JSON.parse(e.target?.result as string);
          onLoadCustomSchema(schema);
          alert('Custom facet schema loaded successfully!');
        } catch (error) {
          alert('Invalid JSON file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !batchMode) {
      e.preventDefault();
      handleSingleEvaluate();
    }
  };

  return (
    <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-lg p-8 mb-8 border border-blue-100">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Advanced Conversation Benchmarking
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
          <input
            type="checkbox"
            checked={batchMode}
            onChange={(e) => setBatchMode(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
          />
          <Zap className="w-4 h-4" />
          Batch Mode: Evaluate Multiple Turns
        </label>
        
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
          <input
            type="checkbox"
            checked={enableDriftCheck}
            onChange={(e) => setEnableDriftCheck(e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
          />
          Enable Score Drift Analysis
        </label>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Facet Schema (JSON):
          </label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
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
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            rows={4}
            disabled={isLoading}
          />
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Press Enter to evaluate • Advanced AI analysis with justifications
            </div>
            <button
              onClick={handleSingleEvaluate}
              disabled={!text.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
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
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? 'Processing Batch...' : 'Evaluate All Turns'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};