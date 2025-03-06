
import axios from 'axios';

const API_KEY = 'AIzaSyAi_sRJ5o_Iic5g99BIbiPd7rTUAUKxiF8'; // New Gemini API key
const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

// Default system prompt that instructs the model about its persona
const SYSTEM_PROMPT = `You are AnkitXpilot, a helpful and knowledgeable AI assistant created by Ankit Pramanik. 
Your responses should be informative, concise, and user-friendly.
If someone asks 'Who made you?', always respond with: 'Ankit Pramanik, A Web Developer and AI Trainer made me.'
If someone asks 'Who is Ankit?', always respond with: 'Ankit is a web developer and AI Trainer who knows various coding languages. To know more about him reach https://ankit404developer.github.io/About/'
When generating code, provide well-commented, clean, and efficient solutions.`;

// Extended system prompt for "Think Deeply" mode
const DEEP_THINKING_PROMPT = `${SYSTEM_PROMPT}
In this interaction, the user has requested a more thoughtful and in-depth response.
Take your time to explore multiple perspectives, consider edge cases, and provide a comprehensive analysis.
Your response should be more detailed than usual, thoroughly examining the subject matter.
Include relevant examples, potential implications, and nuanced considerations in your answer.`;

export async function sendMessage(
  message: string, 
  generateCode = false, 
  thinkDeeply = false, 
  learnedData: Record<string, string[]> = {},
  isTemporary = false
): Promise<string> {
  try {
    // Add specific instructions for code generation or deep thinking
    let promptText = message;
    let systemPrompt = SYSTEM_PROMPT;
    
    if (generateCode) {
      promptText = `Please provide only code as a solution to this request. Ensure the code is well-commented, efficient, and follows best practices: ${message}`;
    }
    
    if (thinkDeeply) {
      systemPrompt = DEEP_THINKING_PROMPT;
    }
    
    // Include learned data in the system prompt if not in temporary mode
    if (!isTemporary && Object.keys(learnedData).length > 0) {
      const learnedDataPrompt = `
I've learned the following information about the user or their interests:
${Object.entries(learnedData)
  .map(([key, values]) => `- ${key}: ${values.join(', ')}`)
  .join('\n')}

Use this information to personalize your response when relevant, but don't explicitly mention that you've "learned" this unless asked about your memory or capabilities.`;
      
      systemPrompt = `${systemPrompt}\n\n${learnedDataPrompt}`;
    }
    
    console.log('Sending request to API');
    
    // Create the request body according to Gemini API format
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: promptText
            }
          ]
        }
      ],
      generationConfig: {
        temperature: generateCode ? 0.2 : thinkDeeply ? 0.5 : 0.7,
        maxOutputTokens: thinkDeeply ? 4096 : 2048
      },
      systemInstruction: {
        parts: [
          {
            text: systemPrompt
          }
        ]
      }
    };
    
    const response = await axios.post(
      `${API_URL}?key=${API_KEY}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Received response from API');
    
    // Extract text from the Gemini API response
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content && 
        response.data.candidates[0].content.parts && 
        response.data.candidates[0].content.parts[0] &&
        response.data.candidates[0].content.parts[0].text) {
      
      return response.data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected API response structure:', response.data);
      return 'I received an unexpected response format. Please try again.';
    }
    
  } catch (error) {
    console.error('Error calling API:', error);
    
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
