import { ComicProject } from '../types';

const STORAGE_KEY = 'ai_comic_studio_library';

export const saveProjectToLibrary = (project: ComicProject): void => {
    // 1. Create a deep copy to modify
    const projectToSave = JSON.parse(JSON.stringify(project));

    // 2. Add metadata
    projectToSave.id = projectToSave.id || crypto.randomUUID();
    projectToSave.lastModified = Date.now();

    // 3. STRIP MEDIA (Images, Videos, Audio) to save space
    projectToSave.coverImage = undefined;
    
    projectToSave.characters = projectToSave.characters.map((c: any) => ({
        ...c,
        imageUrl: undefined, // Remove generated image
        isGenerating: false
    }));

    projectToSave.panels = projectToSave.panels.map((p: any) => ({
        ...p,
        imageUrl: undefined,
        videoUrl: undefined,
        audioUrl: undefined,
        captionAudioUrl: undefined,
        isGenerating: false
    }));

    // 4. Save to LocalStorage
    const libraryJSON = localStorage.getItem(STORAGE_KEY);
    let library: ComicProject[] = libraryJSON ? JSON.parse(libraryJSON) : [];
    
    // Check if exists, update or push
    const existingIndex = library.findIndex(p => p.id === projectToSave.id);
    if (existingIndex >= 0) {
        library[existingIndex] = projectToSave;
    } else {
        library.push(projectToSave);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
};

export const getLibrary = (): ComicProject[] => {
    const libraryJSON = localStorage.getItem(STORAGE_KEY);
    return libraryJSON ? JSON.parse(libraryJSON) : [];
};

export const deleteProjectFromLibrary = (id: string): void => {
    const libraryJSON = localStorage.getItem(STORAGE_KEY);
    if (!libraryJSON) return;

    let library: ComicProject[] = JSON.parse(libraryJSON);
    library = library.filter(p => p.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
};

export const loadProjectFromLibrary = (id: string): ComicProject | null => {
    const library = getLibrary();
    const project = library.find(p => p.id === id);
    if (!project) return null;
    return project;
};
