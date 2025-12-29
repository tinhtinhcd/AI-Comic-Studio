
import { StoryFormat } from "../types";

export const PROMPTS = {
    analyzeManuscript: (scriptContent: string, language: string) => `
        Analyze this manuscript. Extract: Title, Target Audience, Visual Style (e.g. Manga, Noir), Narrative Structure (Logline), Estimated Chapters (if series), World Setting, Color Palette (list), Key Themes (list). 
        
        CRITICAL: The output JSON values MUST be in ${language}.
        Manuscript Start: ${scriptContent.substring(0, 10000)}...
    `,

    researchChatSystem: (theme: string, format: string | null, language: string) => `
        You are the Editor-in-Chief and Strategy Team for a comic studio. 
        Context: Theme="${theme}", Format="${format}".
        
        IMPORTANT: You MUST converse in ${language}. Do not use English unless the user asks for it.
        
        Participate in a brainstorming session. You can speak as different experts by tagging your response like [[MARKET_RESEARCHER]] or [[CONTINUITY_EDITOR]].
        Default to [[MARKET_RESEARCHER]] if unspecified.
        Keep responses concise and professional.
    `,

    extractStrategy: (chatLog: string, language: string) => `
        Based on this chat history, compile the final Project Strategy. 
        Output JSON MUST be in ${language}.
        
        Chat Log:
        ${chatLog}
    `,

    storyConcept: (theme: string, style: string, language: string) => `
        Generate a unique story concept for a "${style}" comic. Theme: "${theme}". 
        
        OUTPUT LANGUAGE: ${language}.
        
        Return JSON with: premise, similarStories (array), uniqueTwist, genreTrends.
    `,

    complexCharacters: (premise: string, language: string) => `
        Create a cast of characters for this story: "${premise}".
        
        OUTPUT LANGUAGE: ${language}.
        
        Return JSON Array. Each object: name, role (MAIN, SUPPORTING, ANTAGONIST), personality, and description (visuals).
    `,

    seriesBible: (theme: string, style: string, language: string) => `
        Write a Series Bible for a "${style}" comic. Theme: "${theme}".
        
        OUTPUT LANGUAGE: ${language}.
        
        Return JSON: worldSetting, mainConflict, characterArcs.
    `,

    scriptGeneration: (
        chapterNumber: number,
        format: string | null,
        style: string,
        language: string,
        panelCount: number,
        concept: string,
        characters: string,
        summary: string,
        originalScript: string
    ) => `
        Write a comic script for Chapter ${chapterNumber}.
        Format: ${format}. Style: ${style}.
        Target Length: ${panelCount} panels.
        
        OUTPUT LANGUAGE: ${language}.
        
        Concept: ${concept}
        Characters: ${characters}
        Chapter Summary: ${summary}
        
        ${originalScript ? `Adapt this original text: "${originalScript.substring(0, 5000)}..."` : ''}
        
        STRICT JSON OUTPUT FORMAT:
        {
            "title": "Chapter Title",
            "panels": [
                {
                    "description": "Visual description of the scene",
                    "dialogue": "Character Name: What they say",
                    "caption": "Narrator text or sound effect (SFX)",
                    "charactersInvolved": ["Character Name 1"]
                }
            ]
        }
    `,

    censor: (type: string, text: string) => `
        Check this ${type} content for safety issues (hate speech, explicit violence, sexual content). Content: "${text.substring(0, 1000)}".
        Return JSON: { passed: boolean, report: string }
    `,

    characterDesign: (name: string, style: string, theme: string, description: string) => `
        Refine the visual description for character "${name}".
        CRITICAL: The art style MUST be "${style}". 
        Theme: "${theme}". 
        Original Description: "${description}". 
        
        Output a concise, high-quality image generation prompt that explicitly mentions the "${style}" style, character features, clothing, signature accessories, and a hint of their personality in the expression. 
        Do not include negative prompts.
    `,

    characterImagePrompt: (name: string, refinedDesc: string, style: string) => `
        Character Reference Sheet for ${name}. Style: ${style}.
        Visual Description: ${refinedDesc}.
        
        Requirements:
        - Include a Full-body standing pose (Neutral/Confident).
        - Include a Dynamic Action pose or expressive gesture relevant to their role.
        - Include a Close-up Portrait showing facial details and emotion.
        
        White background, high quality concept art, clean lines. Ensure character consistency (clothing, hair, face) across all poses.
    `,

    panelImagePrompt: (style: string, description: string, charDesc: string) => `
        Create a comic panel in the style of "${style}". 
        Scene Description: ${description}. 
        Characters involved (ensure visual consistency): ${charDesc}. 
        High resolution, detailed background, dynamic composition.
    `,

    summarizeChapter: (text: string) => `Summarize this comic chapter in 3 sentences: ${text}`,

    voiceConsistency: (
        charName: string, 
        charRole: string | undefined, 
        charDesc: string, 
        voiceName: string, 
        voiceList: string
    ) => `
        Act as a Voice Casting Director.
        Character: "${charName}"
        Role: ${charRole}
        Personality/Description: "${charDesc}"
        
        Selected Voice: "${voiceName}"
        
        Available Voices:
        ${voiceList}
        
        Is the selected voice a good fit for this character?
        If not, suggest the best alternative from the list.
        
        Output JSON: { "isSuitable": boolean, "suggestion": string, "reason": string }
    `,
    
    analyzeConsistency: (charName: string, style: string) => `
        Analyze this uploaded image for character: "${charName}". Target Project Style: "${style}". Is this image consistent? Return JSON: { isConsistent, critique }.
    `,

    translatePanels: (panelsJson: string, languages: string[]) => `
        You are a professional comic translator.
        Translate the 'dialogue' and 'caption' fields in the following JSON to these languages: ${languages.join(", ")}.
        
        Input Panels JSON:
        ${panelsJson}
        
        Return the exact same JSON structure, but insert a 'translations' object into each panel. 
        Example Output Structure per panel:
        {
           "id": "...",
           ...,
           "translations": {
               "Vietnamese": { "dialogue": "...", "caption": "..." },
               "Japanese": { "dialogue": "...", "caption": "..." }
           }
        }
        
        Ensure the translation matches the tone of a comic book.
    `
};
