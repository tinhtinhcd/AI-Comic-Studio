
import { GoogleGenAI, Type, Schema, Modality, Tool } from "@google/genai";
import { ComicPanel, Character, ResearchData, StoryFormat, StoryConcept, Message } from "../types";

// ... [Keep existing Audio helper functions decodeAudioData, bufferToWave] ...
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
    if (candidates.length === 0) {
         throw new Error("Image generation failed: Safety block triggered (No candidates).");
    }
    for (const candidate of candidates) {
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        const text = parts.map((p:any) => p.text).join(' ');
        if (text) {
             throw new Error(`AI Refusal: ${text.substring(0, 150)}...`);
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

const getEnhancedStylePrompt = (style: string) => {
    let medium = "Digital Art";
    let boosters = "";
    
    if (style.includes("Photorealistic") || style.includes("Lifelike")) {
        medium = "4K Photograph";
        boosters = "cinematic lighting, ultra-realistic, 8k, raw photo, depth of field, raytracing, highly detailed texture";
    } else if (style.includes("Manga") || style.includes("Japanese")) {
        medium = "Japanese Manga Page";
        boosters = "black and white, screentones, sharp lines, g-pen ink, high contrast, anime aesthetic, detailed background";
    } else if (style.includes("Noir")) {
        medium = "Film Noir Graphic Novel";
        boosters = "chiaroscuro, high contrast, heavy shadows, black and white, dramatic lighting, moody, silhouette";
    } else if (style.includes("Cyberpunk")) {
        medium = "Cyberpunk Digital Illustration";
        boosters = "neon lights, futuristic, chromatic aberration, vibrant cyan and magenta, detailed mechanical parts, night city";
    } else if (style.includes("Watercolor")) {
        medium = "Watercolor Painting on Paper";
        boosters = "wet-on-wet, soft edges, pastel colors, artistic, flowing strokes, textured paper, dreamy";
    } else if (style.includes("Wuxia") || style.includes("Kiếm Hiệp")) {
        medium = "Traditional Chinese Ink Wash Painting (Shui-mo)";
        boosters = "martial arts, ancient china, flowing robes, mist, calligraphy brush strokes, atmospheric, mountains, desaturated colors";
    } else if (style.includes("Xianxia") || style.includes("Tiên Hiệp")) {
        medium = "Ethereal Celestial Fantasy Art";
        boosters = "glowing magic, floating islands, pastel colors, gold accents, divine elegance, chinese fantasy, dreamlike, soft lighting, majestic";
    } else if (style.includes("Horror") || style.includes("Kinh Dị")) {
        medium = "Horror Manga (Junji Ito style)";
        boosters = "disturbing details, heavy ink lines, scratching texture, eerie atmosphere, psychological horror, high contrast, grotesque";
    } else if (style.includes("Romance") || style.includes("Manhwa") || style.includes("Tình Cảm")) {
        medium = "Korean Romance Webtoon";
        boosters = "soft focus, blooming flowers, sparkling eyes, beautiful characters, vibrant warm colors, romantic atmosphere, shoujo style, clean lines";
    } else {
        medium = "Modern Comic Book Art";
        boosters = "sharp focus, vibrant colors, clean lines, dynamic composition, detailed";
    }
    return `Medium: ${medium}, Style: ${boosters}`;
};

// --- NEW: STRATEGIC CHAT (REPLACES OLD ONE-SHOT RESEARCH) ---

export const sendResearchChatMessage = async (
    history: Message[], 
    newMessage: string,
    tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'
): Promise<string> => {
    const ai = getAI();
    
    const systemInstruction = `
        You are the "Strategic Planner" agent for a Comic Studio.
        Your goal is to help the Director (User) define the foundation of a new comic project.
        
        Capabilities:
        1. Discuss themes, target audience, and market trends.
        2. Help decide on length (Chapter count, Seasons).
        3. Define the World Setting and Visual Style.
        
        Tone: Professional, Insightful, Collaborative.
        
        Keep responses concise (max 150 words) unless asked for details. 
        Encourage the user to define constraints like "How many chapters?" or "What is the specific setting?".
    `;

    // Convert internal message format to Gemini format
    const contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));
    
    // Add new message
    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: contents,
        config: { systemInstruction }
    });

    return response.text || "I'm listening...";
};

