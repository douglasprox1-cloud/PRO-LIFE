
import { GoogleGenAI, Type } from "@google/genai";
import { GroundingChunk, Task, Transaction } from '../types';

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
            contents: `Analise o seguinte texto, que pode ser de uma planilha ou extrato, e extraia todas as transações financeiras. Para cada transação, identifique a descrição, o valor, a data, o tipo (se é 'income' para entrada ou 'expense' para saída) e a categoria. Use as seguintes categorias de despesa: 'Moradia', 'Transporte', 'Dívidas', 'Lazer', 'Presentes', 'Alimentação', 'Reserva', 'Imprevisto', 'Estudo', 'Autocuidado', 'Farmácia', 'Cartão de Crédito', 'Comunicação', 'Cantina', 'Investir em negócio'. Use as seguintes categorias de entrada: 'Hospital', '24 de Março', 'Eventos', 'Grau', 'Outros', 'Palestras', 'Vendas'. Se uma categoria não se encaixar, use 'Outros' para entradas ou 'Imprevisto' para despesas. A data deve estar no formato AAAA-MM-DD.\n\nTexto:\n${text}`,
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
                            type: { type: Type.STRING, oneOf: ['income', 'expense'] },
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

export const processTaskFromText = async (text: string): Promise<Partial<Omit<Task, 'id' | 'subtasks' | 'completed' | 'day' | 'period'>>> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const today = new Date().toISOString().split('T')[0];
        const prompt = `Analise o texto a seguir e extraia os detalhes para criar uma tarefa. O dia de hoje é ${today}. Se o texto mencionar um dia da semana (ex: 'segunda-feira'), calcule a data correspondente à próxima ocorrência desse dia a partir de hoje.

Texto: "${text}"

Extraia as seguintes informações:
- title: O título principal da tarefa, seja conciso e remova os detalhes de tempo/data. Ex: "Reunião com a equipe".
- category: A categoria da tarefa. Escolha uma das seguintes opções: 'Rotina 1h', 'Rotina 3h', 'Saúde', 'Pendências', 'Expansão/Projetos', 'Hábitos', 'Padrão Paralelo'. Se nenhuma se encaixar, use 'Pendências'.
- priority: A prioridade da tarefa. Mapeie palavras como 'urgente' para 'Urgente'. Escolha uma das seguintes opções: 'Urgente', 'Quando Possível', 'Rotina', 'Pode Esperar'. Se nenhuma for especificada, use 'Quando Possível'.
- date: A data da tarefa no formato AAAA-MM-DD. Se for "hoje", use ${today}. Se for "amanhã", calcule a data correta.
- time: A hora da tarefa no formato HH:MM (24 horas).

Se alguma informação não estiver presente no texto, omita o campo correspondente do JSON.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        category: { type: Type.STRING, oneOf: ['Rotina 1h', 'Rotina 3h', 'Saúde', 'Pendências', 'Expansão/Projetos', 'Hábitos', 'Padrão Paralelo'] },
                        priority: { type: Type.STRING, oneOf: ['Urgente', 'Quando Possível', 'Rotina', 'Pode Esperar'] },
                        date: { type: Type.STRING, description: "Data no formato YYYY-MM-DD" },
                        time: { type: Type.STRING, description: "Hora no formato HH:MM" },
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        const taskData = JSON.parse(jsonStr);
        return taskData as Partial<Omit<Task, 'id'>>;

    } catch (error) {
        console.error("Erro ao processar tarefa com IA:", error);
        throw new Error("Não foi possível analisar o texto da tarefa. Tente novamente.");
    }
};

export const getShoppingItemPrice = async (itemName: string): Promise<{ price: number | null, link: string | null }> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Fix: Updated prompt to explicitly request JSON, as responseSchema is not allowed with the googleSearch tool.
    const prompt = `Encontre o preço médio em BRL para o item "${itemName}" em um grande varejista online no Brasil. Formate a resposta como um objeto JSON com as chaves "price" (um número) e "link" (uma string). Não adicione nenhuma formatação extra, como markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Fix: Removed responseMimeType and responseSchema as they are not allowed with the googleSearch tool.
      },
    });

    // Fix: Handle potential markdown in the response before parsing.
    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
    }
    
    const data = JSON.parse(jsonStr);
    return {
      price: data.price || null,
      link: data.link || null,
    };

  } catch (error) {
    console.error("Erro ao buscar preço com IA:", error);
    return { price: null, link: null };
  }
};