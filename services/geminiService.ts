import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { ComicPanel, Character, ResearchData, StoryFormat } from "../types";

// Helper for TTS audio decoding
async function decodeAudioData(
    base64Data: string,
    sampleRate: number = 24000
  ): Promise<AudioBuffer> {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate});
    
    // Convert PCM to AudioBuffer
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length;
    const buffer = outputAudioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    
    return buffer;
}

function bufferToWave(abuffer: AudioBuffer, len: number) {
    let numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample,
        offset = 0,
        pos = 0;

    setUint32(0x46464952);                         
    setUint32(length - 8);                         
    setUint32(0x45564157);                         

    setUint32(0x20746d66);                         
    setUint32(16);                                 
    setUint16(1);                                  
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); 
    setUint16(numOfChan * 2);                      
    setUint16(16);                                 

    setUint32(0x61746164);                         
    setUint32(length - pos - 4);                   

    for(i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));

    while(pos < length) {
        for(i = 0; i < numOfChan; i++) {             
            sample = Math.max(-1, Math.min(1, channels[i][offset])); 
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; 
            view.setInt16(pos, sample, true);          
            pos += 2;
        }
        offset++                                     
    }

    return new Blob([buffer], {type: "audio/wav"});

    function setUint16(data: any) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data: any) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}

const getAI = (apiKeyOverride?: string) => {
  const apiKey = apiKeyOverride || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

const extractImageFromResponse = (response: any): string => {
    const candidates = response.candidates || [];
    for (const candidate of candidates) {
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("No image data found in AI response. The model might have refused the request.");
};

// MODEL SELECTORS
const getTextModel = (tier: 'STANDARD' | 'PREMIUM' = 'STANDARD') => {
    return tier === 'PREMIUM' ? "gemini-3-pro-preview" : "gemini-3-flash-preview";
};

const getImageModel = (tier: 'STANDARD' | 'PREMIUM' = 'STANDARD') => {
    return tier === 'PREMIUM' ? "gemini-3-pro-image-preview" : "gemini-2.5-flash-image";
};

// HELPER: Enhance Prompt for Styles
const getEnhancedStylePrompt = (style: string) => {
    // Add specific visual boosters based on the selected style
    let boosters = "";
    
    if (style.includes("Photorealistic") || style.includes("Lifelike")) {
        boosters = "cinematic lighting, highly detailed, 8k resolution, photography style, realistic textures, raw photo quality, depth of field, raytracing";
    } else if (style.includes("Manga") || style.includes("Japanese")) {
        boosters = "anime style, japanese manga, cel shaded, highly detailed lines, screentone, monochrome or vibrant colors";
    } else if (style.includes("Noir")) {
        boosters = "high contrast, chiaroscuro, film noir, black and white, dramatic shadows, moody";
    } else if (style.includes("Cyberpunk")) {
        boosters = "neon lights, futuristic, high tech low life, vibrant cyan and magenta, detailed mechanical parts";
    } else if (style.includes("Watercolor")) {
        boosters = "soft edges, watercolor texture, artistic, flowing colors, paper texture";
    } else if (style.includes("Wuxia") || style.includes("Kiếm Hiệp")) {
        boosters = "Chinese ink wash painting style, ancient martial arts, flowing robes, dramatic wind, misty mountains, traditional asian aesthetic, detailed brushwork";
    } else if (style.includes("Xianxia") || style.includes("Tiên Hiệp")) {
        boosters = "Ethereal, celestial fantasy, glowing effects, pastel and gold colors, floating islands, magical aura, divine elegance, chinese fantasy art";
    } else if (style.includes("Horror") || style.includes("Kinh Dị")) {
        boosters = "Junji Ito style, high contrast black and white ink, disturbing details, dark atmosphere, psychological horror, scratching texture, eerie";
    } else if (style.includes("Romance") || style.includes("Manhwa") || style.includes("Tình Cảm")) {
        boosters = "Korean webtoon style, soft focus, blooming flowers background, sparkling eyes, attractive characters, vibrant and warm colors, romantic atmosphere";
    } else {
        boosters = "high quality, detailed, masterpiece";
    }

    return `Art Style: ${style}. Visual Qualities: ${boosters}`;
};

// --- STRATEGIC & PRE-PRODUCTION ---

export const conductMarketResearch = async (theme: string, language: string = 'English', tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'): Promise<ResearchData> => {
    const ai = getAI();
    const prompt = `
        Act as a Creative Director and Market Researcher.
        Analyze theme: "${theme}".
        
        Output strategic plan in ${language}:
        1. 'suggestedTitle'
        2. 'targetAudience'
        3. 'visualStyle'
        4. 'narrativeStructure'
        5. 'colorPalette': 3-4 main hex codes.
        6. 'keyThemes': 3 keywords.
    `;
    
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            suggestedTitle: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            visualStyle: { type: Type.STRING },
            narrativeStructure: { type: Type.STRING },
            colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["suggestedTitle", "targetAudience", "visualStyle", "narrativeStructure", "colorPalette", "keyThemes"]
    };

    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    
    return JSON.parse(response.text!);
};

export const generateSeriesBible = async (theme: string, style: string, language: string, tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'): Promise<{ worldSetting: string, mainConflict: string, characterArcs: string }> => {
    const ai = getAI();
    const prompt = `
        Create a "Series Bible" for a long-running animated series.
        Theme: "${theme}".
        Style: "${style}".
        Language: ${language}.
        
        Define:
        1. 'worldSetting': The rules, location, and atmosphere of the world.
        2. 'mainConflict': The overarching problem that spans multiple seasons/chapters.
        3. 'characterArcs': Brief summary of how main characters should evolve.
    `;

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            worldSetting: { type: Type.STRING },
            mainConflict: { type: Type.STRING },
            characterArcs: { type: Type.STRING }
        },
        required: ["worldSetting", "mainConflict", "characterArcs"]
    };

    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });

    return JSON.parse(response.text!);
};

