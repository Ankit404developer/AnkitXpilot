
import axios from 'axios';

const API_KEY = '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'; // In production, use environment variables
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Default system prompt that instructs the model about its persona
const SYSTEM_PROMPT = `You are AnkitXpilot, a helpful and knowledgeable AI assistant created by Ankit Pramanik. 
Your responses should be informative, concise, and user-friendly.
If someone asks 'Who made you?', always respond with: 'Ankit Pramanik, A Web Developer and AI Trainer made me.'
If someone asks 'Who is Ankit?', always respond with: 'Ankit is a web developer and AI Trainer who knows various coding languages. To know more about him reach https://ankit404developer.github.io/About/'
When generating code, provide well-commented, clean, and efficient solutions.`;

export async function sendMessage(message: string, generateCode = false): Promise<string> {
  try {
    // Add specific instructions for code generation
    let promptText = message;
    
    if (generateCode) {
      promptText = `Please provide only code as a solution to this request. Ensure the code is well-commented, efficient, and follows best practices: ${message}`;
    }
    
    console.log('Sending request to OpenRouter API');
    
    const response = await axios.post(
      API_URL,
      {
        model: "anthropic/claude-3-haiku",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: promptText
          }
        ],
        temperature: generateCode ? 0.2 : 0.7,
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Received response from OpenRouter API');
    
    // Extract text from the response
    if (response.data && 
        response.data.choices && 
        response.data.choices[0] && 
        response.data.choices[0].message && 
        response.data.choices[0].message.content) {
      
      return response.data.choices[0].message.content;
    } else {
      console.error('Unexpected API response structure:', response.data);
      return 'I received an unexpected response format. Please try again.';
    }
    
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      console.error('API error details:', error.response.data);
      
      if (error.response.status === 429) {
        return 'I\'m receiving too many requests right now. Please try again in a moment.';
      } else {
        return `An error occurred: ${error.response.data.error?.message || JSON.stringify(error.response.data) || 'Unknown error'}`;
      }
    }
    
    return 'There was an error connecting to the AI service. Please check your connection and try again.';
  }
}