export const extractStrategyFromChat = async (
    history: Message[],
    language: string,
    tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'
): Promise<ResearchData> => {
    const ai = getAI();
    
    // Compile history into a transcript
    const transcript = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
    
    const prompt = `
        Analyze the following negotiation between a Director and a Planner.
        Extract the final agreed-upon strategy for the comic.
        Language: ${language}.
        
        Transcript:
        ${transcript}
        
        Output JSON matching the ResearchData structure.
        If specific details (like estimatedChapters) weren't discussed, infer reasonable defaults based on the theme.
    `;
    
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            suggestedTitle: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            visualStyle: { type: Type.STRING },
            narrativeStructure: { type: Type.STRING },
            estimatedChapters: { type: Type.STRING, description: "e.g. '12 Chapters' or '3 Seasons'" },
            worldSetting: { type: Type.STRING, description: "Time and Place context" },
            colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["suggestedTitle", "targetAudience", "visualStyle", "narrativeStructure", "estimatedChapters", "worldSetting", "colorPalette", "keyThemes"]
    };

    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    
    return JSON.parse(response.text!);
};

// --- LEGACY RESEARCH (Kept for fallback/automated mode) ---
export const conductMarketResearch = async (theme: string, language: string = 'English', tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'): Promise<ResearchData> => {
    // This is now a wrapper that simulates a quick chat or uses direct generation
    // We will keep it for the "Auto-Generate" button if the user doesn't want to chat.
    const ai = getAI();
    const prompt = `
        Act as a Creative Director. Analyze theme: "${theme}".
        Output strategic plan in ${language}.
    `;
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            suggestedTitle: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            visualStyle: { type: Type.STRING },
            narrativeStructure: { type: Type.STRING },
            estimatedChapters: { type: Type.STRING },
            worldSetting: { type: Type.STRING },
            colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["suggestedTitle", "targetAudience", "visualStyle", "narrativeStructure", "estimatedChapters", "worldSetting", "colorPalette", "keyThemes"]
    };
    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!);
};

// --- DEEP SCRIPTING & CONCEPTING ---

export const generateStoryConceptsWithSearch = async (
    theme: string, 
    style: string, 
    language: string,
    tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'
): Promise<StoryConcept> => {
    const ai = getAI();
    const tools: Tool[] = tier === 'PREMIUM' ? [{ googleSearch: {} }] : [];
    const prompt = `
        Act as a Story Consultant. Theme: "${theme}". Style: "${style}". Language: ${language}.
        Task: Search for popular stories/myths related to this. Identify trends. Create a UNIQUE Twist.
        Output JSON: premise, similarStories, uniqueTwist, genreTrends.
    `;
    const model = tier === 'PREMIUM' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

    if (tier === 'PREMIUM') {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { tools: tools }
        });
        const text = response.text!;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            return {
                premise: text.substring(0, 200),
                similarStories: ["Analysis based on search"],
                uniqueTwist: "Custom twist",
                genreTrends: "General trends"
            };
        }
    } else {
         const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                premise: { type: Type.STRING },
                similarStories: { type: Type.ARRAY, items: { type: Type.STRING } },
                uniqueTwist: { type: Type.STRING },
                genreTrends: { type: Type.STRING }
            },
            required: ["premise", "similarStories", "uniqueTwist", "genreTrends"]
        };
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema }
        });
        return JSON.parse(response.text!);
    }
};

export const generateComplexCharacters = async (
    concept: StoryConcept,
    language: string,
    tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'
): Promise<Character[]> => {
    const ai = getAI();
    const prompt = `
        Act as a Lead Character Designer.
        Based on this Concept: "${concept.premise}" and Twist: "${concept.uniqueTwist}".
        Language: ${language}.
        Create a cast of 3-5 distinct characters with CONFLICTING goals.
        Output JSON: 'name', 'description' (Visuals), 'personality' (Psychology), 'role'.
    `;
    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                personality: { type: Type.STRING },
                role: { type: Type.STRING, enum: ['MAIN', 'SUPPORTING', 'ANTAGONIST'] }
            },
            required: ["name", "description", "personality", "role"]
        }
    };
    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    const rawChars = JSON.parse(response.text!);
    return rawChars.map((c: any) => ({
        id: crypto.randomUUID(),
        name: c.name,
        description: c.description,
        personality: c.personality,
        role: c.role,
        voice: 'Puck',
        isLocked: false,
        consistencyStatus: 'PENDING'
    }));
};

