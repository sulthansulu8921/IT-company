import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRole } from "@/types";
import ErrorBoundary from "@/components/ErrorBoundary";

// Auth Pages
import Login from "@/pages/auth/Login";
import RegisterClient from "@/pages/auth/RegisterClient";
import RegisterDeveloper from "@/pages/auth/RegisterDeveloper";

// Dashboards (Placeholder for now)
import ClientDashboard from "@/pages/client/Dashboard";
import DeveloperDashboard from "@/pages/developer/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "@/pages/admin/UserManagement";
import AdminProjectList from "@/pages/admin/ProjectList";
import AdminApplicationsList from "@/pages/admin/ApplicationsList";
import AdminProjectDetail from "@/pages/admin/ProjectDetail";
import GlobalChat from "@/pages/messages/GlobalChat";
import Treasury from "@/pages/admin/Treasury";
import NotFound from "@/pages/NotFound";
import Index from "./pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register/client" element={<RegisterClient />} />
              <Route path="/auth/register/developer" element={<RegisterDeveloper />} />

              {/* Client Routes */}
              <Route element={<ProtectedRoute allowedRoles={[UserRole.CLIENT]} />}>
                <Route path="/client" element={<ClientDashboard />} />
                <Route path="/client/messages" element={<GlobalChat />} />
                <Route path="/client/*" element={<ClientDashboard />} />
              </Route>

              {/* Developer Routes */}
              <Route element={<ProtectedRoute allowedRoles={[UserRole.DEVELOPER]} />}>
                <Route path="/developer" element={<DeveloperDashboard />} />
                <Route path="/developer/messages" element={<GlobalChat />} />
                <Route path="/developer/*" element={<DeveloperDashboard />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/projects" element={<AdminProjectList />} />
                <Route path="/admin/applications" element={<AdminApplicationsList />} />
                <Route path="/admin/projects/:id" element={<AdminProjectDetail />} />
                <Route path="/admin/messages" element={<GlobalChat />} />
                <Route path="/admin/treasury" element={<Treasury />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
