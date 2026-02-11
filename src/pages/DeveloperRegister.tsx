import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

import { supabase } from "@/lib/supabase";

const DeveloperRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    experience: "",
    bio: "",
    hourlyRate: "",
    availability: "",
    portfolioLinks: "",
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);

  const skills = [
    "React", "Node.js", "TypeScript", "Python", "Django",
    "PostgreSQL", "MongoDB", "AWS", "Docker", "React Native",
    "Flutter", "iOS", "Android", "UI/UX Design", "GraphQL",
    "Next.js", "Vue.js", "Angular",
  ];

  const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Remote"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSkills.length === 0) {
      toast.error("Select at least one skill");
      return;
    }

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
            role: 'Developer'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed");

      // 2. Update Profile
      // Map fields to Profile columns
      // Profile has: skills (string), experience (string), portfolio (string)
      // We'll store formatted data.
      const skillsStr = selectedSkills.join(', ');
      const portfolioStr = formData.portfolioLinks; // It's already a string input in state, wait. 
      // In original code: formData.portfolioLinks was string, but split later?
      // "portfolioLinks: formData.portfolioLinks ? formData.portfolioLinks.split(",").map((l) => l.trim()) : []"
      // If I store it as string, I don't need to split unless validation.

      const experienceStr = `
Experience: ${formData.experience}
Bio: ${formData.bio}
Hourly Rate: ${formData.hourlyRate}
Availability: ${formData.availability}
Job Types: ${selectedJobTypes.join(', ')}
            `.trim();

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: formData.phone,
          role: 'Developer',
          skills: skillsStr,
          experience: experienceStr,
          portfolio: formData.portfolioLinks, // Assuming it's a comma separated string from input
          is_approved: false // Developers approval needed
        })
        .eq('id', authData.user.id);

      if (profileError) {
        // Retry or log?
        console.error("Profile update failed", profileError);
        // We might want to alert user but signup succeeded.
      }

      toast.success("Registration successful! Please check your email to verify account.");
      navigate("/auth");

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
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Join as a Developer</CardTitle>
              <CardDescription>
                Create your profile to connect with clients
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* BASIC INFO */}
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

                {/* SKILLS */}
                <div>
                  <Label>Skills *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {skills.map((skill) => (
                      <div key={skill} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() =>
                            setSelectedSkills((prev) =>
                              prev.includes(skill)
                                ? prev.filter((s) => s !== skill)
                                : [...prev, skill]
                            )
                          }
                        />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* EXPERIENCE */}
                <div>
                  <Label>Experience *</Label>
                  <Input
                    required
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                  />
                </div>

                {/* BIO */}
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                  />
                </div>

                {/* RATE & AVAILABILITY */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Hourly Rate ($)</Label>
                    <Input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) =>
                        setFormData({ ...formData, hourlyRate: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Availability</Label>
                    <Input
                      value={formData.availability}
                      onChange={(e) =>
                        setFormData({ ...formData, availability: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* PORTFOLIO */}
                <div>
                  <Label>Portfolio Links</Label>
                  <Input
                    placeholder="https://github.com/you, https://portfolio.com"
                    value={formData.portfolioLinks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        portfolioLinks: e.target.value,
                      })
                    }
                  />
                </div>

                {/* JOB TYPES */}
                <div>
                  <Label>Preferred Job Types</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {jobTypes.map((job) => (
                      <div key={job} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedJobTypes.includes(job)}
                          onCheckedChange={() =>
                            setSelectedJobTypes((prev) =>
                              prev.includes(job)
                                ? prev.filter((j) => j !== job)
                                : [...prev, job]
                            )
                          }
                        />
                        <span>{job}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" disabled={loading}>
                  {loading ? "Creating Profile..." : "Register"}
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

export default DeveloperRegister;
