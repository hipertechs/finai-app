
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  // Use named parameter and obtain API key directly from environment variable as per guidelines
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });
  
  const summary = transactions.reduce((acc, t) => {
    const key = `${t.type}_${t.category}`;
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
    Como um consultor financeiro sênior, analise este resumo mensal e dê 3 dicas práticas e curtas para melhorar a saúde financeira.
    Resumo das transações:
    ${JSON.stringify(summary, null, 2)}
    
    Responda em Português do Brasil, de forma encorajadora e profissional. 
    Foque em redução de gastos variáveis e aumento de aportes em investimentos.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Access text property directly as per guidelines (not a method)
    return response.text || "Não foi possível gerar dicas no momento. Continue acompanhando seus gastos!";
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    return "Mantenha o foco nos seus objetivos financeiros!";
  }
};
