import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ProjectApplication } from '@/types';
import { useNavigate } from 'react-router-dom';

import { supabase } from "@/lib/supabase";

const AdminApplicationsList = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState<ProjectApplication[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        try {
            const { data, error } = await supabase
                .from('project_applications')
                .select('*, developer:profiles(username, first_name, last_name), project:projects(title)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedApps = data?.map((app: any) => ({
                ...app,
                developer_name: app.developer ? (app.developer.first_name ? `${app.developer.first_name} ${app.developer.last_name}` : app.developer.username) : 'Unknown',
                project_title: app.project?.title || 'Unknown Project'
            })) || [];

            setApplications(formattedApps);
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to load applications: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleApprove = async (appId: number) => {
        try {
            const { error } = await supabase
                .from('project_applications')
                .update({ status: 'Approved' })
                .eq('id', appId);

            if (error) throw error;
            toast.success("Application approved");
            fetchApplications();
        } catch (error: any) {
            toast.error("Failed to approve: " + error.message);
        }
    };

    const handleReject = async (appId: number) => {
        try {
            const { error } = await supabase
                .from('project_applications')
                .update({ status: 'Rejected' })
                .eq('id', appId);

            if (error) throw error;
            toast.success("Application rejected");
            fetchApplications();
        } catch (error: any) {
            toast.error("Failed to reject: " + error.message);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Applications</h1>
                <Button variant="outline" onClick={() => navigate('/admin')}>Back to Dashboard</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Developer Applications</CardTitle>
                    <CardDescription>Review and manage incoming project applications.</CardDescription>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No applications found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Developer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {applications.map(app => (
                                        <tr key={app.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{app.developer_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap hover:underline cursor-pointer text-blue-600" onClick={() => navigate(`/admin/projects/${app.project}`)}>
                                                {app.project_title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(app.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={app.status === 'Approved' ? 'default' : app.status === 'Rejected' ? 'destructive' : 'secondary'}>
                                                    {app.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                {app.status === 'Pending' && (
                                                    <>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(app.id)}>Approve</Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)}>Reject</Button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminApplicationsList;
