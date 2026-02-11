import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Project, ProjectStatus } from '@/types';
import { Link } from 'react-router-dom';
import { supabase } from "@/lib/supabase";

const AdminProjectList = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*, client:profiles(username, first_name, last_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedProjects = data?.map((p: any) => ({
                ...p,
                client_name: p.client ? (p.client.first_name ? `${p.client.first_name} ${p.client.last_name}` : p.client.username) : 'Unknown'
            })) || [];

            setProjects(formattedProjects);
        } catch (error: any) {
            toast.error("Failed to fetch projects: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const getStatusColor = (status: ProjectStatus) => {
        switch (status) {
            case ProjectStatus.COMPLETED: return 'text-green-600 bg-green-100';
            case ProjectStatus.IN_PROGRESS: return 'text-blue-600 bg-blue-100';
            case ProjectStatus.REJECTED: return 'text-red-600 bg-red-100';
            default: return 'text-yellow-600 bg-yellow-100';
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Project Management</h1>

            <Card>
                <CardHeader>
                    <CardTitle>All Client Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Budget</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : projects.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.title}</TableCell>
                                    <TableCell>{p.client_name}</TableCell>
                                    <TableCell>{p.service_type}</TableCell>
                                    <TableCell>{p.budget ? `$${p.budget}` : '-'}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(p.status)}`}>
                                            {p.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Link to={`/admin/projects/${p.id}`}>
                                            <Button size="sm" variant="outline">Manage</Button>
                                        </Link>
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

export default AdminProjectList;
