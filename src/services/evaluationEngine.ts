import { GroqApiService } from './groqApi';
import { EvaluationResult, FacetDefinition, FacetScore } from '../types/evaluation';
import facetsData from '../data/facets.json';

export class EvaluationEngine {
  private groqService: GroqApiService;
  private facets: FacetDefinition[];

  constructor() {
    this.groqService = new GroqApiService();
    this.facets = this.loadFacets();
  }

  private loadFacets(): FacetDefinition[] {
    const facets: FacetDefinition[] = [];
    
    Object.entries(facetsData.categories).forEach(([category, categoryData]) => {
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

  async evaluateText(text: string, onProgress?: (progress: number) => void): Promise<EvaluationResult> {
    if (!text.trim()) {
      throw new Error('Text cannot be empty');
    }

    const facetScores: Record<string, FacetScore> = {};
    const categoryTotals: Record<string, { sum: number; count: number }> = {};

    // Initialize category totals
    Object.keys(facetsData.categories).forEach(category => {
      categoryTotals[category] = { sum: 0, count: 0 };
    });

    // Evaluate all facets using Groq API
    const evaluationResults = await this.groqService.batchEvaluateFacets(text, this.facets);
    
    let processedCount = 0;
    
    for (const facet of this.facets) {
      const evaluation = evaluationResults[facet.id];
      
      facetScores[facet.id] = {
        score: evaluation.score,
        confidence: evaluation.confidence
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

    return {
      text,
      facet_scores: facetScores,
      category_averages: categoryAverages,
      timestamp: new Date().toISOString(),
      id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  async batchEvaluateTexts(
    texts: string[], 
    onProgress?: (overallProgress: number, currentText: string, textProgress: number) => void
  ): Promise<EvaluationResult[]> {
    const results: EvaluationResult[] = [];
    
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i].trim();
      if (!text) continue;
      
      const result = await this.evaluateText(text, (textProgress) => {
        if (onProgress) {
          const overallProgress = ((i / texts.length) * 100) + ((textProgress / texts.length));
          onProgress(overallProgress, text, textProgress);
        }
      });
      
      results.push(result);
    }
    
    return results;
  }

  getFacetDefinitions(): FacetDefinition[] {
    return this.facets;
  }

  getCategoryNames(): string[] {
    return Object.keys(facetsData.categories);
  }

  getFacetsByCategory(category: string): FacetDefinition[] {
    return this.facets.filter(facet => facet.category === category);
  }
}