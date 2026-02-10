import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error("404 Error: Non-existent route:", location.pathname);
  }, [location.pathname]);

  const getDashboardLink = () => {
    if (user?.role === 'Admin') return '/admin';
    if (user?.role === 'Client') return '/client';
    if (user?.role === 'Developer') return '/developer';
    return '/';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <p className="text-sm text-gray-500 mb-6">Requested URL: {location.pathname}</p>

        <div className="flex flex-col gap-3 justify-center items-center">
          <a href={getDashboardLink()} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors">
            Go to My Dashboard
          </a>
          <a href="/" className="text-sm text-primary underline hover:text-primary/90">
            Return to Landing Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
