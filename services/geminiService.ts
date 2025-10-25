import { GoogleGenAI, Type } from "@google/genai";
import { GroundingChunk, Transaction } from '../types';

export const getAiSuggestions = async (prompt: string): Promise<{ text: string, sources: GroundingChunk[] }> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Com base em informações atuais e precisas, me dê uma lista concisa de tarefas ou ideias acionáveis relacionadas a: "${prompt}". Formate a saída como uma lista simples.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // This type assertion is necessary because the SDK's type for groundingChunks is generic.
    const sources = groundingChunks as GroundingChunk[];

    return { text, sources };
  } catch (error) {
    console.error("Erro ao buscar sugestões da IA:", error);
    return { text: "Desculpe, não consegui obter sugestões no momento. Por favor, tente novamente mais tarde.", sources: [] };
  }
};

export const processTransactionsFromText = async (text: string): Promise<Partial<Transaction>[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analise o seguinte texto, que pode ser de uma planilha ou extrato, e extraia todas as transações financeiras. Para cada transação, identifique a descrição, o valor, a data, o tipo (se é 'income' para entrada ou 'expense' para saída) e a categoria. Use as seguintes categorias de despesa: 'Moradia', 'Transporte', 'Dívidas', 'Lazer', 'Presentes', 'Alimentação', 'Reserva', 'Imprevisto', 'Estudo', 'Autocuidado', 'Farmácia', 'Cartão de Crédito'. Use as seguintes categorias de entrada: 'Hospital', '24 de Março', 'Eventos', 'Grau', 'Outros', 'Palestras', 'Vendas'. Se uma categoria não se encaixar, use 'Outros' para entradas ou 'Imprevisto' para despesas. A data deve estar no formato AAAA-MM-DD.\n\nTexto:\n${text}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            description: { type: Type.STRING },
                            amount: { type: Type.NUMBER },
                            date: { type: Type.STRING, description: "Data no formato YYYY-MM-DD" },
                            type: { type: Type.STRING, enum: ['income', 'expense'] },
                            category: { type: Type.STRING },
                        },
                         required: ["description", "amount", "date", "type", "category"],
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        const transactions = JSON.parse(jsonStr);
        return transactions as Partial<Transaction>[];

    } catch (error) {
        console.error("Erro ao processar transações com IA:", error);
        throw new Error("Não foi possível analisar o arquivo. Verifique o formato e tente novamente.");
    }
};
