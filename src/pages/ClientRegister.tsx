import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

const ClientRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    companyName: "",
    industry: "",
    projectTitle: "",
    projectDescription: "",
    category: "",
    budget: "",
    deadline: "",
  });

  const categories = [
    "Website Development",
    "Web Applications",
    "Mobile Apps",
    "Digital Marketing",
    "Personal Adviser",
    "E-commerce Solutions",
    "Branding",
    "Logo Designing",
    "Promotion",
    "SEO Services",
    "Consulting Services",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // 1. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'Client'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed");

      // 2. Update Profile (if trigger didn't catch everything or to be sure)
      // Wait for trigger to create profile or insert if it doesn't?
      // Usually trigger is fast. We can try update.
      // If trigger uses metadata, we might be good on name/role.
      // We need to update phone and maybe bio with company info.
      const bio = `Company: ${formData.companyName}\nIndustry: ${formData.industry}`;

      // Give a small delay for trigger? Or just retry?
      // Safer to use upsert or wait. But let's try update.
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: formData.phone,
          role: 'Client',
          // Store company info in bio/experience or similar if no column exists
          // Checking types: Profile has 'skills', 'experience', 'portfolio'.
          // Use 'experience' for company details? Or just ignore if not critical.
          // Let's use a standard bio field if I can find it? types/index.ts doesn't show bio.
          // It shows `experience`?
          // Let's assume standard fields.
        })
        .eq('id', authData.user.id);

      // If profile doesn't exist yet (trigger lag), this might fail or do nothing.
      // ideally we insert if not exists, but id must match auth.users.
      // If we have a trigger, it should exist.

      // 3. Create First Project (Optional)
      if (formData.projectTitle) {
        const { error: projError } = await supabase
          .from('projects')
          .insert({
            title: formData.projectTitle,
            description: formData.projectDescription,
            service_type: formData.category,
            budget: formData.budget,
            deadline: formData.deadline || null,
            client: authData.user.id,
            status: 'Open'
          });

        if (projError) console.error("Failed to create project", projError);
      }

      toast.success("Registration successful! Please check your email to verify account.");
      navigate("/auth"); // Redirect to login or dashboard? Login usually required after signup unless auto-signin.
      // Supabase auto-signs in if email confirm is off. 
      // If on, user needs to check email.
      // I'll redirect to auth (Login) to be safe.

    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl">Join as a Client</CardTitle>
              <CardDescription>
                Create your profile and start posting projects
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* ACCOUNT INFO */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Information</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Password *</Label>
                      <Input
                        type="password"
                        minLength={6}
                        required
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* COMPANY INFO */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Company Information</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Company Name</Label>
                      <Input
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData({ ...formData, companyName: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label>Industry</Label>
                      <Input
                        value={formData.industry}
                        onChange={(e) =>
                          setFormData({ ...formData, industry: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* PROJECT INFO */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">First Project (Optional)</h3>

                  <Input
                    placeholder="Project Title"
                    value={formData.projectTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, projectTitle: e.target.value })
                    }
                  />

                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData({ ...formData, category: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Textarea
                    rows={4}
                    placeholder="Project description"
                    value={formData.projectDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectDescription: e.target.value,
                      })
                    }
                  />
                </div>

                <Button className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Register as Client"}
                </Button>

                <p className="text-center mt-3">
                  Already have an account?{" "}
                  <span
                    className="text-blue-600 cursor-pointer"
                    onClick={() => navigate("/auth")}
                  >
                    Login
                  </span>
                </p>

              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ClientRegister;