// --- SCRIPTING ---

export const censorContent = async (content: string, type: 'SCRIPT' | 'IMAGE'): Promise<{passed: boolean, report: string}> => {
    const ai = getAI();
    const prompt = `
        Act as a Safety Inspector. Analyze ${type} content: "${content}".
        Check for: Hate Speech, Explicit Violence, Sexual Content, Self-Harm.
        Return JSON: { "passed": boolean, "report": "Reason or 'Safe'" }
    `;
    
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            passed: { type: Type.BOOLEAN },
            report: { type: Type.STRING }
        },
        required: ["passed", "report"]
    };

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    
    return JSON.parse(response.text!);
};

export const generateScript = async (
    theme: string, 
    style: string, 
    language: string = 'English', 
    format: StoryFormat = 'SHORT_STORY',
    bible?: { worldSetting: string, mainConflict: string },
    tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'
): Promise<{ title: string; panels: ComicPanel[] }> => {
  const ai = getAI();
  
  let structurePrompt = "";
  let panelCountInstructions = "";
  let contextPrompt = "";

  if (bible) {
      contextPrompt = `
        SERIES CONTEXT (Adhere strictly to this):
        World: ${bible.worldSetting}
        Main Conflict: ${bible.mainConflict}
      `;
  }

  if (format === 'SHORT_STORY') {
      structurePrompt = `Target Runtime: 5-10 mins. Complete narrative (Beginning, Middle, End).`;
      panelCountInstructions = "Generate 8-12 KEYFRAMES.";
  } else if (format === 'LONG_SERIES') {
      structurePrompt = `Target Runtime: ~30 mins. This is CHAPTER 1. Focus on world setup and the 'Call to Action'. End with a cliffhanger.`;
      panelCountInstructions = "Generate 12-16 KEYFRAMES (Storyboards).";
  } else if (format === 'EPISODIC') {
      structurePrompt = `Target Runtime: 15-30 mins. Self-contained episode. Problem introduced and resolved.`;
      panelCountInstructions = "Generate 10-14 KEYFRAMES.";
  }

  const prompt = `
    Act as a Screenwriter.
    Theme: "${theme}". 
    Style: "${style}". 
    Format: "${format}".
    ${contextPrompt}
    ${structurePrompt}
    
    Language: ${language}.
    ${panelCountInstructions}
    
    Output JSON: 'description' (Visuals), 'dialogue' (Speech), 'caption' (Narrator), 'charactersInvolved' (Names).
  `;
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      panels: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            dialogue: { type: Type.STRING },
            caption: { type: Type.STRING },
            charactersInvolved: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["description", "charactersInvolved"]
        }
      }
    },
    required: ["title", "panels"]
  };

  const response = await ai.models.generateContent({
    model: getTextModel(tier),
    contents: prompt,
    config: { 
        responseMimeType: "application/json", 
        responseSchema: schema,
        thinkingConfig: tier === 'PREMIUM' ? { thinkingBudget: 4096 } : undefined
    }
  });

  const data = JSON.parse(response.text!);
  // CHANGED: default 'shouldAnimate' to false. Veo is expensive/paid. User must opt-in.
  const panelsWithIds = data.panels.map((p: any) => ({ ...p, id: crypto.randomUUID(), shouldAnimate: false })); 
  return { title: data.title, panels: panelsWithIds };
};

