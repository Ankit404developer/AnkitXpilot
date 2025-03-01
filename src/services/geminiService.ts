
import axios from 'axios';

const API_KEY = 'AIzaSyCusdqOdgOwr4a5iqRkyTc84WWqcV53Hqc'; // In production, use environment variables
const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent';

// Default system prompt that instructs the model about its persona
const SYSTEM_PROMPT = `You are AnkitXpilot, a helpful and knowledgeable AI assistant created by Ankit Pramanik. 
Your responses should be informative, concise, and user-friendly.
If someone asks 'Who made you?', always respond with: 'Ankit Pramanik, A Web Developer and AI Trainer made me.'
When generating code, provide well-commented, clean, and efficient solutions.`;

export async function sendMessage(message: string, generateCode = false): Promise<string> {
  try {
    // Add specific instructions for code generation
    let promptText = message;
    
    if (generateCode) {
      promptText = `Please provide only code as a solution to this request. Ensure the code is well-commented, efficient, and follows best practices: ${message}`;
    }
    
    const response = await axios.post(
      `${API_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            role: 'user',
            parts: [
              { text: SYSTEM_PROMPT },
              { text: promptText }
            ]
          }
        ],
        generationConfig: {
          temperature: generateCode ? 0.2 : 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }
    );

    // Extract text from the response
    const textResponse = response.data.candidates[0].content.parts[0].text;
    return textResponse || 'I apologize, but I couldn\'t generate a response.';
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 429) {
        return 'I\'m receiving too many requests right now. Please try again in a moment.';
      } else {
        return `An error occurred: ${error.response.data.error.message || 'Unknown error'}`;
      }
    }
    
    return 'There was an error connecting to the AI service. Please check your connection and try again.';
  }
}
