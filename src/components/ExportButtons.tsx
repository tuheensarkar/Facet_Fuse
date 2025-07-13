import React from 'react';
import { Download, FileText, Database } from 'lucide-react';
import { EvaluationResult } from '../types/evaluation';
import { ExportUtils } from '../utils/exportUtils';

interface ExportButtonsProps {
  results: EvaluationResult[];
  isMergeMode: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ results, isMergeMode }) => {
  const handleExportJSON = () => {
    if (isMergeMode) {
      ExportUtils.mergeAllAsJSON(results);
    } else if (results.length === 1) {
      ExportUtils.exportAsJSON(results[0]);
    }
  };

  const handleExportCSV = () => {
    if (isMergeMode) {
      ExportUtils.mergeAllAsCSV(results);
    } else if (results.length === 1) {
      ExportUtils.exportAsCSV(results[0]);
    }
  };

  if (results.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleExportJSON}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        <FileText className="w-4 h-4" />
        {isMergeMode ? 'Merge All as JSON' : 'Export as JSON'}
      </button>
      
      <button
        onClick={handleExportCSV}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
      >
        <Database className="w-4 h-4" />
        {isMergeMode ? 'Merge All as CSV' : 'Export as CSV'}
      </button>
    </div>
  );
};