// --- VISUALIZATION & CONSISTENCY ---

export const generateCharacterDesign = async (
    characterName: string, 
    projectTheme: string,
    projectStyle: string, 
    language: string = 'English', 
    isLongFormat: boolean = false,
    tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'
): Promise<{ description: string; imageUrl: string }> => {
  const ai = getAI();
  
  // 1. Text Description
  const textResponse = await ai.models.generateContent({
    model: getTextModel(tier),
    contents: `Describe appearance of "${characterName}" for a story about "${projectTheme}". Style: ${projectStyle}. Concise. Focus on distinctive features (hair, clothes, colors). Write in ${language}.`
  });
  const description = textResponse.text || `A cool ${characterName}`;

  // 2. Image Generation Strategy
  const stylePrompt = getEnhancedStylePrompt(projectStyle);

  let imagePrompt = "";
  if (isLongFormat) {
      imagePrompt = `
          Character Reference Sheet.
          Character: ${characterName}. ${description}.
          ${stylePrompt}.
          Layout: Three views (Front view, Side view, 3/4 view) arranged horizontally on a white background.
          No text, clean lines.
      `;
  } else {
      imagePrompt = `Character design for ${characterName}, ${description}. White background, full body. ${stylePrompt}`;
  }

  const model = getImageModel(tier);
  const config = tier === 'PREMIUM' ? { imageConfig: { imageSize: "1K" } } : undefined;

  const imageResponse = await ai.models.generateContent({
    model: model,
    contents: imagePrompt,
    config: config
  });
  
  const imageUrl = extractImageFromResponse(imageResponse);
  return { description, imageUrl };
};

export const analyzeCharacterConsistency = async (
    imageBase64: string,
    targetStyle: string,
    characterName: string,
    tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'
): Promise<{ isConsistent: boolean, critique: string }> => {
    const ai = getAI();
    const prompt = `
        Act as an Art Director. 
        Analyze this uploaded image for character: "${characterName}".
        Target Project Style: "${targetStyle}".
        
        Is this image consistent with the Target Style?
        If yes, return isConsistent: true.
        If no (e.g. style is Photo-realistic but target is Anime), return isConsistent: false and a short critique explaining why.
        
        Return JSON.
    `;
    
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            isConsistent: { type: Type.BOOLEAN },
            critique: { type: Type.STRING }
        },
        required: ["isConsistent", "critique"]
    };

    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
                { text: prompt }
            ]
        },
        config: { responseMimeType: "application/json", responseSchema: schema } 
    });
    
    let text = response.text!;
    if (text.startsWith("```json")) {
        text = text.replace(/^```json\n/, "").replace(/\n```$/, "");
    }
    
    try {
        return JSON.parse(text);
    } catch (e) {
        return { isConsistent: true, critique: "Analysis inconclusive, assumed consistent." };
    }
};

