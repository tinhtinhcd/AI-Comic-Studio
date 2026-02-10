
import { UserProfile } from '../types';

const STORAGE_KEY_SESSION = 'acs_session_v1';
const isLocalHost = typeof window !== 'undefined'
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const USE_TEST_AUTH = import.meta.env.VITE_USE_TEST_AUTH === 'true' || import.meta.env.DEV === true || isLocalHost;
const STORAGE_KEY_AI_PREFS = 'ai_comic_user_prefs_v1';

// --- AUTH API ---

export const register = async (): Promise<UserProfile> => {
    throw new Error("Registration is disabled.");
};

export const login = async (email: string, password: string): Promise<UserProfile> => {
    // Always use local storage for demo/public access
    if (email === 'demo@ai-comic.studio' || email === 'user@test.com') {
        const testUser: UserProfile = {
            id: email === 'demo@ai-comic.studio' ? 'demo-user-id' : 'test-user-id-123456',
            username: email === 'demo@ai-comic.studio' ? 'Demo User' : 'Test User',
            email,
            password,
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${email === 'demo@ai-comic.studio' ? 'DemoUser' : 'TestUser'}`,
            joinDate: Date.now(),
            studioName: email === 'demo@ai-comic.studio' ? 'Demo Studio' : 'Test Studio',
            bio: email === 'demo@ai-comic.studio' ? 'Demo account for public access.' : 'Account generated for offline testing.',
            credits: 1000,
            stats: { projectsCount: 0, chaptersCount: 0, charactersCount: 0 }
        };
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(testUser));
        return testUser;
    }
    
    // For any other credentials, create a basic user (for demo purposes)
    const basicUser: UserProfile = {
        id: `user-${Date.now()}`,
        username: email.split('@')[0],
        email,
        password,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`,
        joinDate: Date.now(),
        studioName: 'User Studio',
        bio: "Demo account created for testing.",
        credits: 1000,
        stats: { projectsCount: 0, chaptersCount: 0, charactersCount: 0 }
    };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(basicUser));
    return basicUser;
};

export const logout = () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
};

export const getCurrentUser = (): UserProfile | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_SESSION);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
};

export const updateUserProfile = async (id: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
    // Optimistic Update - Local storage only for demo
    const current = getCurrentUser();
    if (!current) throw new Error("No session");
    
    const updatedUser = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedUser));
    if (updates.aiPreferences) {
        localStorage.setItem(STORAGE_KEY_AI_PREFS, JSON.stringify(updates.aiPreferences));
    }

    // Skip cloud sync for demo - local storage only
    console.log("Profile updated locally (demo mode)");
    return updatedUser;
};
