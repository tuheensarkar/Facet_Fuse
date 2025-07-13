import { EvaluationResult, BatchEvaluationResult } from '../types/evaluation';

export class ExportUtils {
  static exportAsJSON(result: EvaluationResult): void {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation_${result.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static exportAsCSV(result: EvaluationResult): void {
    const headers = ['text', 'timestamp', 'id'];
    const values = [
      `"${result.text.replace(/"/g, '""')}"`,
      result.timestamp,
      result.id
    ];

    // Add facet scores and confidences
    Object.entries(result.facet_scores).forEach(([facetId, facetScore]) => {
      headers.push(`${facetId}_score`, `${facetId}_confidence`);
      values.push(facetScore.score.toString(), facetScore.confidence.toString());
    });

    // Add category averages
    Object.entries(result.category_averages).forEach(([category, average]) => {
      headers.push(`category_${category.replace(/ /g, '_')}_average`);
      values.push(average.toFixed(3));
    });

    const csvContent = headers.join(',') + '\n' + values.join(',');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation_${result.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static mergeAllAsJSON(results: EvaluationResult[]): void {
    const batchResult: BatchEvaluationResult = {
      results,
      total_turns: results.length,
      completed_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(batchResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evaluated_conversations.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static mergeAllAsCSV(results: EvaluationResult[]): void {
    if (results.length === 0) return;

    // Use the first result to determine the structure
    const firstResult = results[0];
    const headers = ['text', 'timestamp', 'id'];
    
    // Add facet headers
    Object.keys(firstResult.facet_scores).forEach(facetId => {
      headers.push(`${facetId}_score`, `${facetId}_confidence`);
    });

    // Add category headers
    Object.keys(firstResult.category_averages).forEach(category => {
      headers.push(`category_${category.replace(/ /g, '_')}_average`);
    });

    const rows = [headers.join(',')];

    results.forEach(result => {
      const values = [
        `"${result.text.replace(/"/g, '""')}"`,
        result.timestamp,
        result.id
      ];

      // Add facet scores and confidences
      Object.entries(result.facet_scores).forEach(([_, facetScore]) => {
        values.push(facetScore.score.toString(), facetScore.confidence.toString());
      });

      // Add category averages
      Object.entries(result.category_averages).forEach(([_, average]) => {
        values.push(average.toFixed(3));
      });

      rows.push(values.join(','));
    });

    const csvContent = rows.join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evaluated_conversations.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}