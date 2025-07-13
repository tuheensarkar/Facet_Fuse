export interface FacetScore {
  score: number; // 1-5
  confidence: number; // 0.0-1.0
  justification: string;
}

export interface LowScoringFacet {
  facet: string;
  score: number;
  category: string;
}

export interface FacetDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface EvaluationResult {
  text: string;
  facet_scores: Record<string, FacetScore>;
  category_averages: Record<string, number>;
  suggested_rewrite?: string;
  low_scoring_facets: LowScoringFacet[];
  flagged: boolean;
  flag_reason?: string;
  summary: string;
  score_drift_check?: boolean;
  drift_log?: Record<string, number[]>;
  timestamp: string;
  id: string;
}

export interface BatchEvaluationResult {
  results: EvaluationResult[];
  total_turns: number;
  completed_at: string;
  batch_summary: {
    category_averages: Record<string, number>;
    most_flagged_facets: Array<{ facet: string; count: number }>;
    flagged_percentage: number;
    mean_drift?: number;
  };
}

export interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface EvaluationPromptResponse {
  score: number;
  confidence: number;
  justification: string;
}

export interface CustomFacetSchema {
  categories: Record<string, {
    description: string;
    facets: string[];
  }>;
}