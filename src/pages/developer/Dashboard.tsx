import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Task, TaskStatus, Project, ProjectStatus } from '@/types';
import { GitBranch, FolderOpen, DollarSign, CheckCircle, Clock, AlertCircle, MessageSquare, Briefcase, Code, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

import bg1 from "@/assets/bg1.jpeg";

const DeveloperDashboard = () => {
    // ... hooks
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [myApplications, setMyApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // State for submission
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<number | null>(null);
    const [submissionData, setSubmissionData] = useState({
        git_link: '',
        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            // ... existing fetchData logic
            if (!user?.is_approved) {
                setLoading(false);
                return;
            }
            try {
                const [taskRes, projectRes, appRes, payRes] = await Promise.all([
                    api.get('/tasks/'),
                    api.get('/projects/'),
                    api.get('/applications/'),
                    api.get('/payments/')
                ]);
                setTasks(taskRes.data);
                setProjects(projectRes.data);
                setMyApplications(appRes.data);
                setPayments(payRes.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleSubmission = async (e: React.FormEvent) => {
        // ... existing handleSubmission logic
        e.preventDefault();
        if (!selectedTask) return;
        try {
            await api.patch(`/tasks/${selectedTask}/`, {
                status: TaskStatus.READY_FOR_REVIEW,
                submission_git_link: submissionData.git_link,
                submission_notes: submissionData.notes,
            });
            setTasks(tasks.map(t => t.id === selectedTask ? {
                ...t,
                status: TaskStatus.READY_FOR_REVIEW,
                submission_git_link: submissionData.git_link
            } : t));
            toast.success("Work submitted successfully for review");
            setIsSubmitModalOpen(false);
            setSubmissionData({ git_link: '', notes: '' });
        } catch (error) {
            toast.error("Failed to submit work");
        }
    };

    const handleApply = async (projectId: number) => {
        // ... existing handleApply logic
        try {
            await api.post('/applications/', { project: projectId });
            toast.success("Application submitted successfully");
            // Refresh applications
            const appRes = await api.get('/applications/');
            setMyApplications(appRes.data);
        } catch (error: any) {
            toast.error("Failed to apply. You may have already applied.");
        }
    };

    const totalEarnings = payments
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const pendingEarnings = tasks
        .filter(t => t.status === 'Completed')
        .reduce((sum, t) => sum + parseFloat(t.budget), 0);

    const getAppStatus = (pid: number) => myApplications.find(a => a.project === pid)?.status;

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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-700">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Developer Workspace</h1>
                        <p className="text-slate-400 mt-1">
                            {user?.is_approved ? (
                                <span className="flex items-center gap-2 text-green-400 font-medium"><CheckCircle className="w-4 h-4" /> Verified Developer</span>
                            ) : (
                                <span className="flex items-center gap-2 text-yellow-500 font-medium"><Clock className="w-4 h-4" /> Pending Approval</span>
                            )}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
                        <div className="text-left sm:text-right mr-0 sm:mr-4 w-full sm:w-auto flex justify-between sm:block items-center">
                            <p className="text-xs text-slate-400 uppercase font-semibold">Total Earnings</p>
                            <p className="text-2xl font-bold text-white sm:mt-1">${totalEarnings.toFixed(2)}</p>
                        </div>
                        <Button variant="outline" onClick={logout} className="text-red-400 border-red-900/50 hover:text-red-300 hover:bg-red-950/30 w-full sm:w-auto">Logout</Button>
                    </div>
                </div>

                {!user?.is_approved ? (
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                                <Clock className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Account Under Review</h2>
                            <p className="text-yellow-700 max-w-md">
                                Your profile is currently being reviewed by the Admin team. You will gain access to tasks and projects once approved.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Work Area */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Assigned Tasks */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Code className="w-5 h-5 text-indigo-600" />
                                    Active Tasks
                                </h2>
                                {tasks.length === 0 ? (
                                    <Card className="border-dashed">
                                        <CardContent className="p-8 text-center text-slate-500">
                                            No active tasks assigned mainly. Check the project board or wait for admin assignment.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4">
                                        {tasks.map(task => (
                                            <Card key={task.id} className="group bg-slate-900/60 backdrop-blur-md border-slate-700 hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/10">
                                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                                    <div>
                                                        <CardTitle className="text-lg font-semibold text-slate-100">{task.title}</CardTitle>
                                                        <CardDescription className="text-slate-400 font-medium mt-1">Budget: ${task.budget}</CardDescription>
                                                    </div>
                                                    <Badge className={cn(
                                                        task.status === TaskStatus.COMPLETED ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                            task.status === TaskStatus.READY_FOR_REVIEW ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                                                'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                    )}>
                                                        {task.status}
                                                    </Badge>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-slate-300 text-sm mb-4 line-clamp-2">{task.description}</p>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Deadline'}
                                                        </div>

                                                        {task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.READY_FOR_REVIEW && (
                                                            <Dialog open={isSubmitModalOpen && selectedTask === task.id} onOpenChange={(open) => {
                                                                setIsSubmitModalOpen(open);
                                                                if (open) setSelectedTask(task.id);
                                                                else setSelectedTask(null);
                                                            }}>
                                                                <DialogTrigger asChild>
                                                                    <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
                                                                        <Upload className="w-4 h-4 mr-2" /> Submit Work
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Submit Task</DialogTitle>
                                                                        <DialogDescription>
                                                                            Upload your work or provide a repository link for review.
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <form onSubmit={handleSubmission} className="space-y-4 py-4">
                                                                        <div className="space-y-2">
                                                                            <Label>Git Repository Link</Label>
                                                                            <Input
                                                                                placeholder="https://github.com/..."
                                                                                value={submissionData.git_link}
                                                                                onChange={e => setSubmissionData(d => ({ ...d, git_link: e.target.value }))}
                                                                                required
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label>Notes / Files URL</Label>
                                                                            <Textarea
                                                                                placeholder="Additional notes or Drive link for assets..."
                                                                                value={submissionData.notes}
                                                                                onChange={e => setSubmissionData(d => ({ ...d, notes: e.target.value }))}
                                                                            />
                                                                        </div>
                                                                        <DialogFooter>
                                                                            <Button type="submit">Submit for Review</Button>
                                                                        </DialogFooter>
                                                                    </form>
                                                                </DialogContent>
                                                            </Dialog>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Project Opportunities */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-indigo-600" />
                                    Project Market
                                </h2>
                                <Card className="bg-slate-900/60 backdrop-blur-md border-slate-700 shadow-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-900/50 text-slate-400 font-medium border-b border-slate-800">
                                                <tr>
                                                    <th className="px-6 py-4">Project</th>
                                                    <th className="px-6 py-4">Type</th>
                                                    <th className="px-6 py-4">Deadline</th>
                                                    <th className="px-6 py-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800">
                                                {projects.map(project => {
                                                    const status = getAppStatus(project.id);
                                                    return (
                                                        <tr key={project.id} className="hover:bg-slate-800/50 transition-colors">
                                                            <td className="px-6 py-4 font-medium text-slate-100">{project.title}</td>
                                                            <td className="px-6 py-4 text-slate-400">{project.service_type}</td>
                                                            <td className="px-6 py-4 text-slate-400">{project.deadline || '-'}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                {status ? (
                                                                    <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                                                                        {status}
                                                                    </Badge>
                                                                ) : (
                                                                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => handleApply(project.id)}>Apply</Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        {projects.length === 0 && <div className="p-8 text-center text-slate-500">No open projects at the moment.</div>}
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Sidebar Stats */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <DollarSign className="w-6 h-6 text-green-400" />
                                    <h3 className="text-lg font-bold">Earnings</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-slate-400 text-sm">Total Paid Out</p>
                                        <p className="text-3xl font-bold tracking-tight">${totalEarnings.toFixed(2)}</p>
                                    </div>
                                    <div className="pt-4 border-t border-white/10">
                                        <p className="text-slate-400 text-sm flex justify-between">
                                            <span>Pending Payment</span>
                                            <span className="text-white font-medium">${payments.filter(p => p.status === 'Pending').reduce((s, p) => s + parseFloat(p.amount), 0).toFixed(2)}</span>
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-xs text-slate-500">Payments are processed by Admin after task review.</p>
                                    </div>
                                </div>
                            </div>

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
                                        onClick={() => navigate('/developer/messages')}
                                    >
                                        Open Chat
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeveloperDashboard;
