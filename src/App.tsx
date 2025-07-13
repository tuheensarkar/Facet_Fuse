import React, { useState, useCallback } from 'react';
import { EvaluationForm } from './components/EvaluationForm';
import { EvaluationResults } from './components/EvaluationResults';
import { ProgressIndicator } from './components/ProgressIndicator';
import { EvaluationEngine } from './services/evaluationEngine';
import { EvaluationResult } from './types/evaluation';
import { Brain, Database, Zap, Shield } from 'lucide-react';

function App() {
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState<string>();
  const [textProgress, setTextProgress] = useState<number>();
  const [evaluationEngine] = useState(() => new EvaluationEngine());
  const handleEvaluate = useCallback(async (text: string) => {
    setIsLoading(true);
    setProgress(0);
    setCurrentText(text);
    setTextProgress(0);

    try {
      const result = await evaluationEngine.evaluateText(text, (progress) => {
        setProgress(progress);
        setTextProgress(progress);
      });
      
      setResults(prev => [...prev, result]);
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

  const handleBatchEvaluate = useCallback(async (texts: string[]) => {
    setIsLoading(true);
    setProgress(0);

    try {
      const batchResults = await evaluationEngine.batchEvaluateTexts(
        texts,
        (overallProgress, currentText, textProgress) => {
          setProgress(overallProgress);
          setCurrentText(currentText);
          setTextProgress(textProgress);
        }
      );
      
      setResults(prev => [...prev, ...batchResults]);
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

  const handleClearResults = useCallback(() => {
    setResults([]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Advanced Conversation Benchmarking
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            Real-time evaluation using Groq API + Llama 3.1 8B across 300 unique facets
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <Brain className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Real AI Evaluation</div>
              <div className="text-xs text-gray-600">Groq + Mixtral 8x7B</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <Database className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">300 Facets</div>
              <div className="text-xs text-gray-600">4 Categories</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Batch Processing</div>
              <div className="text-xs text-gray-600">Multiple Turns</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <Shield className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Export & Merge</div>
              <div className="text-xs text-gray-600">JSON & CSV</div>
            </div>
          </div>
        </div>

        {/* Evaluation Form */}
        <EvaluationForm
          onEvaluate={handleEvaluate}
          onBatchEvaluate={handleBatchEvaluate}
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
        <EvaluationResults
          results={results}
          onClearResults={handleClearResults}
        />

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            Powered by Groq API with Llama 3.1 8B • Temperature: 0.0 (Deterministic) • 
            Scalable to 5000+ facets
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;