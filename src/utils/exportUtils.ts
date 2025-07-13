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
      completed_at: new Date().toISOString(),
      batch_summary: {
        category_averages: {},
        most_flagged_facets: [],
        flagged_percentage: 0
      }
    };

    // Calculate batch summary
    const categoryTotals: Record<string, number[]> = {};
    const facetFlags: Record<string, number> = {};
    let flaggedCount = 0;

    results.forEach(result => {
      // Category averages
      Object.entries(result.category_averages).forEach(([category, average]) => {
        if (!categoryTotals[category]) categoryTotals[category] = [];
        categoryTotals[category].push(average);
      });

      // Flagged count
      if (result.flagged) flaggedCount++;

      // Most flagged facets
      result.low_scoring_facets.forEach(facet => {
        facetFlags[facet.facet] = (facetFlags[facet.facet] || 0) + 1;
      });
    });

    // Calculate averages
    Object.entries(categoryTotals).forEach(([category, scores]) => {
      batchResult.batch_summary.category_averages[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    // Sort most flagged facets
    batchResult.batch_summary.most_flagged_facets = Object.entries(facetFlags)
      .map(([facet, count]) => ({ facet, count }))
      .sort((a, b) => b.count - a.count);

    batchResult.batch_summary.flagged_percentage = (flaggedCount / results.length) * 100;

    const blob = new Blob([JSON.stringify(batchResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged_evaluations.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static mergeAllAsCSV(results: EvaluationResult[]): void {
    if (results.length === 0) return;

    // Use the first result to determine the structure
    const firstResult = results[0];
    const headers = ['text', 'timestamp', 'id', 'flagged', 'summary'];
    
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
        result.id,
        result.flagged.toString(),
        `"${result.summary.replace(/"/g, '""')}"`
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
    a.download = 'merged_evaluations.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}