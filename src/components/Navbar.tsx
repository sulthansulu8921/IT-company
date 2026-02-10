import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import Logo1 from "@/assets/logo-2.png";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "About Us", to: "/about" },
    { name: "Contact", to: "/contact" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case UserRole.ADMIN: return "/admin";
      case UserRole.DEVELOPER: return "/developer";
      case UserRole.CLIENT: return "/client";
      default: return "/";
    }
  };

  return (
    <nav className="nav-bg fixed top-0 w-full backdrop-blur-xl border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={Logo1} alt="Logo" className="h-8" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div key={link.to} className="relative group">
                <Link
                  to={link.to}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>

                {location.pathname === link.to && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 -bottom-1 h-[2px] w-full bg-primary"
                  />
                )}
              </div>
            ))}

            {user ? (
              <>
                <Link to={getDashboardLink()}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background border-b border-border"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="block"
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <>
                <Link to={getDashboardLink()}>Dashboard</Link>
                <Button onClick={handleLogout} className="w-full" variant="outline">
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth/login">
                <Button className="w-full">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};
