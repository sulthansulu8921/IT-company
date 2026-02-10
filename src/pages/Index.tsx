import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DeveloperCard } from "@/components/DeveloperCard";
import { ServiceCard } from "@/components/ServiceCard";
import { Code, Smartphone, ShoppingCart, TrendingUp, Palette, Wallpaper } from "lucide-react";
import heroBg from "@/assets/hero-bg.webp";
import dev1 from "@/assets/developer-1.jpg";
import dev2 from "@/assets/developer-2.jpg";
import dev3 from "@/assets/developer-3.jpg";
import bg1 from "@/assets/bg1.jpeg"
import { ArrowRight, Sparkles } from "lucide-react";


const Index = () => {
  const services = [
    {
      icon: Code,
      title: "Web Development",
      description: "Custom websites and web applications built with modern technologies",
    },
    {
      icon: Smartphone,
      title: "Mobile Apps",
      description: "Native and cross-platform mobile applications for iOS and Android",
    },
    {
      icon: ShoppingCart,
      title: "E-commerce Solutions",
      description: "Complete online stores with payment integration and inventory management",
    },
    {
      icon: TrendingUp,
      title: "Digital Marketing",
      description: "SEO, social media marketing, and online advertising campaigns",
    },
    {
      icon: Palette,
      title: "Branding & Design",
      description: "Exclusive logo design, refined brand identity creation, and elegant creative visual solutions. ",
    },
    {
      icon: Wallpaper,
      title: "UI/UX Design",
      description: "UI/UX Design makes websites and apps look good, easy to use, and smooth for every user",
    },
  ];

  const sampleDevelopers = [
    // {
    //   name: "Alex Johnson",
    //   skills: ["React", "Node.js", "TypeScript"],
    //   experience: "5+ years in Full-Stack Development",
    //   image: dev1,
    //   hourlyRate: 85,
    // },
    // {
    //   name: "Sarah Martinez",
    //   skills: ["Python", "Django", "PostgreSQL"],
    //   experience: "4+ years in Backend Development",
    //   image: dev2,
    //   hourlyRate: 75,
    // },
    // {
    //   name: "Michael Chen",
    //   skills: ["React Native", "Flutter", "iOS"],
    //   experience: "6+ years in Mobile Development",
    //   image: dev3,
    //   hourlyRate: 90,
    // },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={bg1}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 tech-grid-bg opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="animate-fade-in">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                India's Next-Gen IT Platform
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              Build Fast. Build Smart.
              <br />
              <span className="gradient-text">Build With InvoTech.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
              India's next-gen IT partner connecting skilled developers with growing
              businesses.
            </p>

            {/* Buttons */}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/login">
                <Button size="lg" className="gradient-hero text-white shadow-large w-full sm:w-auto">
                  Join as Developer
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth/register/client">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Hire Developers
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-5" />
      </section>


      {/* Services Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions tailored to your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <ServiceCard {...service} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Developers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">Meet Our Developers</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Talented professionals ready to bring your projects to life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleDevelopers.map((developer, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                <DeveloperCard {...developer} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/auth/login">
              <Button size="lg" variant="outline">
                View All Developers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of developers and clients building amazing projects together
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register/client">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Post a Project
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
                Find Work
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;