export const generatePanelImage = async (panel: ComicPanel, style: string, characters: Character[], tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'): Promise<string> => {
  const ai = getAI();
  
  const parts: any[] = [];
  
  const charDescriptions = characters
    .filter(c => panel.charactersInvolved.some(name => c.name.toLowerCase().includes(name.toLowerCase())))
    .map(c => `${c.name} (Look: ${c.description})`)
    .join(". ");

  const stylePrompt = getEnhancedStylePrompt(style);

  const prompt = `
    Generate a Comic panel / Storyboard frame.
    
    ${stylePrompt}. (RENDER STRICTLY IN THIS STYLE).
    
    Scene Description: ${panel.description}.
    Action/Mood: "${panel.dialogue || panel.caption || ''}".
    
    Characters present: ${charDescriptions}.
    
    INSTRUCTIONS:
    1. Adopt the "Art Style" defined above for the ENTIRE image.
    2. Use the provided Reference Images ONLY for character identity (facial features, clothing, hair).
    3. ADAPT the characters from the reference images to fit the "Art Style" of this scene perfectly.
    4. Composition: Cinematic, dynamic.
  `;
  
  parts.push({ text: prompt });

  characters.forEach(char => {
      const isInvolved = panel.charactersInvolved.some(name => char.name.toLowerCase().includes(name.toLowerCase()));
      if (isInvolved && char.imageUrl) {
          const base64 = char.imageUrl.split(',')[1];
          parts.push({
              inlineData: {
                  mimeType: 'image/png',
                  data: base64
              }
          });
      }
  });

  const model = getImageModel(tier);
  const config = tier === 'PREMIUM' 
      ? { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } } 
      : { imageConfig: { aspectRatio: "16:9" } }; 

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts },
    config: config
  });
  
  return extractImageFromResponse(response);
};

export const generateCoverImage = async (title: string, theme: string, style: string, tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'): Promise<string> => {
  const ai = getAI();
  const model = getImageModel(tier);
  const config = tier === 'PREMIUM' 
    ? { imageConfig: { aspectRatio: "3:4", imageSize: "1K" } } 
    : { imageConfig: { aspectRatio: "3:4" } };
  
  const stylePrompt = getEnhancedStylePrompt(style);

  const response = await ai.models.generateContent({
    model: model,
    contents: `Cinematic movie poster for "${title}". Theme: ${theme}. ${stylePrompt}. Vertical, dramatic, minimal text.`,
    config: config
  });
  
  return extractImageFromResponse(response);
};

// --- POST PRODUCTION ---

export const translateScript = async (currentScript: {title: string, panels: ComicPanel[]}, targetLanguage: string): Promise<{title: string, panels: ComicPanel[]}> => {
    const ai = getAI();
    const prompt = `
        Translate the following comic script to ${targetLanguage}.
        Keep the IDs identical. Only translate 'dialogue', 'description', 'caption' and 'title'.
        
        Input JSON:
        ${JSON.stringify(currentScript)}
    `;

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          panels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                description: { type: Type.STRING },
                dialogue: { type: Type.STRING },
                caption: { type: Type.STRING },
                charactersInvolved: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["id", "description", "charactersInvolved"]
            }
          }
        },
        required: ["title", "panels"]
      };

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });

    const data = JSON.parse(response.text!);
    return data;
};

export const generateVoiceover = async (text: string, voiceName: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } }
            }
        }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");

    const audioBuffer = await decodeAudioData(base64Audio);
    const wavBlob = bufferToWave(audioBuffer, audioBuffer.length);
    return URL.createObjectURL(wavBlob);
};

export const generateVideo = async (imageUrl: string, prompt: string): Promise<string> => {
    const base64Data = imageUrl.split(',')[1]; 
    const ai = getAI(process.env.API_KEY); 

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            image: {
                imageBytes: base64Data,
                mimeType: 'image/png'
            },
            prompt: `Cinematic camera movement, ${prompt}, high quality, 4k`,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) throw new Error("Video generation failed (Unknown Error)");

        const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);
    } catch (e: any) {
        // Handle billing/permission errors gracefully
        if (e.message && (e.message.includes('403') || e.message.includes('400') || e.message.includes('billing'))) {
             throw new Error("Veo requires a Paid Google Cloud Project. Please verify your billing settings.");
        }
        throw e;
    }
};
