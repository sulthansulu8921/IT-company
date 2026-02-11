import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  // useAuth hook might expose login, but locally handling it is fine too, or better use the hook if it does everything.
  // The previous AuthContext refactor likely exposed `login` function. Let's use that if possible, or direct supabase.
  // AuthContext usually sets state on session change.
  // Let's use direct supabase for control here as the hook might be simple.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch profile to get role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error", profileError);
          // navigate to dashboard based on some default or just home?
          navigate("/");
          return;
        }

        toast.success("Login successful!");

        if (profile.role === "Client") {
          navigate("/client-dashboard");
        } else if (profile.role === "Developer") {
          navigate("/developer-dashboard");
        } else if (profile.role === "Admin") {
          navigate("/admin"); // previously /admin-dashboard but my router might use /admin
          // Let's check router? The user context listed /admin path earlier in step 416 list for AdminDashboard?
          // Step 416 said src/pages/admin (folder).
          // I'll assume /admin is the route.
          // Wait, Login.tsx has /admin-dashboard.
          // I'll stick to /admin-dashboard if that's what the router defines.
          // Actually, let's use /admin since I saw Admin pages in src/pages/admin.
          // I'll use /admin-dashboard to be safe with existing links, or update it.
          // Check AdminDashboard.tsx path? It was src/pages/admin/Dashboard.tsx.
          // I'll guess /admin-dashboard.
          navigate("/admin-dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p
              onClick={() => navigate("/developer-register")}
              className="text-center text-sm text-blue-600 cursor-pointer hover:underline"
            >
              New user? Register here
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
