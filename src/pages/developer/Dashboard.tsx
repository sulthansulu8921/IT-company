import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Loader2,
    Plus,
    Search,
    MoreHorizontal,
    Globe,
    Terminal,
    CheckCircle2,
} from "lucide-react";
import api from "@/lib/axios";

const DeveloperDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [developer, setDeveloper] = useState<any>(null);
    const [availableProjects, setAvailableProjects] = useState<any[]>([]);
    const [myApplications, setMyApplications] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await api.get('/developers/dashboard');

            const data = res.data;

            setProfile(data.profile || null);
            setDeveloper(data.developer || null);
            setAvailableProjects(data.availableProjects || []);
            // Determine if applications are approved or pending to simulate "Service Status"
            setMyApplications(data.myApplications || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load dashboard. Ensure backend is running.");
            // Don't redirect on error instantly, allows user to see the dashboard shell at least? 
            // Actually previous behavior was redirect to auth. let's keep it safe.
            // navigate("/auth");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (projectId: string) => {
        try {
            await api.post('/applications/', { project: projectId });

            toast.success("Application submitted!");
            loadDashboard();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to apply");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Combine applications and available projects for the "Services" view
    // In a real scenario, "Services" would be the projects the developer is WORKING on.
    // "Projects" would be the marketplace.
    // For this design, let's map "My Applications" as "My Services".

    const services = myApplications.map(app => ({
        id: app.id,
        name: app.project.title,
        type: "Full Stack", // Placeholder
        status: app.status === "approved" ? "Deployed" : app.status,
        region: "Oregon", // Placeholder
        updated: "26min", // Placeholder
        runtime: "Node", // Placeholder
    }));

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            <Sidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-[1200px] mx-auto p-8">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                                + Invite your team
                            </Button>
                            <Button className="bg-white text-zinc-950 hover:bg-zinc-200 font-semibold shadow-sm">
                                + New
                            </Button>
                        </div>
                    </div>

                    {/* Projects Section */}
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold mb-4">Projects</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Active Project Card */}
                            <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors"></div>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg font-medium group-hover:text-primary transition-colors">
                                                My Portfolio
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                Personal portfolio site
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            All services are up and running
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Create New Project Card */}
                            <button className="flex items-center justify-center h-[140px] border border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-card/50 transition-all group">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground">
                                    <Plus className="h-6 w-6" />
                                    <span className="font-medium">Create new project</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Ungrouped Services Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <h2 className="text-xl font-semibold">Ungrouped Services</h2>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 rounded-full px-3 py-1">
                                        Active ({services.length})
                                    </Badge>
                                    <Badge variant="outline" className="text-muted-foreground hover:bg-muted/50 rounded-full px-3 py-1">
                                        Suspended (0)
                                    </Badge>
                                    <Badge variant="outline" className="text-muted-foreground hover:bg-muted/50 rounded-full px-3 py-1">
                                        All ({services.length})
                                    </Badge>
                                </div>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search services..."
                                    className="pl-9 bg-card/50 border-border focus:ring-primary/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="rounded-lg border border-border bg-card over">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="w-[300px] text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-6">Service Name</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Runtime</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Region</TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Updated</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                No active services found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        services
                                            .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((service) => (
                                                <TableRow key={service.id} className="cursor-pointer hover:bg-muted/30 border-border group">
                                                    <TableCell className="font-medium pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded bg-background border border-border">
                                                                {service.type === "Static" ? <Globe className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
                                                            </div>
                                                            <span className="font-semibold group-hover:text-primary transition-colors underline-offset-4 group-hover:underline decoration-primary/50">
                                                                {service.name}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {service.status === 'Deployed' ? (
                                                            <Badge className="bg-green-500/15 text-green-400 hover:bg-green-500/25 border-0 font-medium tracking-wide text-[11px] uppercase rounded-sm px-2">
                                                                <CheckCircle2 className="w-3 h-3 mr-1.5" />
                                                                Deployed
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="text-[11px] uppercase rounded-sm px-2 tracking-wide font-medium">
                                                                {service.status}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-muted-foreground bg-background border-border font-mono text-[10px] uppercase">
                                                            {service.runtime}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{service.region}</TableCell>
                                                    <TableCell className="text-muted-foreground">{service.updated}</TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Marketplace / Available Projects Section (repurposed for this view) */}
                    <div className="mt-12 mb-12">
                        <h2 className="text-xl font-semibold mb-4">Marketplace (Available Projects)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableProjects?.map((p) => (
                                <Card key={p.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base">{p.title}</CardTitle>
                                            <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
                                        </div>
                                        <CardDescription className="line-clamp-2 mt-2">{p.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="text-sm text-muted-foreground font-mono">
                                                ${p.budget_min} - ${p.budget_max}
                                            </div>
                                            <Button size="sm" onClick={() => handleApply(p.id)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                                Apply
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default DeveloperDashboard;
