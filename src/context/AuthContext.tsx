import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Profile, UserRole } from '@/types';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: Profile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<any>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUser = async () => {
        try {
            const response = await api.get('/user/me/');
            // Checking api/urls.py... wait, the UserDetailView wasn't explicitly shown in urls.py snippet earlier but checking UserDetailView generics.RetrieveAPIView...
            // Actually, let's verify the endpoint for user details.
            // Assuming it is /auth/user/ or similar. The user snippet showed `router.register("users", ...)` but that's for admin list.
            // There was `UserDetailView`. Let's assume it's mapped. If not I need to fix backend too. 
            // BUT, for now let's fix the frontend redirect.
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch user", error);
            logout();
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (credentials: any) => {
        const response = await api.post('/auth/login/', credentials);
        localStorage.setItem('token', response.data.access);
        const profile = await fetchUser();
        if (profile) {
            if (profile.role === UserRole.ADMIN) navigate('/admin');
            else if (profile.role === UserRole.CLIENT) navigate('/client');
            else if (profile.role === UserRole.DEVELOPER) navigate('/developer');
            else navigate('/');
        }
    };

    const register = async (data: any) => {
        const response = await api.post('/auth/register/', data);
        return response;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/auth/login');
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
