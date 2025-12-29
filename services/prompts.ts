
export const PROMPTS = {
    // 1. Analyze Manuscript with Cultural Extraction
    analyzeManuscript: (scriptContent: string, language: string) => `
        Act as a professional Literary Editor. Analyze this manuscript.
        
        CRITICAL OUTPUT RULES:
        1. Output JSON ONLY.
        2. All string values MUST be in ${language}.
        
        Extract:
        - suggestedTitle: string
        - targetAudience: string
        - visualStyle: string (e.g. Manga, Webtoon, Noir)
        - narrativeStructure: string (Logline)
        - estimatedChapters: string
        - worldSetting: string (BE SPECIFIC about country, era, culture. e.g. "Hanoi, Vietnam, 2024", "Fantasy world inspired by Ly Dynasty Vietnam")
        - culturalContext: string (Notes on specific cultural norms to respect)
        - chapterOutlines: array of objects { chapterNumber, summary }
        - colorPalette: array of strings
        - keyThemes: array of strings

        Manuscript: "${scriptContent.substring(0, 15000)}..."
    `,

    // 2. Research Chat - Cultural Awareness
    researchChatSystem: (theme: string, format: string | null, language: string) => `
        You are the Editor-in-Chief.
        Context: Theme="${theme}", Format="${format}".
        
        STRICT LANGUAGE REQUIREMENT: You MUST speak in ${language}.
        
        Goal: Discuss the story direction. 
        Important: If the user suggests a specific culture (e.g. Vietnam), you must adapt all your advice to fit that culture's market and tropes. 
        Do not default to Western comic tropes unless requested.
    `,

    extractStrategy: (chatLog: string, language: string) => `
        Based on this chat, compile the Project Strategy.
        OUTPUT LANGUAGE: ${language}.
        
        Required JSON fields: 
        - suggestedTitle
        - targetAudience
        - visualStyle
        - narrativeStructure
        - estimatedChapters
        - worldSetting (Extract the specific location/culture discussed)
        - culturalContext (Any specific cultural notes mentioned)
        
        Chat Log: ${chatLog}
    `,

    // 3. Style Research (NEW)
    researchArtStyle: (style: string, culturalSetting: string, language: string) => `
        Act as an Art Director. Research and define the Visual Style Guide.
        
        Selected Style: "${style}"
        Cultural Setting: "${culturalSetting}"
        
        Task: Create a detailed description of how to draw this comic/animation to ensure it looks authentic to the style AND the culture.
        
        Specific Instructions:
        - If Style is "Manga", describe inking, screen tones (if B&W), or vibrant coloring (if Color), and dynamic paneling typical of Manga.
        - If Style is "2D Animation" or "Anime", describe cel-shading, line weight, and compositing to look like a frame from a show.
        - If Style is "3D Animation", describe lighting (e.g. subsurface scattering), texture quality, and rendering style (Pixar-esque vs Realistic).
        - If Cultural Setting is "Vietnam", describe Vietnamese facial features, common architectural details, and fashion nuances to avoid looking "Western" or "Generic Asian".
        
        Output a plain text paragraph (in ${language}) that can be used as a system instruction for an artist AI.
    `,

    // 4. Character Design - Uses Style Guide
    characterDesign: (name: string, styleGuide: string, description: string, worldSetting: string) => `
        Create an image generation prompt for a character named "${name}".
        
        INPUTS:
        - Style Guide: "${styleGuide}"
        - World Setting: "${worldSetting}"
        - Character Description: "${description}"
        
        INSTRUCTIONS:
        Write a high-quality, descriptive prompt for an image generator.
        1. STRICTLY follow the 'Style Guide'. 
        2. Ensure the character's ethnicity and fashion matches the 'World Setting' and 'Name' (e.g. Vietnamese name -> Vietnamese features).
        3. Do NOT use Western comic tropes (like Superman muscles) unless specified.
        4. Focus on facial features, skin tone, hair texture, and culturally accurate clothing.
    `,

    characterImagePrompt: (name: string, description: string, styleGuide: string) => `
        Generate a character design for: ${name}.
        Visual Description: ${description}
        Art Style: ${styleGuide}
        Full body character design sheet, white background, high quality.
    `,

    // 5. Panel Art - Uses Style Guide & Setting
    panelImagePrompt: (styleGuide: string, description: string, charDesc: string, worldSetting: string) => `
        Create a comic panel image prompt.
        
        - Visual Style: ${styleGuide}
        - Environment/Location: ${worldSetting} (Ensure architecture, streets, and props match this location accurately).
        - Action: ${description}
        - Characters: ${charDesc}
        
        Avoid generic Western backgrounds if the setting is specific (e.g. Vietnam). Use specific architectural details (e.g. motorbikes, narrow tube houses for Vietnam).
    `,

    // 6. Scripting
    scriptGeneration: (
        chapterNumber: number,
        format: string | null,
        style: string,
        language: string,
        panelCount: number,
        concept: string,
        characters: string,
        summary: string,
        worldSetting: string
    ) => `
        Write a comic script for Chapter ${chapterNumber}.
        Format: ${format}. Style: ${style}.
        Target Length: ${panelCount} panels.
        World Setting: ${worldSetting}.
        
        OUTPUT LANGUAGE: ${language}.
        
        Story Concept: ${concept}
        Characters: ${characters}
        Summary: ${summary}
        
        Output JSON: { "title": "...", "panels": [ { "description": "...", "dialogue": "...", "caption": "...", "charactersInvolved": [] } ] }
    `,

    // Helpers
    storyConcept: (theme: string, style: string, language: string) => `Generate unique story concept. Theme: ${theme}. Style: ${style}. Output JSON in ${language}: { premise, similarStories, uniqueTwist, genreTrends }`,
    
    complexCharacters: (premise: string, language: string, setting: string) => `Create character cast for: ${premise}. Setting: ${setting}. Output JSON in ${language}: [ { name, role, personality, description } ]. Names must fit the setting.`,
    
    seriesBible: (theme: string, style: string, language: string) => `Write Series Bible. Theme: ${theme}. Output JSON in ${language}: { worldSetting, mainConflict, characterArcs }`,

    continuityCheck: (panelsText: string, characters: string, worldSetting: string) => `Check script for logic/plot holes. Setting: ${worldSetting}. Characters: ${characters}. Script: ${panelsText}. Return plain text report.`,

    censor: (type: string, text: string) => `Check for hate/violence/sexual content. Content: ${text}. Return JSON: { passed: boolean, report: string }`,

    translatePanels: (panelsJson: string, languages: string[]) => `Translate 'dialogue' and 'caption' to ${languages.join(', ')}. Input: ${panelsJson}. Return JSON with 'translations' object added to each panel.`,
    
    voiceConsistency: (name: string, role: string, desc: string, voice: string, list: string) => `Check if voice '${voice}' fits character '${name}' (${role}, ${desc}). List: ${list}. JSON: { isSuitable, suggestion, reason }`,
    
    analyzeConsistency: (charName: string, style: string) => `Analyze image for style consistency with '${style}'. Character: ${charName}. JSON: { isConsistent, critique }`,
    
    summarizeChapter: (text: string) => `Summarize in 3 sentences: ${text}`
};
