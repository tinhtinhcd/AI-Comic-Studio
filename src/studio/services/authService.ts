
import { UserProfile } from '../types';

const STORAGE_KEY_SESSION = 'acs_session_v1';

// --- AUTH API ---

export const register = async (): Promise<UserProfile> => {
    throw new Error("Registration is disabled.");
};

export const login = async (email: string, password: string): Promise<UserProfile> => {
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
        } catch (e) {
            // Ignore parse errors.
        }
        if (response.status === 503) {
            message = "Database not available.";
        }
        throw new Error(message);
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
    // Optimistic Update
    const current = getCurrentUser();
    if (!current) throw new Error("No session");
    
    const updatedUser = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(updatedUser));

    try {
        await fetch('/api/admin/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, updates })
        });
    } catch (e) {
        console.warn("Failed to sync profile update to cloud.");
    }

    return updatedUser;
};
