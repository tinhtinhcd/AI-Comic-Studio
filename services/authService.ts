
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
    if (USE_TEST_AUTH && email === 'user@test.com' && password === '123456') {
        const testUser: UserProfile = {
            id: 'test-user-id-123456',
            email,
            password,
            username: 'Test User',
            joinDate: Date.now(),
            studioName: 'Test Studio',
            avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=TestUser',
            bio: "Account generated for offline testing.",
            stats: { projectsCount: 0, chaptersCount: 0, charactersCount: 0 }
        };
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(testUser));
        return testUser;
    }
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            let message = 'Invalid credentials.';
            try {
                const err = await response.json();
                message = err.error || message;
            } catch (e) {}
            if (response.status === 503) {
                message = "Database not available.";
            }
            throw new Error(message);
        }

        const user = await response.json();
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
        return user;
    } catch (e: any) {
        throw e;
    }
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
