
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ComicPanel, Character, ResearchData, StoryFormat, StoryConcept, Message, PanelTranslation, ChapterArchive } from "../types";
import { PROMPTS } from "./prompts";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getTextModel = (tier: 'STANDARD' | 'PREMIUM' = 'STANDARD') => 
    tier === 'PREMIUM' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

const getImageModel = (tier: 'STANDARD' | 'PREMIUM' = 'STANDARD') => 
    'gemini-2.5-flash-image'; 

// Helper to clean Markdown JSON blocks
const cleanAndParseJSON = (text: string) => {
    try {
        let cleanText = text.trim();
        // Remove markdown code blocks if present
        if (cleanText.startsWith("```json")) {
            cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanText.startsWith("```")) {
            cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error. Raw Text:", text);
        throw new Error("Failed to parse AI response. Please try again.");
    }
};

export const analyzeUploadedManuscript = async (scriptContent: string, language: string, tier: 'STANDARD' | 'PREMIUM'): Promise<ResearchData> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: PROMPTS.analyzeManuscript(scriptContent, language),
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text!);
};

export const sendResearchChatMessage = async (history: Message[], newMessage: string, context: { theme: string, storyFormat: StoryFormat, totalChapters?: string, language: string, originalScript?: string }, tier: 'STANDARD' | 'PREMIUM'): Promise<string> => {
    const ai = getAI();
    const contents = history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
    }));
    
    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: contents,
        config: { systemInstruction: PROMPTS.researchChatSystem(context.theme, context.storyFormat, context.language) }
    });

    return response.text!;
};

export const extractStrategyFromChat = async (history: Message[], language: string, tier: 'STANDARD' | 'PREMIUM'): Promise<ResearchData> => {
    const ai = getAI();
    const chatLog = history.map(m => `${m.role}: ${m.content}`).join("\n");
    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: PROMPTS.extractStrategy(chatLog, language),
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text!);
};

export const generateStoryConceptsWithSearch = async (theme: string, style: string, language: string, tier: 'STANDARD' | 'PREMIUM'): Promise<StoryConcept> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: PROMPTS.storyConcept(theme, style, language),
        config: { 
            tools: tier === 'PREMIUM' ? [{ googleSearch: {} }] : undefined,
            responseMimeType: "application/json"
        }
    });
    return cleanAndParseJSON(response.text!);
};

export const generateComplexCharacters = async (concept: StoryConcept, language: string, tier: 'STANDARD' | 'PREMIUM'): Promise<Character[]> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: PROMPTS.complexCharacters(concept.premise, language),
        config: { responseMimeType: "application/json" }
    });

    const chars = cleanAndParseJSON(response.text!);
    return chars.map((c: any) => ({ ...c, id: crypto.randomUUID() }));
};

export const generateSeriesBible = async (theme: string, style: string, language: string, tier: 'STANDARD' | 'PREMIUM'): Promise<any> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: PROMPTS.seriesBible(theme, style, language),
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text!);
};

export const generateScript = async (
    theme: string, 
    style: string, 
    language: string, 
    format: StoryFormat, 
    bible: any, 
    tier: 'STANDARD' | 'PREMIUM',
    concept: StoryConcept | undefined,
    characters: Character[],
    chapterSummary: string,
    chapterNumber: number,
    originalScript?: string,
    previousSummaries?: string[],
    targetPanelCount?: number
): Promise<{ title: string, panels: ComicPanel[] }> => {
    const ai = getAI();
    
    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: PROMPTS.scriptGeneration(
            chapterNumber, 
            format, 
            style, 
            language, 
            targetPanelCount || 20, 
            concept?.premise || theme, 
            characters.map(c => c.name).join(", "), 
            chapterSummary, 
            originalScript || ""
        ),
        config: { responseMimeType: "application/json" }
    });

    const result = cleanAndParseJSON(response.text!);
    return {
        title: result.title,
        panels: result.panels.map((p: any) => ({ ...p, id: crypto.randomUUID(), dialogue: p.dialogue || '', charactersInvolved: p.charactersInvolved || [] }))
    };
};

export const batchTranslatePanels = async (panels: ComicPanel[], languages: string[], tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'): Promise<ComicPanel[]> => {
    if (languages.length === 0) return panels;

    const ai = getAI();
    const panelsMin = panels.map(p => ({
        id: p.id,
        dialogue: p.dialogue, 
        caption: p.caption
    }));

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: PROMPTS.translatePanels(JSON.stringify(panelsMin), languages),
            config: { responseMimeType: "application/json" }
        });

        const translatedData = cleanAndParseJSON(response.text!);
        
        return panels.map(p => {
            const tPanel = translatedData.find((tp: any) => tp.id === p.id);
            const existingTranslations = p.translations || {};
            const newTranslations = tPanel ? { ...existingTranslations, ...tPanel.translations } : existingTranslations;

            return {
                ...p,
                translations: newTranslations
            };
        });
    } catch (e) {
        console.error("Translation failed", e);
        return panels; 
    }
};

