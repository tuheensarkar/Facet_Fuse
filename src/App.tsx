import React, { useState, useCallback } from 'react';
import { EvaluationForm } from './components/EvaluationForm';
import { EvaluationResults } from './components/EvaluationResults';
import { ProgressIndicator } from './components/ProgressIndicator';
import { EvaluationEngine } from './services/evaluationEngine';
import { EvaluationResult, BatchEvaluationResult, CustomFacetSchema } from './types/evaluation';
import { Brain, Database, Zap, Shield } from 'lucide-react';

function App() {
  const [results, setResults] = useState<EvaluationResult[] | BatchEvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState<string>();
  const [textProgress, setTextProgress] = useState<number>();
  const [evaluationEngine] = useState(() => new EvaluationEngine());
  
  const handleEvaluate = useCallback(async (text: string, enableDriftCheck: boolean = false) => {
    setIsLoading(true);
    setProgress(0);
    setCurrentText(text);
    setTextProgress(0);

    try {
      const result = await evaluationEngine.evaluateText(text, (progress) => {
        setProgress(progress);
        setTextProgress(progress);
      }, enableDriftCheck);
      
      setResults(prev => {
        if (!prev || Array.isArray(prev)) {
          return Array.isArray(prev) ? [...prev, result] : [result];
        }
        return [result]; // Reset if previous was batch result
      });
    } catch (error) {
      console.error('Evaluation failed:', error);
      alert(`Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
      setCurrentText(undefined);
      setTextProgress(undefined);
    }
  }, [evaluationEngine]);

  const handleBatchEvaluate = useCallback(async (texts: string[], enableDriftCheck: boolean = false) => {
    setIsLoading(true);
    setProgress(0);

    try {
      const batchResults = await evaluationEngine.batchEvaluateTexts(
        texts,
        (overallProgress, currentText, textProgress) => {
          setProgress(overallProgress);
          setCurrentText(currentText);
          setTextProgress(textProgress);
        },
        enableDriftCheck
      );
      
      setResults(batchResults);
    } catch (error) {
      console.error('Batch evaluation failed:', error);
      alert(`Batch evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
      setCurrentText(undefined);
      setTextProgress(undefined);
    }
  }, [evaluationEngine]);

  const handleLoadCustomSchema = useCallback((schema: CustomFacetSchema) => {
    evaluationEngine.loadCustomSchema(schema);
  }, [evaluationEngine]);
  const handleClearResults = useCallback(() => {
    setResults(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
              Advanced Conversation Benchmarking
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            AI-powered evaluation with justifications, rewrites, and comprehensive analysis
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
              <Brain className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">AI Justifications</div>
              <div className="text-xs text-gray-600">Detailed Explanations</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
              <Database className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Smart Rewrites</div>
              <div className="text-xs text-gray-600">Auto Improvements</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
              <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Drift Analysis</div>
              <div className="text-xs text-gray-600">Consistency Check</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100 hover:shadow-md transition-shadow">
              <Shield className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Visual Analytics</div>
              <div className="text-xs text-gray-600">Charts & Graphs</div>
            </div>
          </div>
        </div>

        {/* Evaluation Form */}
        <EvaluationForm
          onEvaluate={handleEvaluate}
          onBatchEvaluate={handleBatchEvaluate}
          onLoadCustomSchema={handleLoadCustomSchema}
          isLoading={isLoading}
        />

        {/* Progress Indicator */}
        <ProgressIndicator
          progress={progress}
          currentText={currentText}
          textProgress={textProgress}
          isVisible={isLoading}
        />

        {/* Results */}
        {results && (
          <EvaluationResults
            results={results}
            onClearResults={handleClearResults}
          />
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            Enhanced with AI justifications, smart rewrites, drift analysis, and visual analytics • 
            Powered by Groq API with Llama 3.1 8B
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;