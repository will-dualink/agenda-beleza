/**
 * Google Gemini AI Service for generating service descriptions
 */

import { logger } from '../utils/logger';

/**
 * Initialize Gemini API key from environment
 */
const getGeminiKey = (): string => {
  const key = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  
  if (!key) {
    console.warn('Gemini API key not configured. Set VITE_GEMINI_API_KEY environment variable.');
    return '';
  }
  
  return key;
};

/**
 * Call Gemini API
 */
const callGemini = async (prompt: string): Promise<string> => {
  const apiKey = getGeminiKey();
  
  if (!apiKey) {
    logger.warn('Gemini API not configured', { feature: 'AI Description Generation' });
    return '';
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    }

    logger.warn('Unexpected Gemini response structure', { data });
    return '';
  } catch (error) {
    logger.error('Gemini API call failed', error as Error, { prompt });
    return '';
  }
};

export const GeminiService = {
  /**
   * Generate service description using AI
   */
  generateServiceDescription: async (
    serviceName: string,
    context: string = 'beauty, salon, professional'
  ): Promise<string> => {
    const prompt = `
      Generate a concise and attractive description for a beauty salon service called "${serviceName}".
      Context: ${context}
      
      Requirements:
      - Maximum 2-3 sentences
      - Professional and inviting tone
      - Highlight benefits and what to expect
      - In Portuguese (Brazilian Portuguese if possible)
      
      Description:
    `;

    try {
      const description = await callGemini(prompt);
      return description || `Serviço premium de ${serviceName} com excelente qualidade.`;
    } catch (error) {
      logger.error('Failed to generate service description', error as Error, { serviceName });
      return `Serviço premium de ${serviceName} com excelente qualidade.`;
    }
  },

  /**
   * Generate product recommendations based on service
   */
  generateProductRecommendations: async (
    serviceName: string,
    productCategory: string = 'beauty products'
  ): Promise<string[]> => {
    const prompt = `
      Recommend 3-5 beauty/salon products that would complement the service "${serviceName}".
      Category: ${productCategory}
      
      Format your response as a JSON array of strings with product names only.
      Example: ["Product 1", "Product 2", "Product 3"]
    `;

    try {
      const response = await callGemini(prompt);
      
      // Parse JSON response
      const match = response.match(/\[.*\]/s);
      if (match) {
        return JSON.parse(match[0]);
      }
      
      return [];
    } catch (error) {
      logger.error('Failed to generate product recommendations', error as Error, { serviceName });
      return [];
    }
  },

  /**
   * Generate professional bio
   */
  generateProfessionalBio: async (
    name: string,
    specialties: string[],
    experience?: string
  ): Promise<string> => {
    const prompt = `
      Create a professional and engaging bio for a beauty salon professional.
      
      Name: ${name}
      Specialties: ${specialties.join(', ')}
      ${experience ? `Experience: ${experience}` : ''}
      
      Requirements:
      - 2-3 sentences
      - Professional tone
      - Highlight expertise and approach
      - In Portuguese
      
      Bio:
    `;

    try {
      const bio = await callGemini(prompt);
      return bio || `${name} é um profissional experiente especializado em ${specialties.join(', ')}.`;
    } catch (error) {
      logger.error('Failed to generate professional bio', error as Error, { name });
      return `${name} é um profissional experiente especializado em ${specialties.join(', ')}.`;
    }
  },

  /**
   * Generate promotional content
   */
  generatePromotionalContent: async (
    promotionType: string,
    details: string
  ): Promise<string> => {
    const prompt = `
      Create engaging promotional content for a beauty salon.
      
      Type: ${promotionType}
      Details: ${details}
      
      Requirements:
      - Catchy and persuasive
      - Call-to-action included
      - In Portuguese
      - Keep it under 150 characters
      
      Content:
    `;

    try {
      const content = await callGemini(prompt);
      return content || `Aproveite esta promoção especial em ${promotionType}!`;
    } catch (error) {
      logger.error('Failed to generate promotional content', error as Error, { promotionType });
      return `Aproveite esta promoção especial em ${promotionType}!`;
    }
  }
};