export const censorContent = async (text: string, type: 'SCRIPT' | 'IMAGE'): Promise<{ passed: boolean, report: string }> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: PROMPTS.censor(type, text),
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text!);
};

export const generateCharacterDesign = async (name: string, theme: string, style: string, language: string, isLongFormat: boolean, tier: 'STANDARD' | 'PREMIUM', description?: string): Promise<{ description: string, imageUrl: string }> => {
    const ai = getAI();
    const descResp = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: PROMPTS.characterDesign(name, style, theme, description || '')
    });
    const refinedDesc = descResp.text!;

    const response = await ai.models.generateContent({
        model: getImageModel(tier),
        contents: PROMPTS.characterImagePrompt(name, refinedDesc, style),
        config: { } 
    });

    let imageUrl = '';
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
             if (part.inlineData) {
                 imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
             }
        }
    }
    
    return { description: refinedDesc, imageUrl };
};

export const generatePanelImage = async (panel: ComicPanel, style: string, characters: Character[], tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'): Promise<string> => {
    const ai = getAI();
    const charDesc = characters.filter(c => panel.charactersInvolved.includes(c.name))
        .map(c => `${c.name}: ${c.description}`).join(". ");
    
    const response = await ai.models.generateContent({
        model: getImageModel(tier),
        contents: PROMPTS.panelImagePrompt(style, panel.description, charDesc),
    });

    let imageUrl = '';
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
             if (part.inlineData) {
                 imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
             }
        }
    }
    return imageUrl;
};

export const generatePanelVideo = async (panel: ComicPanel, style: string): Promise<string> => {
    if (!panel.imageUrl) return '';
    const ai = getAI();
    const base64Data = panel.imageUrl.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
    
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview', 
            prompt: `Cinematic motion for a comic panel. ${style} style. ${panel.description}. Subtle movement, parallax effect, atmospheric.`,
            image: {
                imageBytes: base64Data,
                mimeType: 'image/png' 
            },
            config: {
                numberOfVideos: 1,
                aspectRatio: '16:9',
                resolution: '720p'
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); 
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (videoUri) {
            const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        }
    } catch (e) {
        console.error("Veo generation failed", e);
    }
    return '';
};

export const summarizeChapter = async (panels: ComicPanel[], tier: 'STANDARD' | 'PREMIUM'): Promise<string> => {
    const ai = getAI();
    const text = panels.map(p => p.description).join(" ");
    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: PROMPTS.summarizeChapter(text)
    });
    return response.text!;
};

export const generateVoiceover = async (text: string, voiceName: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text }] },
        config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName }
                }
            }
        }
    });

    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
             if (part.inlineData) {
                 return `data:audio/mp3;base64,${part.inlineData.data}`; 
             }
        }
    }
    return '';
};

export const analyzeCharacterConsistency = async (imageBase64: string, targetStyle: string, characterName: string, tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'): Promise<{ isConsistent: boolean, critique: string }> => {
    const ai = getAI();
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
    
    const response = await ai.models.generateContent({ 
        model: getTextModel(tier), 
        contents: { parts: [{ inlineData: { mimeType: 'image/png', data: cleanBase64 } }, { text: PROMPTS.analyzeConsistency(characterName, targetStyle) }] }, 
        config: { responseMimeType: "application/json" } 
    });
    
    return cleanAndParseJSON(response.text!);
};

export const verifyCharacterVoice = async (character: Character, voiceName: string): Promise<{ isSuitable: boolean; suggestion: string; reason: string }> => {
    const ai = getAI();
    const VOICE_DESCRIPTIONS = `
        - Puck: Energetic, youthful, mischievous, higher pitch (Male). Good for protagonists, kids, or tricksters.
        - Charon: Deep, gravelly, authoritative, low pitch (Male). Good for villains, mentors, or tough guys.
        - Kore: Soft, soothing, calm, feminine (Female). Good for nurturing characters, mystics, or gentle leads.
        - Fenrir: Intense, aggressive, rough, growly (Male). Good for warriors, monsters, or angry characters.
        - Zephyr: Balanced, neutral, clear, breezy (Female/Androgynous). Good for narrators, professionals, or smart characters.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: PROMPTS.voiceConsistency(character.name, character.role, character.personality || character.description, voiceName, VOICE_DESCRIPTIONS),
        config: { responseMimeType: "application/json" }
    });

    return cleanAndParseJSON(response.text!);
};
