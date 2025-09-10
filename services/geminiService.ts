import { GoogleGenAI, Type } from "@google/genai";
import type { StoryResponse, ImageDescription } from '../types';

const getApiKey = (): string => {
    // First, try to get the key from sessionStorage.
    const key = sessionStorage.getItem('gemini_api_key');
    if (key) return key;

    // Fallback to environment variable if not in session storage.
    // This is useful for development or initial setup.
    const envKey = process.env.API_KEY;
    if (envKey) {
        sessionStorage.setItem('gemini_api_key', envKey);
        return envKey;
    }

    return "";
}

const getAiClient = (): GoogleGenAI => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API Key is not set. Please add it in the settings menu (gear icon).");
    }
    return new GoogleGenAI({ apiKey });
}

const handleApiError = (error: unknown, context: string): string => {
    console.error(`Error in ${context}:`, error);
    if (error instanceof Error) {
        // Handle specific error for missing API key first
        if (error.message.includes("API Key is not set")) {
            return error.message;
        }

        try {
            // Attempt to parse a JSON error message if the service returns one
            const apiError = JSON.parse(error.message);
            if (apiError.error && apiError.error.message) {
                const detailedMessage = apiError.error.message;
                if (apiError.error.code === 429) {
                     return `[Rate Limit Exceeded] The AI service is busy. Please wait a moment and try again. Details: ${detailedMessage}`;
                }
                return `An API error occurred in ${context}: ${detailedMessage}`;
            }
        } catch (e) {
            // Fallback for non-JSON error messages
            if (error.message.includes("429")) {
                return `[Rate Limit Exceeded] The AI service is busy. Please wait a moment and try again.`;
            }
             if (error.message.includes("Could not parse JSON response")) {
                return `The AI returned an invalid data format. Please try generating again.`;
            }
            return `An error occurred in ${context}: ${error.message}`;
        }
        return `An error occurred in ${context}: ${error.message}`;
    }
    return `An unknown error occurred in ${context}.`;
};

const extractJsonFromResponse = (rawText: string): any => {
    const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
    let parsableText = rawText;

    if (jsonMatch && jsonMatch[1]) {
        parsableText = jsonMatch[1];
    } else {
        const firstBrace = parsableText.indexOf('{');
        const lastBrace = parsableText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            parsableText = parsableText.substring(firstBrace, lastBrace + 1);
        }
    }
    
    try {
        return JSON.parse(parsableText);
    } catch (e) {
        console.error("Failed to parse JSON from model response:", parsableText);
        throw new Error(`Could not parse JSON response from AI. Raw text: ${rawText}`);
    }
};


export const generateTitles = async (topic: string): Promise<string[]> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Gere 5 títulos VIRAIS de vídeo para o YouTube sobre o tema: "${topic}".
            
Requisitos:
- Máximo de 60 caracteres (títulos mais curtos têm melhor desempenho)
- Use gatilhos emocionais (chocante, inacreditável, comovente, etc.)
- Inclua palavras de poder que criem urgência
- Adicione elementos de mistério ou curiosidade
- Use números quando relevante (Top 5, 3 Segredos, etc.)
- Considere adicionar emojis se apropriado
- Torne impossível NÃO clicar

Exemplos de formatos virais:
- "Ela Era [X] Até Descobrir [Y]"
- "[Celebridade/Papel] Fez O QUÊ?! (CHOQUE)"
- "Riram Dele Quando [X], Mas Então [Y]..."
- "O Segredo [X] Que [Autoridade] Não Quer Que Você Saiba"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        titles: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const json = extractJsonFromResponse(response.text);
        return json.titles || [];
    } catch (error) {
        throw new Error(handleApiError(error, 'generateTitles'));
    }
};

export const generateStory = async (title: string): Promise<StoryResponse> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Crie um roteiro de história VIRAL em PORTUGUÊS para o YouTube com o título: "${title}". Alvo: 8-10 minutos de tempo de leitura.

**REQUISITOS ABSOLUTOS:**

1. **REGRAS DE DIÁLOGO:**
   - Cada linha de diálogo deve soar como pessoas REAIS falando.
   - Máximo de 15 palavras por linha de diálogo.
   - Use contrações (tá, pra, etc.) e gírias apropriadas.
   - Inclua interrupções, hesitações, padrões de fala reais.
   
   BOM: "Espera, você tá me dizendo que ele mentiu esse tempo todo?"
   RUIM: "Eu não posso acreditar que este cavalheiro esteve nos enganando por todo este período."

2. **FREQUÊNCIA DE GANCHOS (HOOKS):**
   - Insira um gancho/pergunta/cliffhanger a cada 3-4 frases, NO MÍNIMO.
   - Use estes padrões:
     • "Mas foi aí que tudo mudou..."
     • "Ela não tinha ideia do que estava por vir."
     • "Você teria feito a mesma escolha?"
     • "A verdade era pior do que ela imaginava."
     • "Em 30 segundos, a vida dela nunca mais seria a mesma."

