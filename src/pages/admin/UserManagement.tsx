import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from "@/lib/supabase";
import { Profile, UserRole } from '@/types';

const UserManagement = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            toast.error("Failed to fetch users: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_approved: true })
                .eq('id', id);

            if (error) throw error;
            toast.success("Developer approved");
            fetchUsers();
        } catch (error: any) {
            toast.error("Failed to approve developer: " + error.message);
        }
    };

    const deleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            // Note: Deleting from profiles might fail if RLS prevents it.
            // Ideally we delete from auth.users using an Edge Function.
            // For now, let's try deleting profile row.
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("User profile deleted");
            fetchUsers();
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to delete user. You may need Admin permissions on Supabase.");
        }
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">User Management</h1>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.username}</TableCell>
                                    <TableCell>{u.role}</TableCell>
                                    <TableCell>
                                        {u.role === UserRole.DEVELOPER ? (
                                            u.is_approved ? <span className="text-green-600 font-bold">Approved</span> : <span className="text-yellow-600 font-bold">Pending</span>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="flex gap-2">
                                        {u.role === UserRole.DEVELOPER && !u.is_approved && (
                                            <Button size="sm" onClick={() => handleApprove(u.id)}>Approve</Button>
                                        )}
                                        <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserManagement;
