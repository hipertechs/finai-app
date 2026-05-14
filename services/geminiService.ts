
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export interface AdviceTip {
  title: string;
  content: string;
}

export interface FinancialAdvice {
  intro: string;
  tips: AdviceTip[];
  closing: string;
}

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<FinancialAdvice | string> => {
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
    
    Responda EXCLUSIVAMENTE em formato JSON (sem markdown code blocks, apenas o objeto JSON) com a seguinte estrutura:
    {
      "intro": "Uma breve introdução encorajadora baseada nos dados",
      "tips": [
        {"title": "Título Curto da Dica 1", "content": "Descrição prática da Dica 1"},
        {"title": "Título Curto da Dica 2", "content": "Descrição prática da Dica 2"},
        {"title": "Título Curto da Dica 3", "content": "Descrição prática da Dica 3"}
      ],
      "closing": "Uma breve frase de encerramento motivadora"
    }
    Responda em Português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Using a more modern model if available, or stay with what works
      contents: prompt,
    });
    
    const text = response.text || "";
    try {
      // Remove possible markdown backticks if Gemini adds them
      const cleanJson = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson) as FinancialAdvice;
    } catch (e) {
      console.warn("Gemini didn't return valid JSON, returning raw text.");
      return text;
    }
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    return "Mantenha o foco nos seus objetivos financeiros!";
  }
};

