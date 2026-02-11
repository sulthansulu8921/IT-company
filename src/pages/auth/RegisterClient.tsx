import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';

import bg1 from "@/assets/bg1.jpeg";

const RegisterClient = () => {
    const { } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '', password: '', email: '', first_name: '', last_name: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // 1. Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        username: formData.username,
                        role: UserRole.CLIENT
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Registration failed");

            // 2. Create Profile (if trigger doesn't exist/work)
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    username: formData.username,
                    email: formData.email,
                    role: UserRole.CLIENT,
                    is_approved: true // Clients auto-approved? Usually yes.
                });

            if (profileError) {
                console.error("Profile creation failed", profileError);
            }

            // 3. Handle Email Confirmation vs Auto-Login
            if (!authData.session) {
                toast.success('Registration successful! Please check your email to verify your account.');
                navigate("/auth/login");
            } else {
                toast.success('Registration successful!');
                navigate("/client-dashboard");
            }
        } catch (error: any) {
            console.error("Registration error:", error);
            const errorMsg = error.message || 'Registration failed.';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src={bg1}
                    alt="Background"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 tech-grid-bg opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
            </div>

            <Card className="relative z-10 w-full max-w-md mx-4 animate-fade-in backdrop-blur-sm bg-card/90">
                <CardHeader>
                    <CardTitle>Client Registration</CardTitle>
                    <CardDescription>Create an account to post projects</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Registering...' : 'Register'}
                        </Button>
                        <div className="text-sm text-center text-gray-500">
                            Already have an account? <Link to="/auth/login" className="text-primary hover:underline">Login</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default RegisterClient;
