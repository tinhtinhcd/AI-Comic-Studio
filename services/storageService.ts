
import { ComicProject } from '../types';
import JSZip from 'jszip';

const LIBRARY_KEY = 'ai_comic_studio_library';
const ACTIVE_PROJECTS_KEY = 'ai_comic_studio_active_projects';

// --- BACKUP & RESTORE (ZIP) ---

export const exportProjectToZip = async (project: ComicProject): Promise<Blob> => {
    const zip = new JSZip();
    // Since this app stores images as Base64 strings directly in the JSON object (imageUrl),
    // simply serializing the project object preserves all assets. 
    // This is the safest way to ensure the restored project is identical to the current state.
    const projectJson = JSON.stringify(project, null, 2);
    
    zip.file("project.json", projectJson);
    
    // Add a readme
    zip.file("README.txt", `Project: ${project.title}\nExported: ${new Date().toISOString()}\n\nTo restore, upload this .zip file in the AI Comic Studio.`);

    const content = await zip.generateAsync({ type: "blob" });
    return content;
};

export const importProjectFromZip = async (file: File): Promise<ComicProject> => {
    try {
        const zip = await JSZip.loadAsync(file);
        const projectFile = zip.file("project.json");
        
        if (!projectFile) {
            throw new Error("Invalid backup: project.json not found in archive.");
        }

        const projectText = await projectFile.async("string");
        const project = JSON.parse(projectText) as ComicProject;
        
        // Basic validation
        if (!project.title || !Array.isArray(project.panels)) {
             throw new Error("Invalid project format.");
        }
        
        // Refresh ID to avoid conflicts if needed, or keep it to overwrite same project
        // Here we keep ID to allow restoring a specific version of a project
        
        return project;
    } catch (e) {
        console.error("Failed to import project", e);
        throw e;
    }
};

// --- ARCHIVE LOGIC (Strips media) ---

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
    const libraryJSON = localStorage.getItem(LIBRARY_KEY);
    let library: ComicProject[] = libraryJSON ? JSON.parse(libraryJSON) : [];
    
    // Check if exists, update or push
    const existingIndex = library.findIndex(p => p.id === projectToSave.id);
    if (existingIndex >= 0) {
        library[existingIndex] = projectToSave;
    } else {
        library.push(projectToSave);
    }

    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
};

export const getLibrary = (): ComicProject[] => {
    const libraryJSON = localStorage.getItem(LIBRARY_KEY);
    return libraryJSON ? JSON.parse(libraryJSON) : [];
};

export const deleteProjectFromLibrary = (id: string): void => {
    const libraryJSON = localStorage.getItem(LIBRARY_KEY);
    if (!libraryJSON) return;

    let library: ComicProject[] = JSON.parse(libraryJSON);
    library = library.filter(p => p.id !== id);
    
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
};

export const loadProjectFromLibrary = (id: string): ComicProject | null => {
    const library = getLibrary();
    const project = library.find(p => p.id === id);
    if (!project) return null;
    return project;
};

// --- WORK IN PROGRESS LOGIC (Keeps media if possible, Max 3) ---

export const getActiveProjects = (): ComicProject[] => {
    const json = localStorage.getItem(ACTIVE_PROJECTS_KEY);
    return json ? JSON.parse(json) : [];
};

export const saveWorkInProgress = (project: ComicProject): { success: boolean, message?: string } => {
    const active = getActiveProjects();
    
    // Ensure ID
    const projectToSave = { ...project, id: project.id || crypto.randomUUID(), lastModified: Date.now() };

    const existingIndex = active.findIndex(p => p.id === projectToSave.id);

    if (existingIndex === -1 && active.length >= 3) {
        return { success: false, message: "SLOTS_FULL" };
    }

    if (existingIndex >= 0) {
        active[existingIndex] = projectToSave;
    } else {
        active.push(projectToSave);
    }

    try {
        localStorage.setItem(ACTIVE_PROJECTS_KEY, JSON.stringify(active));
        return { success: true };
    } catch (e) {
        // Quota exceeded. Strategy: Strip images from this save only, preserve text structure.
        console.warn("Storage full. Stripping images from WIP save.");
        
        // Strip media logic (similar to archive)
        projectToSave.coverImage = undefined;
        projectToSave.characters = projectToSave.characters.map((c: any) => ({ ...c, imageUrl: undefined }));
        projectToSave.panels = projectToSave.panels.map((p: any) => ({ ...p, imageUrl: undefined, videoUrl: undefined }));
        
        if (existingIndex >= 0) active[existingIndex] = projectToSave;
        else active[active.length - 1] = projectToSave;

        try {
             localStorage.setItem(ACTIVE_PROJECTS_KEY, JSON.stringify(active));
             return { success: true, message: "SAVED_WITHOUT_MEDIA" };
        } catch (e2) {
             return { success: false, message: "CRITICAL_STORAGE_ERROR" };
        }
    }
};

export const deleteActiveProject = (id: string): void => {
    let active = getActiveProjects();
    active = active.filter(p => p.id !== id);
    localStorage.setItem(ACTIVE_PROJECTS_KEY, JSON.stringify(active));
};
