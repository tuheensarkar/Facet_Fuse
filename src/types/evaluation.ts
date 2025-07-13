export interface FacetScore {
  score: number; // 1-5
  confidence: number; // 0.0-1.0
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
  timestamp: string;
  id: string;
}

export interface BatchEvaluationResult {
  results: EvaluationResult[];
  total_turns: number;
  completed_at: string;
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
  reasoning: string;
}