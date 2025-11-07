// LLM API Service for Port Operations Dashboard

// Use proxy endpoint to avoid CORS issues in development
// The proxy is configured in vite.config.ts to forward /api/* to the AWS endpoint
const API_ENDPOINT = '/api/query';
const API_KEY = '0Pp9kbD4QsckHToGIbSr6F7GZuKv3nV1lb1Jqyoa';

export interface EmailSource {
  email_id: string;
  sender: string;
  sender_role: string;
  subject: string;
  date: string;
  vessel: string;
  event_category: string;
  similarity_score: number;
}

export interface LLMResponse {
  answer: string;
  sources: EmailSource[];
  filters_applied: Record<string, any>;
  token_usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface QueryOptions {
  query: string;
  filters?: Record<string, any>;
}

/**
 * Query the LLM API with a user question
 */
export async function queryLLM(options: QueryOptions): Promise<LLMResponse> {
  try {
    console.log('🚀 Sending request to LLM API...');
    console.log('Endpoint:', API_ENDPOINT);
    console.log('Query:', options.query);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        query: options.query,
        filters: options.filters || {},
      }),
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: LLMResponse = await response.json();
    console.log('✅ API Response received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error querying LLM API:', error);
    throw error;
  }
}

/**
 * Format the LLM response for display in the chat
 */
export function formatLLMResponse(response: LLMResponse): string {
  let formatted = response.answer;

  // Add source information if available
  if (response.sources && response.sources.length > 0) {
    formatted += '\n\n📧 **Sources:**';
    response.sources.forEach((source, index) => {
      if (index < 3) { // Show top 3 sources
        formatted += `\n${index + 1}. ${source.subject} (${source.date}) - ${source.sender}`;
      }
    });

    if (response.sources.length > 3) {
      formatted += `\n... and ${response.sources.length - 3} more sources`;
    }
  }

  return formatted;
}
