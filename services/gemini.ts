import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const GeminiService = {
  /**
   * Generates a creative marketing description for a beauty service.
   */
  generateServiceDescription: async (serviceName: string, keywords: string): Promise<string> => {
    if (!apiKey) return "Descrição automática indisponível (Chave de API não configurada).";

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Escreva uma descrição atraente, curta e luxuosa para um serviço de salão de beleza chamado "${serviceName}". Palavras-chave: ${keywords}. Limite a 2 frases. Em Português.`,
      });
      return response.text.trim();
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Erro ao gerar descrição.";
    }
  },

  /**
   * Analyzes daily appointments to provide operational insights.
   */
  analyzeDailySchedule: async (appointmentsStr: string): Promise<string> => {
    if (!apiKey) return "Análise indisponível.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analise esta lista de agendamentos do dia em um salão de beleza e forneça 3 insights curtos sobre a eficiência ou recomendações para a equipe (ex: lacunas na agenda, alta demanda). Dados: ${appointmentsStr}`,
        });
        return response.text;
    } catch (error) {
        return "Não foi possível analisar a agenda no momento.";
    }
  }
};