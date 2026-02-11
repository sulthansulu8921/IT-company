import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return data as Profile;
        } catch (error) {
            console.error('Unexpected error fetching profile:', error);
            return null;
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchProfile(session.user.id).then((profile) => {
                    setUser(profile);
                    setIsLoading(false);
                });
            } else {
                setIsLoading(false);
            }
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                setUser(profile);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (credentials: any) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.username, // Assuming username field in login form actually contains email, or we need to change login form to use email.
            // Wait, looking at RegisterDeveloper, we use 'username' and 'email'. Django used username. Supabase uses email.
            // I will need to update Login page to send 'email' or handle username->email lookup (complex).
            // For now, let's assume the user enters EMAIL in the "username" field or we update the UI label.
            password: credentials.password,
        });

        if (error) throw error;

        if (data.user) {
            const profile = await fetchProfile(data.user.id);
            if (profile) {
                if (profile.role === UserRole.ADMIN) navigate('/admin');
                else if (profile.role === UserRole.CLIENT) navigate('/client');
                else if (profile.role === UserRole.DEVELOPER) navigate('/developer');
                else navigate('/');
            }
        }
    };

    const register = async (data: any) => {
        // Supabase requires email.
        const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    username: data.username,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    role: data.role,
                },
            },
        });

        if (error) throw error;
        return authData;
    };

    const logout = async () => {
        await supabase.auth.signOut();
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
