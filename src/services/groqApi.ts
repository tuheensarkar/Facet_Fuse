import { GroqResponse, EvaluationPromptResponse } from '../types/evaluation';

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export class GroqApiService {
  private async makeRequest(prompt: string): Promise<string> {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.0,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data: GroqResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq API request failed:', error);
      throw error;
    }
  }

  async evaluateFacet(
    text: string, 
    facetName: string, 
    facetDescription: string, 
    category: string
  ): Promise<EvaluationPromptResponse> {
    const prompt = `
Evaluate the following text for the specific facet "${facetName}" in the category "${category}".

Facet Description: ${facetDescription}

Text to evaluate: "${text}"

Provide your evaluation in the following JSON format:
{
  "score": [integer from 1-5, where 1 is very poor and 5 is excellent],
  "confidence": [float from 0.0-1.0 representing your confidence in this score],
  "justification": "[brief explanation of why this score was assigned for this facet]"
}

Consider only this specific facet in your evaluation. Be precise and objective.
`;

    try {
      const response = await this.makeRequest(prompt);
      
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const parsed: EvaluationPromptResponse = JSON.parse(jsonMatch[0]);
      
      // Validate the response
      if (typeof parsed.score !== 'number' || parsed.score < 1 || parsed.score > 5) {
        throw new Error('Invalid score in response');
      }
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        throw new Error('Invalid confidence in response');
      }
      
      return parsed;
    } catch (error) {
      console.error(`Failed to evaluate facet ${facetName}:`, error);
      // Return a fallback response
      return {
        score: 3,
        confidence: 0.5,
        justification: `Evaluation failed for ${facetName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async generateRewrite(text: string, lowCategories: string[]): Promise<string> {
    const prompt = `
The following text has low scores in these categories: ${lowCategories.join(', ')}.

Original text: "${text}"

Please provide an improved version that addresses the issues in the mentioned categories. Return only the improved text without any additional explanation.
`;

    try {
      const response = await this.makeRequest(prompt);
      return response.trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
    } catch (error) {
      console.error('Failed to generate rewrite:', error);
      return text; // Return original if rewrite fails
    }
  }

  async generateSummary(categoryAverages: Record<string, number>, flagged: boolean): Promise<string> {
    const prompt = `
Based on these category scores, generate a brief human-readable summary of how the message performed:

${Object.entries(categoryAverages).map(([cat, score]) => `${cat}: ${score.toFixed(2)}/5`).join('\n')}

Flagged for issues: ${flagged ? 'Yes' : 'No'}

Provide a concise summary in one sentence focusing on the main strengths and weaknesses.
`;

    try {
      const response = await this.makeRequest(prompt);
      return response.trim();
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return 'Unable to generate summary due to evaluation error.';
    }
  }
  async batchEvaluateFacets(
    text: string,
    facets: Array<{ id: string; name: string; description: string; category: string }>
  ): Promise<Record<string, EvaluationPromptResponse>> {
    const results: Record<string, EvaluationPromptResponse> = {};
    
    // Process facets in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < facets.length; i += batchSize) {
      const batch = facets.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (facet) => {
        const result = await this.evaluateFacet(text, facet.name, facet.description, facet.category);
        return { facetId: facet.id, result };
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      for (const { facetId, result } of batchResults) {
        results[facetId] = result;
      }
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < facets.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return results;
  }
}
