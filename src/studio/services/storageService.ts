
import { AgentRunState, ComicProject } from '../types';
import JSZip from 'jszip';

const DB_NAME = 'AIComicStudioDB';
const DB_VERSION = 2;
const STORE_PROJECTS = 'active_projects';
const STORE_LIBRARY = 'library';
const AGENT_RUN_KEY = 'acs_agent_run_v1';

// --- INDEXED DB UTILITIES (Fallback Layer) ---

const ensureStores = (db: IDBDatabase) => {
    if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains(STORE_LIBRARY)) {
        db.createObjectStore(STORE_LIBRARY, { keyPath: 'id' });
    }
};

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            ensureStores(db);
        };

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const missingStores = [STORE_PROJECTS, STORE_LIBRARY].filter(store => !db.objectStoreNames.contains(store));
            if (missingStores.length > 0) {
                const upgradeVersion = db.version + 1;
                db.close();
                const upgradeRequest = indexedDB.open(DB_NAME, upgradeVersion);
                upgradeRequest.onupgradeneeded = () => {
                    const upgradeDb = upgradeRequest.result;
                    ensureStores(upgradeDb);
                };
                upgradeRequest.onsuccess = () => resolve(upgradeRequest.result);
                upgradeRequest.onerror = () => reject(upgradeRequest.error);
                return;
            }
            resolve(db);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};

const dbAction = async <T>(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        
        let request: IDBRequest<T> | void;
        try {
            request = action(store);
        } catch (e) {
            reject(e);
            return;
        }

        transaction.oncomplete = () => {
            if (request) resolve(request.result);
            else resolve(undefined as T);
        };

        transaction.onerror = () => reject(transaction.error);
    });
};

// --- HYBRID STORAGE LOGIC ---

export const getActiveProjects = async (userId?: string): Promise<ComicProject[]> => {
    // 1. Try Cloud API
    try {
        let url = '/api/projects?type=active';
        if (userId) url += `&userId=${userId}`;
        
        const res = await fetch(url);
        if (res.ok) {
            return await res.json();
        } else {
            // Silently fallback if 503 or 404 (Offline Mode)
            if (res.status !== 503 && res.status !== 404) {
                console.warn(`Cloud fetch failed (${res.status}). Switching to Local DB.`);
            }
        }
    } catch (e) {
        // Network error - fallback to local
    }

    // 2. Fallback to Local IndexedDB
    try {
        return await dbAction<ComicProject[]>(STORE_PROJECTS, 'readonly', (store) => store.getAll());
    } catch (e) {
        console.error("Local DB failed", e);
        return [];
    }
};

export const saveWorkInProgress = async (project: ComicProject): Promise<{ success: boolean, message?: string, id?: string }> => {
    const projectToSave: ComicProject = {
        ...project,
        id: project.id || crypto.randomUUID(),
        lastModified: Date.now()
    };

    // 1. Skip Cloud API for demo - Local storage only
    let cloudSuccess = false;
    let cloudMessage = "Demo mode - local storage only";

    // Always use local storage for demo
    console.log("Saving project locally (demo mode)");

    if (cloudSuccess) {
        return { success: true, id: projectToSave.id };
    }

    // 2. Fallback to Local
    try {
        // Check Local Slots
        const allLocal = await dbAction<ComicProject[]>(STORE_PROJECTS, 'readonly', (store) => store.getAll());
        // Simple quota check: if not update, and count >= 3
        if (!allLocal.find(p => p.id === projectToSave.id) && allLocal.length >= 3) {
             return { success: false, message: "SLOTS_FULL", id: projectToSave.id };
        }

        await dbAction(STORE_PROJECTS, 'readwrite', (store) => store.put(projectToSave));
        return { success: true, message: "Saved (Offline Mode)", id: projectToSave.id };
    } catch (e: any) {
        return { success: false, message: e.message, id: projectToSave.id };
    }
};

export const deleteActiveProject = async (id: string): Promise<void> => {
    // Skip Cloud - Local storage only for demo
    console.log("Deleting project locally (demo mode)");

    // Always Delete Local
    await dbAction(STORE_PROJECTS, 'readwrite', (store) => store.delete(id));
};

// --- LIBRARY LOGIC ---

export const saveProjectToLibrary = async (project: ComicProject): Promise<void> => {
    const projectToSave = { ...project };
    if (!projectToSave.id) projectToSave.id = crypto.randomUUID();
    
    // Skip Cloud - Local storage only for demo
    console.log("Saving project to library locally (demo mode)");

    // Save Local
    await dbAction(STORE_LIBRARY, 'readwrite', (store) => store.put(projectToSave));
};

export const getLibrary = async (userId?: string): Promise<ComicProject[]> => {
    // Skip Cloud - Local storage only for demo
    console.log("Loading library from local storage (demo mode)");

    // Always return local library
    return await dbAction<ComicProject[]>(STORE_LIBRARY, 'readonly', (store) => store.getAll());
};

export const deleteProjectFromLibrary = async (id: string): Promise<void> => {
    // Skip Cloud - Local storage only for demo
    console.log("Deleting project from library locally (demo mode)");
    await dbAction(STORE_LIBRARY, 'readwrite', (store) => store.delete(id));
};

// --- ZIP EXPORT/IMPORT (Client Only) ---

export const exportProjectToZip = async (project: ComicProject): Promise<Blob> => {
    const zip = new JSZip();
    const projectJson = JSON.stringify(project, null, 2);
    zip.file("project.json", projectJson);
    zip.file("README.txt", `Project: ${project.title}\nExported: ${new Date().toISOString()}\n\nTo restore, upload this .zip file in the AI Comic Studio.`);
    const content = await zip.generateAsync({ type: "blob" });
    return content;
};

export const importProjectFromZip = async (file: File): Promise<ComicProject> => {
    try {
        const zip = await JSZip.loadAsync(file);
        const projectFile = zip.file("project.json");
        if (!projectFile) throw new Error("Invalid backup: project.json not found.");

        const projectText = await projectFile.async("string");
        const project = JSON.parse(projectText) as ComicProject;
        
        if (!project.title || !Array.isArray(project.panels)) throw new Error("Invalid project format.");
        
        project.id = crypto.randomUUID();
        return project;
    } catch (e) {
        console.error("Failed to import project", e);
        throw e;
    }
};

// --- AGENT RUN STATE (Local Only) ---

export const saveAgentRunState = (run: AgentRunState) => {
    try {
        localStorage.setItem(AGENT_RUN_KEY, JSON.stringify(run));
    } catch (e) {
        console.error("Failed to save agent run state", e);
    }
};

export const loadAgentRunState = (): AgentRunState | null => {
    try {
        const raw = localStorage.getItem(AGENT_RUN_KEY);
        return raw ? (JSON.parse(raw) as AgentRunState) : null;
    } catch (e) {
        console.error("Failed to load agent run state", e);
        return null;
    }
};

export const clearAgentRunState = () => {
    try {
        localStorage.removeItem(AGENT_RUN_KEY);
    } catch (e) {
        console.error("Failed to clear agent run state", e);
    }
};
