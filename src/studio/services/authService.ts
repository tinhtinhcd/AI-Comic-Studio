
import { UserProfile } from '../types';

const STORAGE_KEY_SESSION = 'acs_session_v1';

// We still keep session locally for persistence across refresh, 
// but source of truth is now the DB.

export const register = async (email: string, password: string, username: string): Promise<UserProfile> => {
    const newUser: UserProfile = {
        id: crypto.randomUUID(),
        email,
        username,
        joinDate: Date.now(),
        studioName: `${username}'s Studio`,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${username}`, 
        bio: "Comic Creator",
        credits: 100, // Starting Credits
        stats: { projectsCount: 0, chaptersCount: 0, charactersCount: 0 }
    };

    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newUser.id, email, password, data: newUser })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Registration failed");
    }

    const user = await response.json();
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    return user;
};

export const login = async (email: string, password: string): Promise<UserProfile> => {
    // Legacy Test User Bypass (Client-side check strictly for demo speed)
    if (email === 'user@test.com' && password === '123456') {
        const testUser: UserProfile = {
            id: 'test-user-id-123456',
            username: 'Director (Test)',
            email: 'user@test.com',
            avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Director',
            joinDate: Date.now(),
            studioName: 'Alpha Testing Studio',
            credits: 99999, // Infinite for test user
            stats: { projectsCount: 12, chaptersCount: 45, charactersCount: 128 }
        };
        // We try to register it in DB silently so other features work
        try {
            await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: testUser.id, email, password, data: testUser })
            });
        } catch(e) {} // Ignore if exists
        
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(testUser));
        return testUser;
    }

    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        throw new Error("Invalid credentials");
    }

    const user = await response.json();
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    return user;
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
    if (!current) throw new Error("No session");

    const updatedUser = { ...current, ...updates };
    
    const response = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, data: updatedUser })
    });

    if (!response.ok) throw new Error("Update failed");

    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedUser));
    return updatedUser;
};
