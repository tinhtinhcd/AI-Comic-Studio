
import { UserProfile } from '../types';

const STORAGE_KEY_SESSION = 'acs_session_v1';
const isLocalHost = typeof window !== 'undefined'
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const USE_TEST_AUTH = import.meta.env.VITE_USE_TEST_AUTH === 'true' || import.meta.env.DEV === true || isLocalHost;

// --- AUTH API ---

export const register = async (): Promise<UserProfile> => {
    throw new Error("Registration is disabled.");
};

export const login = async (email: string, password: string): Promise<UserProfile> => {
    // Always use local storage for demo/public access
    if (email === 'demo@ai-comic.studio' || email === 'user@test.com') {
        const testUser: UserProfile = {
            id: email === 'demo@ai-comic.studio' ? 'demo-user-id' : 'test-user-id-123456',
            email,
            password,
            username: email === 'demo@ai-comic.studio' ? 'Demo User' : 'Test User',
            joinDate: Date.now(),
            studioName: email === 'demo@ai-comic.studio' ? 'Demo Studio' : 'Test Studio',
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${email === 'demo@ai-comic.studio' ? 'DemoUser' : 'TestUser'}`,
            bio: email === 'demo@ai-comic.studio' ? "Demo account for public access." : "Account generated for offline testing.",
            stats: { projectsCount: 0, chaptersCount: 0, charactersCount: 0 }
        };
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(testUser));
        return testUser;
    }
    
    // For any other credentials, create a basic user (for demo purposes)
    const basicUser: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        password,
        username: email.split('@')[0],
        joinDate: Date.now(),
        studioName: 'User Studio',
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`,
        bio: "Demo account created for testing.",
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
    const current = getCurrentUser();
    if (!current || current.id !== id) throw new Error("User not found");
    const updatedUser = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedUser));
    return updatedUser;
};
