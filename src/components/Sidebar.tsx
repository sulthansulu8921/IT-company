import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutGrid,
    Box,
    Layers,
    Activity,
    Webhook,
    Bell,
    Network,
    CreditCard,
    Settings,
    FileText,
    Users,
    MessageSquare,
    BarChart,
    LogOut,
    ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {
            title: "Projects",
            icon: LayoutGrid,
            path: "/developer-dashboard",
            variant: "default",
        },
        {
            title: "Blueprints",
            icon: Layers,
            path: "/blueprints",
            variant: "ghost",
        },
        {
            title: "Environment Groups",
            icon: Box,
            path: "/env-groups",
            variant: "ghost",
        },
    ];

    const integrationItems = [
        { title: "Observability", icon: Activity, path: "/observability" },
        { title: "Webhooks", icon: Webhook, path: "/webhooks" },
        { title: "Notifications", icon: Bell, path: "/notifications" },
    ];

    const networkingItems = [
        { title: "Private Links", icon: Network, path: "/private-links" },
    ];

    const workspaceItems = [
        { title: "Billing", icon: CreditCard, path: "/billing" },
        { title: "Settings", icon: Settings, path: "/settings" },
    ];

    return (
        <div className={cn("w-64 border-r bg-card/30 min-h-screen flex flex-col", className)}>
            {/* Workspace Selector */}
            <div className="p-4 border-b border-border/40">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between px-2 hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                                    M
                                </div>
                                <span className="font-medium text-sm">My Workspace</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuItem>Subscription</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-3 mb-6">
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Button
                                key={item.title}
                                variant={location.pathname === item.path ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    location.pathname === item.path && "bg-primary/10 text-primary hover:bg-primary/20"
                                )}
                                onClick={() => navigate(item.path)}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.title}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="px-3 mb-6">
                    <h4 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
                        INTEGRATIONS
                    </h4>
                    <div className="space-y-1">
                        {integrationItems.map((item) => (
                            <Button
                                key={item.title}
                                variant="ghost"
                                className="w-full justify-start text-muted-foreground hover:text-foreground"
                                onClick={() => navigate(item.path)}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.title}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="px-3 mb-6">
                    <h4 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
                        NETWORKING
                    </h4>
                    <div className="space-y-1">
                        {networkingItems.map((item) => (
                            <Button
                                key={item.title}
                                variant="ghost"
                                className="w-full justify-start text-muted-foreground hover:text-foreground"
                                onClick={() => navigate(item.path)}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.title}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="px-3 mb-6">
                    <h4 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground">
                        WORKSPACE
                    </h4>
                    <div className="space-y-1">
                        {workspaceItems.map((item) => (
                            <Button
                                key={item.title}
                                variant="ghost"
                                className="w-full justify-start text-muted-foreground hover:text-foreground"
                                onClick={() => navigate(item.path)}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.title}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-border/40">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/auth");
                    }}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                </Button>
            </div>
        </div>
    );
}
