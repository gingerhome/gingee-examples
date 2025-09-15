// File: web/gindoo/dev_src/contexts/AuthContext.tsx

import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const response = await fetch('/gindoo/api/auth/me');
                if (response.ok) {
                    const userData: User = await response.json();
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Session check failed:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkUserSession();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await fetch('/gindoo/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const userData: User = await response.json();
            setUser(userData);
            return { success: true };
        } else {
            const errorData = await response.json();
            return { success: false, error: errorData.error || 'Login failed.' };
        }
    };

    const logout = async () => {
        await fetch('/gindoo/api/auth/logout', { method: 'POST' });
        setUser(null);
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        try {
            const response = await fetch('/gindoo/api/users/me/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update password.');
            }
            
            return { success: true };
        } catch (err: any) {
            console.error("Password change failed:", err);
            return { success: false, error: err.message };
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        changePassword
    };

    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
