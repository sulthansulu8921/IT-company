import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Project, Task, Profile, UserRole, ProjectStatus, ProjectApplication } from '@/types';

const AdminProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [developers, setDevelopers] = useState<Profile[]>([]);
    const [applications, setApplications] = useState<ProjectApplication[]>([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '', description: '', budget: '', deadline: '', assigned_to: ''
    });

    const fetchData = async () => {
        try {
            const [projRes, tasksRes, devsRes, appsRes] = await Promise.all([
                api.get(`/projects/${id}/`),
                api.get(`/tasks/?project=${id}`),
                api.get('/users/'),
                api.get(`/applications/?project_id=${id}`)
            ]);
            setProject(projRes.data);
            setTasks(tasksRes.data.filter((t: Task) => t.project === Number(id)));
            setDevelopers(devsRes.data.filter((u: Profile) => u.role === UserRole.DEVELOPER && u.is_approved));
            setApplications(appsRes.data);
        } catch (error) {
            toast.error("Failed to load project details");
        }
    };

    const handleApproveApplication = async (appId: number) => {
        try {
            await api.post(`/applications/${appId}/approve/`);
            toast.success("Application approved and Developer assigned");
            fetchData();
        } catch (error) {
            toast.error("Failed to approve application");
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const handleUpdateStatus = async (status: ProjectStatus) => {
        try {
            await api.patch(`/projects/${id}/`, { status });
            toast.success("Project status updated");
            fetchData();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/tasks/', {
                ...newTask,
                project: id,
                assigned_to: newTask.assigned_to
            });
            toast.success("Task assigned successfully");
            setIsTaskModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to create task");
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await api.delete(`/tasks/${taskId}/`);
            toast.success("Task deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete task");
        }
    };

    if (!project) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Project: {project.title}</h1>
                <Button variant="outline" onClick={() => navigate('/admin/projects')}>Back to List</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <CardDescription>Client: {project.client_name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold">Description</h3>
                            <p className="text-gray-600">{project.description}</p>
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <h3 className="font-semibold">Service</h3>
                                <p>{project.service_type}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Budget</h3>
                                <p>${project.budget}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Created</h3>
                                <p>{new Date(project.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Current Status</Label>
                            <div className="font-bold text-lg">{project.status}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button onClick={() => handleUpdateStatus(ProjectStatus.OPEN)} className="bg-blue-600 hover:bg-blue-700" disabled={project.status === ProjectStatus.OPEN}>Mark Open (Approve)</Button>
                            <Button onClick={() => handleUpdateStatus(ProjectStatus.IN_PROGRESS)} disabled={project.status === ProjectStatus.IN_PROGRESS}>Mark In Progress</Button>
                            <Button onClick={() => handleUpdateStatus(ProjectStatus.COMPLETED)} variant="default" className="bg-green-600 hover:bg-green-700" disabled={project.status === ProjectStatus.COMPLETED}>Mark Completed</Button>
                            <Button onClick={() => handleUpdateStatus(ProjectStatus.REJECTED)} variant="destructive" disabled={project.status === ProjectStatus.REJECTED}>Reject Project</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Developer Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No applications received.</p>
                    ) : (
                        <div className="space-y-4">
                            {applications.map(app => (
                                <div key={app.id} className="flex justify-between items-center p-4 border rounded bg-muted/40 hover:bg-muted/60 transition-colors">
                                    <div>
                                        <h4 className="font-bold">{app.developer_name}</h4>
                                        <p className="text-sm text-foreground">Status: <span className={app.status === 'Approved' ? 'text-green-600 font-bold' : app.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'}>{app.status}</span></p>
                                        <p className="text-xs text-muted-foreground">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {app.status === 'Pending' && (
                                            <Button size="sm" onClick={() => handleApproveApplication(app.id)}>Approve & Assign</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Tasks & Assignments</CardTitle>
                    <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
                        <DialogTrigger asChild>
                            <Button>+ Assign New Task</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleCreateTask}>
                                <DialogHeader>
                                    <DialogTitle>Assign Task to Developer</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Task Title</Label>
                                        <Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Budget for Task</Label>
                                            <Input type="number" value={newTask.budget} onChange={(e) => setNewTask({ ...newTask, budget: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Deadline</Label>
                                            <Input type="date" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Assign To</Label>
                                        <Select onValueChange={(val) => setNewTask({ ...newTask, assigned_to: val })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Developer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {developers
                                                    .filter(dev => applications.some(app => app.developer === dev.user.id))
                                                    .map(dev => (
                                                        <SelectItem key={dev.user.id} value={String(dev.user.id)}>
                                                            {dev.user.username} ({dev.skills || 'No skills listed'})
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Assign Task</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {tasks.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No tasks assigned yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map(task => (
                                <div key={task.id} className="flex justify-between items-center p-4 border rounded bg-muted/40 hover:bg-muted/60 transition-colors group">
                                    <div>
                                        <h4 className="font-bold">{task.title}</h4>
                                        <p className="text-sm text-foreground">Assigned to: {task.assigned_to_name}</p>
                                        <p className="text-xs text-muted-foreground">Deadline: {task.deadline}</p>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <div className="font-bold text-green-600">${task.budget}</div>
                                            <div className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full inline-block mt-1">{task.status}</div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteTask(task.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminProjectDetail;