export const generateSeriesBible = async (theme: string, style: string, language: string, tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'): Promise<{ worldSetting: string, mainConflict: string, characterArcs: string }> => {
    const ai = getAI();
    const prompt = `
        Create a "Series Bible". Theme: "${theme}". Style: "${style}". Language: ${language}.
        Define: 'worldSetting', 'mainConflict', 'characterArcs'.
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

export const censorContent = async (content: string, type: 'SCRIPT' | 'IMAGE'): Promise<{passed: boolean, report: string}> => {
    const ai = getAI();
    const prompt = `Safety Check ${type}: "${content}". Return JSON: { "passed": boolean, "report": string }`;
    const schema: Schema = {
        type: Type.OBJECT,
        properties: { passed: { type: Type.BOOLEAN }, report: { type: Type.STRING } },
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
    tier: 'STANDARD' | 'PREMIUM' = 'STANDARD',
    concept?: StoryConcept,
    predefinedCharacters?: Character[]
): Promise<{ title: string; panels: ComicPanel[] }> => {
  const ai = getAI();
  
  let structurePrompt = "";
  let panelCountInstructions = "";
  let contextPrompt = "";

  if (bible) contextPrompt += `\nSERIES CONTEXT: World: ${bible.worldSetting}. Conflict: ${bible.mainConflict}`;
  if (concept) {
      contextPrompt += `\nSTORY PREMISE: ${concept.premise}. TWIST: ${concept.uniqueTwist}.`;
  }
  if (predefinedCharacters && predefinedCharacters.length > 0) {
      const charList = predefinedCharacters.map(c => `- ${c.name} (${c.role}): ${c.personality}`).join("\n");
      contextPrompt += `\nCAST OF CHARACTERS:\n${charList}\nUse THESE characters. Ensure their distinct personalities shine through dialogue.`;
  }

  if (format === 'SHORT_STORY') {
      structurePrompt = `Target Runtime: 5-10 mins. Complete narrative.`;
      panelCountInstructions = "Generate 8-12 KEYFRAMES.";
  } else if (format === 'LONG_SERIES') {
      structurePrompt = `Target Runtime: ~30 mins. CHAPTER 1.`;
      panelCountInstructions = "Generate 12-16 KEYFRAMES.";
  } else if (format === 'EPISODIC') {
      structurePrompt = `Target Runtime: 15-30 mins. Sitcom/Episode.`;
      panelCountInstructions = "Generate 10-14 KEYFRAMES.";
  }

  const prompt = `
    Act as a Lead Screenwriter coordinating with a team.
    Theme: "${theme}". Style: "${style}". Format: "${format}".
    ${contextPrompt}
    ${structurePrompt}
    Language: ${language}.
    ${panelCountInstructions}
    IMPORTANT: Focus on SUBTEXT and SHOW DON'T TELL. Dialogue should be natural.
    Output JSON: 'title', 'panels' [description, dialogue, caption, charactersInvolved].
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
  const panelsWithIds = data.panels.map((p: any) => ({ ...p, id: crypto.randomUUID(), shouldAnimate: false })); 
  return { title: data.title, panels: panelsWithIds };
};

// ... [Keep existing Character/Image Generation Functions] ...
export const generateCharacterDesign = async (
    characterName: string, 
    projectTheme: string,
    projectStyle: string, 
    language: string = 'English', 
    isLongFormat: boolean = false,
    tier: 'STANDARD' | 'PREMIUM' = 'STANDARD',
    existingDescription?: string
): Promise<{ description: string; imageUrl: string }> => {
  const ai = getAI();
  const model = getImageModel(tier);
  const config = tier === 'PREMIUM' ? { imageConfig: { imageSize: "1K" } } : undefined;
  
  let description = existingDescription;
  
  if (!description) {
      const textResponse = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: `Describe appearance of "${characterName}" for a story about "${projectTheme}". Style: ${projectStyle}. Concise. Focus on distinctive features. Write in ${language}.`
      });
      description = textResponse.text || `A cool ${characterName}`;
  }

  const stylePrompt = getEnhancedStylePrompt(projectStyle);
  let imagePrompt = "";
  if (isLongFormat) {
      imagePrompt = `
          ${stylePrompt}
          Subject: Character Reference Sheet for ${characterName}. ${description}.
          Layout: Three views (Front view, Side view, 3/4 view) arranged horizontally.
          Background: Plain white.
          Quality: High detailed, clean lines.
      `;
  } else {
      imagePrompt = `
          ${stylePrompt}
          Subject: Character design for ${characterName}, ${description}. 
          Background: Plain white or simple solid color. 
          Shot: Full body.
      `;
  }

  try {
      const imageResponse = await ai.models.generateContent({ model, contents: imagePrompt, config });
      const imageUrl = extractImageFromResponse(imageResponse);
      return { description, imageUrl };
  } catch (error) {
      console.warn("Primary image gen failed, retrying...", error);
      try {
          const simplePrompt = `Character design of ${characterName}, ${description}. ${stylePrompt}. White background.`;
          const retryResponse = await ai.models.generateContent({ model, contents: simplePrompt, config });
          const imageUrl = extractImageFromResponse(retryResponse);
          return { description, imageUrl };
      } catch (retryError: any) {
          throw new Error(`Failed to generate character: ${retryError.message}`);
      }
  }
};

