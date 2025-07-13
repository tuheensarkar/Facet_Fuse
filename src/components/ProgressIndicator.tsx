import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: number;
  currentText?: string;
  textProgress?: number;
  isVisible: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  currentText,
  textProgress,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <h3 className="text-lg font-semibold text-gray-900">Evaluating with Groq + Mixtral 8x7B</h3>
        <h3 className="text-lg font-semibold text-gray-900">Evaluating with Groq + Llama 3.1 8B</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {currentText && textProgress !== undefined && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Current Turn Progress</span>
              <span>{Math.round(textProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${textProgress}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-500 truncate">
              Evaluating: "{currentText.length > 60 ? currentText.substring(0, 60) + '...' : currentText}"
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          Processing 300 facets across Linguistic Quality, Pragmatics, Safety, and Emotion categories
        </div>
      </div>
    </div>
  );
};