3. **MOMENTOS EMOCIONAIS (Inclua TODOS):**
   - Uma traição que faça os espectadores arfarem.
   - Um momento de "tudo está perdido" onde a esperança morre.
   - Um aliado inesperado aparecendo.
   - Uma revelação de segredo chocante.
   - Um momento de vingança/justiça satisfatório.
   - Uma recompensa emocional comovente (de chorar).

4. **FÓRMULA DE RITMO:**
   - Comece no meio da ação (sem preparação).
   - Um ponto de virada importante a cada 200 palavras.
   - Nenhuma cena com mais de 150 palavras.
   - Corte TODAS as descrições, exceto detalhes visuais críticos.

5. **OS 3 MOMENTOS "OMG":**
   Parte 1: Termine com uma escolha impossível.
   Parte 2: Termine com uma traição devastadora.
   Parte 3: Termine com o jogo virando.
   Parte 4: Termine com uma transformação emocional.

**ESTRUTURA DA HISTÓRIA:**

**Parte 1: Gancho Inicial (700-800 palavras)**
- Comece com o protagonista em perigo/conflito imediato.
- Revele o dilema central no primeiro parágrafo.
- Termine com: "Mas primeiro, deixe-me contar como tudo começou..." (gancho de flashback).

**Parte 2: A Armadilha se Fecha (700-800 palavras)**
- Breve história de fundo (máximo 100 palavras).
- Apresente o FALSO aliado (que na verdade é o vilão).
- Construa uma falsa esperança.
- Termine com a revelação da traição.

**Parte 3: Fundo do Poço e Ascensão (700-800 palavras)**
- O protagonista perde tudo.
- Descobre uma força oculta/arma secreta.
- Uma aliança improvável é formada.
- Termine com a preparação para o confronto.

**Parte 4: Confronto e Reviravolta (700-800 palavras)**
- O confronto final.
- O jogo vira inesperadamente.
- A justiça é feita de forma satisfatória.
- Epílogo emocional (o que aconteceu depois).
- Gancho final: insinue uma sequência ou faça uma pergunta ao espectador.

**EXPRESSÕES PROIBIDAS (Nunca use):**
- "Mal sabia ela"
- "O destino tinha outros planos"
- "Foi um testemunho de"
- "Provaria ser"
- Qualquer linguagem formal/literária.

**EXPRESSÕES OBRIGATÓRIAS (Use variações):**
- "Você não vai acreditar no que aconteceu a seguir"
- "É aqui que a coisa fica louca"
- "Lembre-se deste detalhe, é importante"
- "O que você teria feito?"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        parts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    content: { type: Type.STRING }
                                },
                                required: ["title", "content"]
                            },
                            minItems: 4,
                            maxItems: 4
                        },
                        summary: { type: Type.STRING },
                        characters: { type: Type.ARRAY, items: { type: Type.STRING } },
                        locations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["parts", "summary", "characters", "locations"]
                }
            }
        });
        return extractJsonFromResponse(response.text);
    } catch (error) {
        throw new Error(handleApiError(error, 'generateStory'));
    }
};

export const generateImageDescriptions = async (storySummary: string, count: number): Promise<ImageDescription[]> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Crie ${count} descrições de imagem CINEMATOGRÁFICAS para esta história: "${storySummary}"
            
Requisitos para CADA imagem:
1. Foco em EXPRESSÕES FACIAIS mostrando emoção crua.
2. Inclua iluminação dramática (golden hour, neon, sombras, etc.).
3. Descreva a linguagem corporal que conta a história.
4. Adicione detalhes atmosféricos (chuva, neblina, vidro quebrado, etc.).
5. Mantenha a consistência dos personagens (cabelo, idade, estilo de roupa).
6. Use ângulos cinematográficos (close-up em lágrimas, plano aberto, sobre o ombro, etc.).

Formate cada uma para maximizar o impacto visual e a resposta emocional.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        descriptions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    sequence: { type: Type.INTEGER },
                                    scene: { type: Type.STRING },
                                    prompt: { type: Type.STRING }
                                },
                                required: ["sequence", "scene", "prompt"]
                            }
                        }
                    },
                    required: ["descriptions"]
                }
            }
        });
        const json = extractJsonFromResponse(response.text);
        return json.descriptions || [];
    } catch (error) {
        throw new Error(handleApiError(error, 'generateImageDescriptions'));
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Cena cinematográfica, narrativa emocional, frame de vídeo do YouTube.
            ${prompt}
            Estilo: Fotorrealista, iluminação dramática, alto contraste, foco nítido em rostos mostrando emoção intensa,
            profundidade de campo, color grading como um drama da Netflix, proporção 16:9, qualidade 4K.
            Ênfase em: expressões faciais, linguagem corporal, narrativa ambiental.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        throw new Error("Image generation returned no images.");
    } catch (error) {
         throw new Error(handleApiError(error, 'generateImage'));
    }
};

