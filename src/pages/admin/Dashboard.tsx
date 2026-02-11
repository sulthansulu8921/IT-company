import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, DollarSign, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const sections = [
        {
            title: "User Management",
            description: "Approve developers, manage users and roles.",
            icon: Users,
            action: "Manage Users",
            link: "/admin/users",
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Projects & Tasks",
            description: "Oversee projects, assign tasks, and review applications.",
            icon: Briefcase,
            action: "View Projects",
            link: "/admin/projects",
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            title: "WMT Treasury",
            description: "Monitor cash flow, payouts, and platform commission.",
            icon: DollarSign,
            action: "View Treasury",
            link: "/admin/treasury",
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            title: "Communication",
            description: "Direct messages with clients and developers.",
            icon: MessageSquare,
            action: "Open Chat",
            link: "/admin/messages",
            color: "text-orange-600",
            bg: "bg-orange-50"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-8 h-8 text-indigo-600" />
                            Admin Command Center
                        </h1>
                        <p className="text-slate-500 mt-1">Welcome back, {user?.username}</p>
                    </div>
                    <Button variant="outline" onClick={logout} className="text-red-500 hover:text-red-600 hover:bg-red-50">Logout</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sections.map((section, idx) => (
                        <Card key={idx} className="group hover:shadow-md transition-all cursor-pointer border-slate-200" onClick={() => navigate(section.link)}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className={`p-3 rounded-xl ${section.bg}`}>
                                    <section.icon className={`w-6 h-6 ${section.color}`} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-slate-800">{section.title}</CardTitle>
                                    <CardDescription className="text-slate-500 mt-1">{section.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end">
                                    <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-0 h-auto font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                        {section.action} <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
