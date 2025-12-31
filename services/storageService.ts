
import { ComicProject } from '../types';
import JSZip from 'jszip';

const DB_NAME = 'AIComicStudioDB';
const DB_VERSION = 1;
const STORE_PROJECTS = 'active_projects';
const STORE_LIBRARY = 'library';

// --- INDEXED DB UTILITIES ---

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
                db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_LIBRARY)) {
                db.createObjectStore(STORE_LIBRARY, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
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

// --- BACKUP & RESTORE (ZIP) ---

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

// --- LIBRARY LOGIC (IndexedDB) ---

export const saveProjectToLibrary = async (project: ComicProject): Promise<void> => {
    const projectToSave = JSON.parse(JSON.stringify(project));
    projectToSave.id = projectToSave.id || crypto.randomUUID();
    projectToSave.lastModified = Date.now();
    
    await dbAction(STORE_LIBRARY, 'readwrite', (store) => store.put(projectToSave));
};

export const getLibrary = async (userId?: string): Promise<ComicProject[]> => {
    const all = await dbAction<ComicProject[]>(STORE_LIBRARY, 'readonly', (store) => store.getAll());
    if (!userId) return all; // For backward compatibility or admin
    return all.filter(p => p.ownerId === userId);
};

export const deleteProjectFromLibrary = async (id: string): Promise<void> => {
    await dbAction(STORE_LIBRARY, 'readwrite', (store) => store.delete(id));
};

// --- WORK IN PROGRESS LOGIC (IndexedDB) ---

export const getActiveProjects = async (userId?: string): Promise<ComicProject[]> => {
    const all = await dbAction<ComicProject[]>(STORE_PROJECTS, 'readonly', (store) => store.getAll());
    if (!userId) return all;
    // Filter projects that belong to the user OR have no owner (legacy projects created before auth)
    // We optionally might want to "claim" legacy projects for the first user who logs in, 
    // but for now, we just show user's projects. 
    // If a legacy user logs in, they might lose access to non-owned projects if we are strict.
    // STRATEGY: Show owned + unowned.
    return all.filter(p => p.ownerId === userId || !p.ownerId);
};

export const saveWorkInProgress = async (project: ComicProject): Promise<{ success: boolean, message?: string }> => {
    try {
        const projectToSave = { ...project, id: project.id || crypto.randomUUID(), lastModified: Date.now() };
        
        // Get ALL projects to check slot count (per user or global? Local DB is per device, so Global is fine for quota)
        // But functionally we want per user.
        // Let's check quota based on total local usage for now.
        const allProjects = await dbAction<ComicProject[]>(STORE_PROJECTS, 'readonly', (store) => store.getAll());
        
        // Count ONLY this user's projects for slot limit
        const userProjects = project.ownerId 
            ? allProjects.filter(p => p.ownerId === project.ownerId)
            : allProjects.filter(p => !p.ownerId);

        const exists = userProjects.find(p => p.id === projectToSave.id);
        
        if (!exists && userProjects.length >= 3) {
            return { success: false, message: "SLOTS_FULL" };
        }

        await dbAction(STORE_PROJECTS, 'readwrite', (store) => store.put(projectToSave));
        return { success: true };
    } catch (e: any) {
        console.error("IDB Save Error:", e);
        if (e.name === 'QuotaExceededError') {
             return { success: false, message: "DISK_FULL" };
        }
        return { success: false, message: e.message };
    }
};

export const deleteActiveProject = async (id: string): Promise<void> => {
    await dbAction(STORE_PROJECTS, 'readwrite', (store) => store.delete(id));
};