export const generateThumbnailDescription = async (title: string, storySummary: string): Promise<string> => {
     try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Crie um prompt para uma miniatura (thumbnail) VIRAL de YouTube para: "${title}"
            História: "${storySummary}"
            
            A miniatura deve ter:
            1. Tela dividida ou composição dramática.
            2. Expressão facial chocada/emocional em primeiro plano.
            3. Setas ou círculos vermelhos destacando um elemento chave.
            4. Alto contraste, cores saturadas.
            5. Um ponto focal claro que conta a história.
            6. Áreas para sobreposição de texto (deixe espaço para o título).
            
            Faça ser impossível rolar a página sem clicar.`,
        });
        return response.text;
    } catch (error) {
        throw new Error(handleApiError(error, 'generateThumbnailDescription'));
    }
}

export const generateYoutubeDescription = async (title: string, storySummary: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Crie uma descrição de vídeo do YouTube atraente e otimizada para SEO, com base no título "${title}" e neste resumo: "${storySummary}".

            **Requisitos de Estrutura:**
            1.  **Gancho Envolvente (1-2 frases):** Comece com uma frase que prenda a atenção e inclua as principais palavras-chave do título.
            2.  **Resumo Detalhado (3-4 frases):** Expanda brevemente a premissa da história, o conflito e o que os espectadores podem esperar, sem revelar o final.
            3.  **Seção de Palavras-chave:** Liste de 5 a 7 palavras-chave relevantes que as pessoas podem pesquisar para encontrar este vídeo.
            4.  **Seção de Hashtags:** Forneça de 3 a 5 hashtags relevantes (ex: #HistoriaAnimada, #Drama, #HistoriaViral).
            5.  **Chamada para Ação (Call to Action):** Termine com uma chamada para ação (ex: "Não se esqueça de curtir, se inscrever e ativar o sininho para mais histórias incríveis!").

            Toda a descrição deve ser bem formatada e fácil de ler.`,
        });
        return response.text;
    } catch (error) {
        throw new Error(handleApiError(error, 'generateYoutubeDescription'));
    }
}


const splitTextIntoChunks = (text: string, maxChunkSize: number): string[] => {
    const sentences = text.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [];
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChunkSize) {
            if (currentChunk) {
                chunks.push(currentChunk);
            }
            // If a single sentence is larger than the max chunk size, it becomes its own chunk
            currentChunk = sentence.length > maxChunkSize ? "" : sentence;
            if(sentence.length > maxChunkSize) chunks.push(sentence);
        } else {
            currentChunk += sentence;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
};


export const generateSpeech = async (text: string, voiceName: string = 'Enceladus', onProgress?: (progress: number) => void): Promise<string> => {
    try {
        const ai = getAiClient();
        const TTS_CHAR_LIMIT = 4500; // Safe character limit for the TTS API
        const chunks = splitTextIntoChunks(text, TTS_CHAR_LIMIT);
        let combinedAudioData = "";

        for (let i = 0; i < chunks.length; i++) {
            const chunkText = chunks[i];
            if (onProgress) {
                onProgress(((i) / chunks.length) * 100);
            }
            
            const processedText = chunkText
                .replace(/\?/g, '? ')
                .replace(/!/g, '! ')
                .replace(/\.\.\./g, '... ');
            
            const config: any = {
                temperature: 1.0,
                response_modalities: ['audio'],
                speech_config: {
                    voice_config: {
                        prebuilt_voice_config: {
                            voice_name: voiceName,
                        }
                    }
                },
            };

            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-pro-preview-tts',
                contents: [{ role: 'user', parts: [{ text: processedText }] }],
                config: config,
            });

            let chunkAudioData = "";
            for await (const chunk of responseStream) {
                if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
                    chunkAudioData += chunk.candidates[0].content.parts[0].inlineData.data;
                }
            }

            if (!chunkAudioData) {
                 console.error("No audio data found in response stream for a chunk:", chunkText);
                 throw new Error("Audio generation chunk did not return valid data.");
            }
            combinedAudioData += chunkAudioData;
        }

        if (onProgress) {
            onProgress(100);
        }

        if (combinedAudioData) {
            return combinedAudioData;
        }
        
        throw new Error("Audio generation did not return any valid data after processing all chunks.");

    } catch (error) {
        throw new Error(handleApiError(error, 'generateSpeech'));
    }
};