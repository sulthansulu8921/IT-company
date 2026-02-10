import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Project, ProjectStatus } from '@/types';
import { Palette, Globe, Smartphone, Megaphone, Search, Settings, Server, Layout, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import ProjectStatusTracker from '@/components/ProjectStatusTracker';

const SERVICES = [
    { id: 'Logo & Branding', label: 'Logo & Branding', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-50' },
    { id: 'Poster / Banner Design', label: 'Poster / Banner Design', icon: Layout, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'Website Development', label: 'Website Development', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'Web Application', label: 'Web Application', icon: Monitor, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { id: 'Mobile App', label: 'Mobile App', icon: Smartphone, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'Digital Marketing', label: 'Digital Marketing', icon: Megaphone, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'SEO', label: 'SEO', icon: Search, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { id: 'Maintenance & Support', label: 'Maintenance & Support', icon: Settings, color: 'text-gray-500', bg: 'bg-gray-50' },
    { id: 'Hosting & Deployment', label: 'Hosting & Deployment', icon: Server, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

import bg1 from "@/assets/bg1.jpeg";

const ClientDashboard = () => {
    // ... hooks
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        service_type: '',
        budget: ''
    });
    const [tasks, setTasks] = useState<any[]>([]);
    const [isDeliverablesOpen, setIsDeliverablesOpen] = useState(false);

    const fetchProjects = async () => {
        try {
            const [projRes, taskRes] = await Promise.all([
                api.get('/projects/'),
                api.get('/tasks/')
            ]);
            setProjects(projRes.data);
            setTasks(taskRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProject.service_type) {
            toast.error("Please select a service type");
            return;
        }

        try {
            await api.post('/projects/', newProject);
            toast.success('Project request submitted successfully');
            setIsCreateOpen(false);
            setStep(1);
            setNewProject({ title: '', description: '', service_type: '', budget: '' });
            fetchProjects();
        } catch (error) {
            toast.error('Failed to create project');
        }
    };

    const handleUpdateTaskStatus = async (taskId: number, status: string) => {
        try {
            await api.patch(`/tasks/${taskId}/`, { status });
            toast.success(`Task marked as ${status}`);
            fetchProjects();
        } catch (error) {
            toast.error("Failed to update task status");
        }
    };

    const scrollToProjects = () => {
        const element = document.getElementById('projects-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            [ProjectStatus.COMPLETED]: 'bg-green-500/20 text-green-400 border-green-500/30',
            [ProjectStatus.IN_PROGRESS]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            [ProjectStatus.REJECTED]: 'bg-red-500/20 text-red-400 border-red-500/30',
            [ProjectStatus.PENDING]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            [ProjectStatus.REVIEW]: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        };
        const defaultStyle = 'bg-gray-500/20 text-gray-400 border-gray-500/30';

        return (
            <span className={cn("text-xs px-2.5 py-0.5 rounded-full border font-medium", styles[status as keyof typeof styles] || defaultStyle)}>
                {status}
            </span>
        );
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
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

            <div className="relative z-10 max-w-7xl mx-auto space-y-8 p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Client Dashboard</h1>
                        <p className="text-slate-400 mt-1">Welcome back, <span className="font-semibold text-indigo-400">{user?.user.first_name || user?.user.username}</span></p>
                    </div>
                    <div className="flex gap-4">
                        <Dialog open={isCreateOpen} onOpenChange={(open) => {
                            setIsCreateOpen(open);
                            if (!open) setStep(1);
                        }}>
                            <DialogTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
                                    + New Project Request
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] bg-slate-900/95 backdrop-blur-xl border-slate-700">
                                <form onSubmit={handleCreateSubmit}>
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl text-white">Create Project Request</DialogTitle>
                                        <DialogDescription className="text-slate-400">
                                            Let's get your project started. {step === 1 ? "Select a service type." : "Fill in the details."}
                                        </DialogDescription>
                                    </DialogHeader>

                                    {step === 1 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-6 max-h-[60vh] overflow-y-auto">
                                            {SERVICES.map((service) => {
                                                const Icon = service.icon;
                                                return (
                                                    <div
                                                        key={service.id}
                                                        onClick={() => {
                                                            setNewProject({ ...newProject, service_type: service.id });
                                                            setStep(2);
                                                        }}
                                                        className="cursor-pointer group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all text-center gap-3"
                                                    >
                                                        <div className={cn("p-3 rounded-full transition-transform group-hover:scale-110 bg-slate-800", service.color)}>
                                                            <Icon className={cn("w-6 h-6")} />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-300 group-hover:text-indigo-400">{service.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 py-4">
                                            <div className="flex items-center gap-2 text-sm text-indigo-400 font-medium bg-indigo-500/10 p-2 rounded-lg mb-2 border border-indigo-500/20">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                Selected: {newProject.service_type}
                                                <Button type="button" variant="ghost" size="sm" className="ml-auto h-6 text-xs text-indigo-300 hover:text-indigo-200" onClick={() => setStep(1)}>Change</Button>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="title" className="text-slate-200">Project Title</Label>
                                                <Input
                                                    id="title"
                                                    value={newProject.title}
                                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                                    required
                                                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="description" className="text-slate-200">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={newProject.description}
                                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                                    required
                                                    className="min-h-[100px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                                    placeholder="Describe your project requirements clearly..."
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="budget" className="text-slate-200">Budget (Optional)</Label>
                                                <Input
                                                    id="budget"
                                                    type="number"
                                                    value={newProject.budget}
                                                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                                                    placeholder="Expected budget"
                                                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <DialogFooter>
                                        {step === 2 && (
                                            <div className="flex gap-2 w-full justify-end">
                                                <Button type="button" variant="outline" onClick={() => setStep(1)} className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">Back</Button>
                                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Submit Request</Button>
                                            </div>
                                        )}
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Manage Deliverables Dialog */}
                        <Dialog open={isDeliverablesOpen} onOpenChange={setIsDeliverablesOpen}>
                            <DialogContent className="sm:max-w-[800px] bg-slate-900/95 backdrop-blur-xl border-slate-700">
                                <DialogHeader>
                                    <DialogTitle className="text-white">Manage Deliverables</DialogTitle>
                                    <DialogDescription className="text-slate-400">Review and approve work submitted by developers.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                    {tasks.length === 0 ? (
                                        <p className="text-center text-slate-500 py-8">No active tasks found.</p>
                                    ) : (
                                        tasks.map(task => (
                                            <Card key={task.id} className="p-4 bg-slate-800/50 border-slate-700">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-slate-200">{task.title}</h4>
                                                        <p className="text-sm text-slate-400 mb-2">Project: {task.project_title}</p>
                                                        <div className="flex gap-2 text-xs">
                                                            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">{task.status}</span>
                                                            <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full border border-slate-600">Dev: {task.assigned_to_name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-slate-200">${task.budget}</div>
                                                        <div className="text-xs text-slate-500">Due: {task.deadline}</div>
                                                    </div>
                                                </div>

                                                {task.submission_git_link && (
                                                    <div className="mt-4 bg-slate-900/50 p-3 rounded text-sm border border-slate-700">
                                                        <p className="font-semibold mb-1 text-slate-300">Submission:</p>
                                                        <a href={task.submission_git_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                                                            {task.submission_git_link}
                                                        </a>
                                                        {task.submission_notes && <p className="mt-2 text-slate-400">{task.submission_notes}</p>}
                                                    </div>
                                                )}

                                                {task.status === 'Ready For Review' && (
                                                    <div className="mt-4 flex gap-2 justify-end">
                                                        <Button size="sm" variant="outline" className="text-orange-400 border-orange-500/30 hover:bg-orange-500/10" onClick={() => handleUpdateTaskStatus(task.id, 'Changes Requested')}>
                                                            Request Changes
                                                        </Button>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateTaskStatus(task.id, 'Completed')}>
                                                            Approve & Complete
                                                        </Button>
                                                    </div>
                                                )}
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button variant="outline" onClick={logout} className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">Logout</Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Projects Column */}
                    <div className="lg:col-span-2 space-y-6" id="projects-section">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-indigo-400" />
                            Your Projects
                        </h2>

                        {isLoading ? (
                            <div className="flex justify-center p-12 text-slate-400">Loading projects...</div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-16 bg-slate-900/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-700">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Layout className="w-8 h-8 text-slate-500" />
                                </div>
                                <p className="text-slate-400 mb-4 font-medium">You haven't submitted any projects yet.</p>
                                <Button variant="secondary" onClick={() => setIsCreateOpen(true)} className="bg-slate-800 text-white hover:bg-slate-700">Create First Project</Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {projects.map((project) => (
                                    <Card key={project.id} className="hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 border-slate-700 bg-slate-900/60 backdrop-blur-sm group overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <CardHeader>
                                            <div className="flex justify-between items-start mb-2">
                                                <StatusBadge status={project.status} />
                                                <span className="text-xs text-slate-500">{new Date(project.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <CardTitle className="text-lg font-bold text-slate-100">{project.title}</CardTitle>
                                            <CardDescription className="font-medium text-indigo-400">{project.service_type}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">{project.description}</p>

                                            {/* Status Tracker */}
                                            <div className="mt-4 pt-4 border-t border-slate-800">
                                                <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Project Progress</h4>
                                                <ProjectStatusTracker status={project.status} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Messages */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Megaphone className="w-5 h-5 text-indigo-400" />
                            Communication
                        </h2>
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-900 to-purple-900 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Chat with Admin
                                </CardTitle>
                                <CardDescription className="text-indigo-200">
                                    Need help? Contact our support team directly.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-indigo-200 mb-4">
                                    We typically reply within a few minutes during business hours.
                                </p>
                                <Button
                                    className="w-full bg-white text-indigo-900 hover:bg-indigo-50 border-0 font-semibold"
                                    onClick={() => navigate('/client/messages')}
                                >
                                    Open Chat
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-700 shadow-md bg-slate-900/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-base text-indigo-400 font-bold">Support & Help</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div
                                    className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors group"
                                    onClick={scrollToProjects}
                                >
                                    <div className="p-2 bg-green-500/20 text-green-400 rounded-lg group-hover:bg-green-500/30 transition-colors">
                                        <Monitor className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">Track Project Status</span>
                                </div>
                                <div
                                    className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors group"
                                    onClick={() => setIsDeliverablesOpen(true)}
                                >
                                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                        <Settings className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">Manage Deliverables</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
