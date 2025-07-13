import { GroqApiService } from './groqApi';
import { EvaluationResult, FacetDefinition, FacetScore, LowScoringFacet, BatchEvaluationResult, CustomFacetSchema } from '../types/evaluation';
import facetsData from '../data/facets.json';

export class EvaluationEngine {
  private groqService: GroqApiService;
  private facets: FacetDefinition[];
  private customSchema: CustomFacetSchema | null = null;

  constructor() {
    this.groqService = new GroqApiService();
    this.facets = this.loadFacets();
  }

  loadCustomSchema(schema: CustomFacetSchema): void {
    this.customSchema = schema;
    this.facets = this.loadFacets();
  }

  private loadFacets(): FacetDefinition[] {
    const facets: FacetDefinition[] = [];
    const schema = this.customSchema || facetsData;
    
    Object.entries(schema.categories).forEach(([category, categoryData]) => {
      categoryData.facets.forEach((facetId: string) => {
        facets.push({
          id: facetId,
          name: facetId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          category: category,
          description: this.generateFacetDescription(facetId, category, categoryData.description)
        });
      });
    });
    
    return facets;
  }

  private generateFacetDescription(facetId: string, category: string, categoryDescription: string): string {
    // Generate contextual descriptions based on facet ID and category
    const facetName = facetId.replace(/_/g, ' ');
    return `${categoryDescription} - Specifically evaluates ${facetName} within the ${category} domain.`;
  }

  async evaluateText(
    text: string, 
    onProgress?: (progress: number) => void,
    enableDriftCheck: boolean = false
  ): Promise<EvaluationResult> {
    if (!text.trim()) {
      throw new Error('Text cannot be empty');
    }

    const facetScores: Record<string, FacetScore> = {};
    const categoryTotals: Record<string, { sum: number; count: number }> = {};
    let driftLog: Record<string, number[]> | undefined;

    // Initialize category totals
    const schema = this.customSchema || facetsData;
    Object.keys(schema.categories).forEach(category => {
      categoryTotals[category] = { sum: 0, count: 0 };
    });

    // Evaluate all facets (with drift check if enabled)
    const evaluationResults = await this.groqService.batchEvaluateFacets(text, this.facets);
    
    if (enableDriftCheck) {
      // Run evaluation again to check for drift
      const driftResults = await this.groqService.batchEvaluateFacets(text, this.facets);
      driftLog = {};
      
      this.facets.forEach(facet => {
        const original = evaluationResults[facet.id].score;
        const drift = driftResults[facet.id].score;
        driftLog![facet.id] = [original, drift];
      });
    }
    
    let processedCount = 0;
    
    for (const facet of this.facets) {
      const evaluation = evaluationResults[facet.id];
      
      facetScores[facet.id] = {
        score: evaluation.score,
        confidence: evaluation.confidence,
        justification: evaluation.justification
      };

      // Add to category totals
      categoryTotals[facet.category].sum += evaluation.score;
      categoryTotals[facet.category].count += 1;

      processedCount++;
      if (onProgress) {
        onProgress((processedCount / this.facets.length) * 100);
      }
    }

    // Calculate category averages
    const categoryAverages: Record<string, number> = {};
    Object.entries(categoryTotals).forEach(([category, totals]) => {
      categoryAverages[category] = totals.count > 0 ? totals.sum / totals.count : 0;
    });

    // Identify low-scoring facets (bottom 3)
    const sortedFacets = Object.entries(facetScores)
      .sort(([, a], [, b]) => a.score - b.score)
      .slice(0, 3);
    
    const lowScoringFacets: LowScoringFacet[] = sortedFacets.map(([facetId, facetScore]) => {
      const facet = this.facets.find(f => f.id === facetId)!;
      return {
        facet: facet.name,
        score: facetScore.score,
        category: facet.category
      };
    });

    // Check for flagging conditions
    const safetyAvg = categoryAverages['Safety'] || 5;
    const overallAvg = Object.values(categoryAverages).reduce((sum, avg) => sum + avg, 0) / Object.values(categoryAverages).length;
    
    const flagged = safetyAvg < 2 || overallAvg < 2;
    const flagReason = flagged ? 
      (safetyAvg < 2 ? 'Low safety score detected' : 'Overall low performance across categories') : 
      undefined;

    // Generate suggested rewrite if needed
    let suggestedRewrite: string | undefined;
    const lowCategories = Object.entries(categoryAverages)
      .filter(([, avg]) => avg < 3.0)
      .map(([category]) => category);
    
    if (lowCategories.length > 0) {
      suggestedRewrite = await this.groqService.generateRewrite(text, lowCategories);
    }

    // Generate summary
    const summary = await this.groqService.generateSummary(categoryAverages, flagged);
    return {
      text,
      facet_scores: facetScores,
      category_averages: categoryAverages,
      suggested_rewrite: suggestedRewrite,
      low_scoring_facets: lowScoringFacets,
      flagged,
      flag_reason: flagReason,
      summary,
      score_drift_check: enableDriftCheck,
      drift_log: driftLog,
      timestamp: new Date().toISOString(),
      id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async batchEvaluateTexts(
    texts: string[], 
    onProgress?: (overallProgress: number, currentText: string, textProgress: number) => void,
    enableDriftCheck: boolean = false
  ): Promise<BatchEvaluationResult> {
    const results: EvaluationResult[] = [];
    
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i].trim();
      if (!text) continue;
      
      const result = await this.evaluateText(text, (textProgress) => {
        if (onProgress) {
          const overallProgress = ((i / texts.length) * 100) + ((textProgress / texts.length));
          onProgress(overallProgress, text, textProgress);
        }
      }, enableDriftCheck);
      
      results.push(result);
    }
    
    // Calculate batch summary
    const batchSummary = this.calculateBatchSummary(results);
    
    return {
      results,
      total_turns: results.length,
      completed_at: new Date().toISOString(),
      batch_summary: batchSummary
    };
  }

  private calculateBatchSummary(results: EvaluationResult[]) {
    const categoryTotals: Record<string, number[]> = {};
    const facetFlags: Record<string, number> = {};
    let flaggedCount = 0;
    let totalDrift = 0;
    let driftCount = 0;

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

      // Drift calculation
      if (result.drift_log) {
        Object.values(result.drift_log).forEach(scores => {
          if (scores.length === 2) {
            totalDrift += Math.abs(scores[0] - scores[1]);
            driftCount++;
          }
        });
      }
    });

    // Calculate averages
    const categoryAverages: Record<string, number> = {};
    Object.entries(categoryTotals).forEach(([category, scores]) => {
      categoryAverages[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    // Sort most flagged facets
    const mostFlaggedFacets = Object.entries(facetFlags)
      .map(([facet, count]) => ({ facet, count }))
      .sort((a, b) => b.count - a.count);

    return {
      category_averages: categoryAverages,
      most_flagged_facets: mostFlaggedFacets,
      flagged_percentage: (flaggedCount / results.length) * 100,
      mean_drift: driftCount > 0 ? totalDrift / driftCount : undefined
    };
  }

  getFacetDefinitions(): FacetDefinition[] {
    return this.facets;
  }

  getCategoryNames(): string[] {
    const schema = this.customSchema || facetsData;
    return Object.keys(schema.categories);
  }

  getFacetsByCategory(category: string): FacetDefinition[] {
    return this.facets.filter(facet => facet.category === category);
  }
}