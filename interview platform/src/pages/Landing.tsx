import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import {
  ArrowRight,
  Brain,
  Target,
  TrendingUp,
  Mic,
  MessageSquare,
  BarChart3,
  Sparkles,
  ChevronRight,
  Code,
  Cpu,
  Globe,
  Cloud,
  Smartphone,
  Database,
  Star,
  Award,
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-30" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse-glow" />

      {/* Navigation */}
      <nav className="relative z-50 bg-gray-800/30 backdrop-blur-xl border-b border-gray-700/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo />
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/auth">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700/50">
                  Sign In
                </Button>
              </Link>
              <Link to="/hr/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700/50">
                  HR Portal
                </Button>
              </Link>
              <Link to="/setup">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6">
                  Start Free Trial
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-slide-up">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">
              AI-Powered Interview Practice
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 animate-slide-up animation-delay-100">
            Master Your Next
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 mt-4">
              Technical Interview
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up animation-delay-200">
            Practice with an AI interviewer that adapts to your role, provides
            real-time feedback, and helps you build confidence for the real
            thing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-300">
            <Link to="/setup">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg glow-effect"
              >
                Start Free Practice
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg border-border/50"
              >
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto mt-24 animate-in fade-in slide-in-from-bottom-5 delay-300">
          {[
            { value: "10K+", label: "Practice Sessions" },
            { value: "95%", label: "Improvement Rate" },
            { value: "50+", label: "Job Roles" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform combines AI technology with proven interview techniques
            to give you the edge.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "AI Question Generation",
              description:
                "Dynamic questions tailored to your target role and experience level.",
            },
            {
              icon: Mic,
              title: "Voice & Text Responses",
              description:
                "Practice answering via voice or text, just like real interviews.",
            },
            {
              icon: Target,
              title: "Real-time Feedback",
              description:
                "Get instant analysis on clarity, relevance, and communication.",
            },
            {
              icon: BarChart3,
              title: "Performance Analytics",
              description:
                "Track your progress with detailed insights and skill breakdowns.",
            },
            {
              icon: MessageSquare,
              title: "STAR Format Training",
              description: "Learn to structure behavioral answers effectively.",
            },
            {
              icon: TrendingUp,
              title: "Improvement Tracking",
              description:
                "See your growth over time with comprehensive analytics.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-white transition-colors">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="flex items-center text-sm text-gray-400 group-hover:text-gray-300">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Learn more about this feature
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">Supporting Top Tech Roles</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We cover the most in-demand technical roles with specialized interview preparation
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { name: 'Frontend', icon: <Code className="h-8 w-8" />, color: 'from-blue-500 to-blue-600' },
            { name: 'Backend', icon: <Cpu className="h-8 w-8" />, color: 'from-green-500 to-green-600' },
            { name: 'Full Stack', icon: <Globe className="h-8 w-8" />, color: 'from-purple-500 to-purple-600' },
            { name: 'DevOps', icon: <Cloud className="h-8 w-8" />, color: 'from-amber-500 to-amber-600' },
            { name: 'Mobile', icon: <Smartphone className="h-8 w-8" />, color: 'from-red-500 to-red-600' },
            { name: 'Data Eng', icon: <Database className="h-8 w-8" />, color: 'from-cyan-500 to-cyan-600' },
          ].map((tech, i) => (
            <div key={i} className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center hover:border-gray-600 transition-colors">
              <div className={`w-14 h-14 bg-gradient-to-r ${tech.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <div className="text-white">{tech.icon}</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{tech.name}</h3>
              <p className="text-muted-foreground text-sm">
                Specialized interview preparation for {tech.name} roles
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <h3 className="text-3xl font-bold mb-4">Trusted by Developers Worldwide</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join thousands of developers who have transformed their interview skills
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Chen", role: "Senior Frontend Dev", company: "TechCorp", text: "Landed my dream job after 2 weeks of practice!" },
              { name: "Alex Rodriguez", role: "Backend Engineer", company: "StartupXYZ", text: "The AI feedback helped me identify weaknesses I didn't know I had." },
              { name: "Priya Sharma", role: "Full Stack Developer", company: "GlobalTech", text: "From 5 rejections to 3 offers in one month." },
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-900/50 rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role} • {testimonial.company}</div>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.text}"</p>
                <div className="flex items-center mt-6 pt-6 border-t border-gray-700/50">
                  <Award className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-sm text-gray-400">Success Story</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HR Portal Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 md:p-16 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-8">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-sm text-slate-400">
                  For HR Teams
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Elevate Your Hiring Process
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                Use HireBotics's AI-powered interview platform to screen candidates, assess technical skills, and make data-driven hiring decisions.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  "AI-powered candidate screening",
                  "Standardized interview assessments",
                  "Real-time candidate analytics",
                  "Reduce hiring bias with objective scoring",
                  "Track hiring metrics and ROI"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center text-slate-300">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link to="/hr/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8"
                >
                  Sign Up for HR Portal
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Save Time", value: "70%" },
                { label: "Reduce Bias", value: "AI" },
                { label: "Better Hires", value: "3x" },
                { label: "Feedback", value: "Real-time" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors">
                  <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-2">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-xl border border-blue-700/30 rounded-3xl p-16 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl mb-8 mx-auto">
              <Brain className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of job seekers who have improved their interview
              skills with our AI platform.
            </p>
            <Link to="/setup">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 glow-effect"
              >
                Start Practicing Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
        </div>
      </footer>
    </div>
  );
};

export default Landing;