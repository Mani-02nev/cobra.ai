
export const CONFIG = {
    API_URL: import.meta.env.VITE_API_URL || 'https://api.openai.com/v1/chat/completions',
    API_KEY: import.meta.env.VITE_API_KEY || '',
    // Mock mode is used if API key is missing
    MOCK_MODE: !import.meta.env.VITE_API_KEY
};

export async function getAIResponse(message, conversationHistory, mode = 'standard', persona = 'assistant') {
    if (CONFIG.MOCK_MODE || !CONFIG.API_KEY) {
        return getMockResponse(message);
    }

    try {
        const isGemini = CONFIG.API_URL.includes('generativelanguage.googleapis.com');

        let url = CONFIG.API_URL;
        let headers = {
            'Content-Type': 'application/json'
        };
        let body = {};

        if (isGemini) {
            // Google Gemini API Configuration
            url = `${CONFIG.API_URL}?key=${CONFIG.API_KEY}`;

            // Map conversation history to Gemini format
            const contents = conversationHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            // Add system prompt as the first message if possible, or just prepend to first user message 
            // Gemini doesn't strictly have a "system" role in the same way, but often "user" instructions work.
            // For simplicity/compatibility, we can prepend the system prompt to the context or first message.
            const systemPrompt = getSystemPrompt(persona);
            if (contents.length > 0 && contents[0].role === 'user') {
                contents[0].parts[0].text = `${systemPrompt}\n\n${contents[0].parts[0].text}`;
            } else {
                contents.unshift({
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                });
            }

            body = {
                contents: contents,
                generationConfig: {
                    temperature: mode === 'creative' ? 0.9 : mode === 'factual' ? 0.3 : 0.7,
                    maxOutputTokens: 1000
                }
            };

        } else {
            // OpenAI API Configuration (Default)
            headers['Authorization'] = `Bearer ${CONFIG.API_KEY}`;
            body = {
                model: import.meta.env.VITE_API_MODEL || 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: getSystemPrompt(persona)
                    },
                    ...conversationHistory.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                ],
                temperature: mode === 'creative' ? 0.9 : mode === 'factual' ? 0.3 : 0.7,
                max_tokens: 1000
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API request failed: ${response.status} ${errorData.error?.message || JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        if (isGemini) {
            // Parse Gemini Response
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return "No response generated.";
            }
        } else {
            // Parse OpenAI Response
            return data.choices[0].message.content;
        }

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function getSystemPrompt(persona) {
    const personaPrompts = {
        assistant: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
        developer: 'You are an expert software developer. Provide technical, detailed responses with code examples when relevant.',
        writer: 'You are a creative writer. Provide imaginative, engaging, and well-crafted responses.',
        sql: 'You are a helpful assistant for writing SQL queries. You provide optimized SQL code.',
        sarcastic: 'You are a sarcastic and witty assistant. You answer questions reluctantly.'
    };

    return personaPrompts[persona] || personaPrompts.assistant;
}

function getMockResponse(message) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const responses = [
                `I understand you're asking about "${message}". As an AI assistant, I'm here to help you with that. This is a demo response since the API is not configured yet.`,
                `That's an interesting question about "${message}". In a production environment, I would provide a detailed response based on the AI model's capabilities.`,
                `Thank you for your message. To get real AI responses, please configure your API credentials in the .env file (VITE_API_URL and VITE_API_KEY).`,
                `I've processed your query about "${message}". This is a simulated response. Configure your AI API to get intelligent, context-aware answers.`
            ];

            resolve(responses[Math.floor(Math.random() * responses.length)]);
        }, 1500);
    });
}