export const analyzeCharacterConsistency = async (imageBase64: string, targetStyle: string, characterName: string, tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'): Promise<{ isConsistent: boolean, critique: string }> => {
    const ai = getAI();
    const prompt = `
        Act as an Art Director. 
        Analyze this uploaded image for character: "${characterName}".
        Target Project Style: "${targetStyle}".
        Is this image consistent with the Target Style?
        If yes, return isConsistent: true.
        If no, return isConsistent: false and a critique.
        Return JSON.
    `;
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
    const schema: Schema = {
        type: Type.OBJECT,
        properties: { isConsistent: { type: Type.BOOLEAN }, critique: { type: Type.STRING } },
        required: ["isConsistent", "critique"]
    };
    const response = await ai.models.generateContent({
        model: getTextModel(tier),
        contents: { parts: [{ inlineData: { mimeType: 'image/png', data: cleanBase64 } }, { text: prompt }] },
        config: { responseMimeType: "application/json", responseSchema: schema } 
    });
    
    let text = response.text!;
    if (text.startsWith("```json")) { text = text.replace(/^```json\n/, "").replace(/\n```$/, ""); }
    try { return JSON.parse(text); } catch (e) { return { isConsistent: true, critique: "Analysis inconclusive." }; }
};

export const generatePanelImage = async (panel: ComicPanel, style: string, characters: Character[], tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'): Promise<string> => {
  const ai = getAI();
  const model = getImageModel(tier);
  const config = tier === 'PREMIUM' ? { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } } : { imageConfig: { aspectRatio: "16:9" } }; 
  const stylePrompt = getEnhancedStylePrompt(style);
  
  const charDescriptions = characters
    .filter(c => panel.charactersInvolved.some(name => c.name.toLowerCase().includes(name.toLowerCase())))
    .map(c => `${c.name} (Visuals: ${c.description})`).join(". ");

  const prompt = `
    ${stylePrompt}
    Scene Action: ${panel.description}.
    Mood: "${panel.dialogue || panel.caption || 'Cinematic'}".
    Characters: ${charDescriptions}.
    Instructions: Render strictly in the defined Medium/Style. Use provided Reference Images.
  `;
  
  const parts: any[] = [{ text: prompt }];
  characters.forEach(char => {
      const isInvolved = panel.charactersInvolved.some(name => char.name.toLowerCase().includes(name.toLowerCase()));
      if (isInvolved && char.imageUrl) {
          const base64 = char.imageUrl.split(',')[1];
          parts.push({ inlineData: { mimeType: 'image/png', data: base64 } });
      }
  });

  try {
      const response = await ai.models.generateContent({ model, contents: { parts }, config });
      return extractImageFromResponse(response);
  } catch (error) {
       console.warn("Panel generation failed, retrying...", error);
       const simplePrompt = `${stylePrompt}. Scene: ${panel.description}. Characters: ${charDescriptions}. Cinematic.`;
       const simpleParts: any[] = [{ text: simplePrompt }];
        characters.forEach(char => {
            const isInvolved = panel.charactersInvolved.some(name => char.name.toLowerCase().includes(name.toLowerCase()));
            if (isInvolved && char.imageUrl) {
                const base64 = char.imageUrl.split(',')[1];
                simpleParts.push({ inlineData: { mimeType: 'image/png', data: base64 } });
            }
        });
       try {
           const retryResponse = await ai.models.generateContent({ model, contents: { parts: simpleParts }, config });
           return extractImageFromResponse(retryResponse);
       } catch (retryError: any) {
           throw new Error(`Failed to draw panel: ${retryError.message}`);
       }
  }
};

export const generateCoverImage = async (title: string, theme: string, style: string, tier: 'STANDARD' | 'PREMIUM' = 'STANDARD'): Promise<string> => {
  const ai = getAI();
  const model = getImageModel(tier);
  const config = tier === 'PREMIUM' ? { imageConfig: { aspectRatio: "3:4", imageSize: "1K" } } : { imageConfig: { aspectRatio: "3:4" } };
  const stylePrompt = getEnhancedStylePrompt(style);
  const response = await ai.models.generateContent({
    model: model,
    contents: `${stylePrompt} Type: Movie Poster. Title Context: "${title}". Theme: ${theme}. Composition: Vertical, dramatic.`,
    config: config
  });
  return extractImageFromResponse(response);
};

export const translateScript = async (currentScript: {title: string, panels: ComicPanel[]}, targetLanguage: string): Promise<{title: string, panels: ComicPanel[]}> => {
    const ai = getAI();
    const prompt = `Translate script to ${targetLanguage}. Keep IDs. Translate 'dialogue', 'description', 'caption', 'title'. Input: ${JSON.stringify(currentScript)}`;
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
    const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
    return JSON.parse(response.text!);
};

export const generateVoiceover = async (text: string, voiceName: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } } }
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
            image: { imageBytes: base64Data, mimeType: 'image/png' },
            prompt: `Cinematic camera movement, ${prompt}, high quality, 4k`,
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
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
        if (e.message && (e.message.includes('403') || e.message.includes('400') || e.message.includes('billing'))) {
             throw new Error("Veo requires a Paid Google Cloud Project. Please verify your billing settings.");
        }
        throw e;
    }
};
