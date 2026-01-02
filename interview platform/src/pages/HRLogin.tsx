import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Building, ArrowLeft, Loader2, Mail, Lock, Eye, EyeOff, Shield, BarChart, Users } from 'lucide-react';

const HRLogin = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (shouldNavigate && user) {
      if (user.role === 'HR') {
        navigate('/hr/dashboard', { replace: true });
      } else {
        toast({ 
          title: 'Access Denied', 
          description: 'This login is for HR professionals only.', 
          variant: 'destructive' 
        });
        setShouldNavigate(false);
      }
    }
  }, [user, shouldNavigate, navigate, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      setShouldNavigate(true);
    } else {
      toast({ title: 'Login failed', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Building size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            HR Portal
          </span>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="border-slate-600 hover:bg-slate-800 hover:text-white text-slate-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-88px)]">
        {/* Left Side - HR Features */}
        <div className="hidden lg:flex flex-1 flex-col justify-center p-12">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Streamline Your
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Hiring Process
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-10">
              Access powerful AI tools to screen candidates, conduct automated interviews, 
              and find the perfect fit for your team.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: <Users className="text-indigo-400" />, title: "Candidate Management", desc: "Track and manage all your applicants in one place" },
                { icon: <Shield className="text-emerald-400" />, title: "Unbiased Screening", desc: "Objective AI-driven assessment of technical skills" },
                { icon: <BarChart className="text-purple-400" />, title: "Detailed Analytics", desc: "Comprehensive reports on candidate performance" },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm">
                  <div className="p-3 bg-white/10 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{feature.title}</h3>
                    <p className="text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - HR Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <Card className="w-full max-w-md bg-slate-800/70 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardHeader className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold mb-2 text-white">HR Sign In</CardTitle>
                <CardDescription className="text-slate-400">
                  Access your organization's recruitment dashboard
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-slate-300">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="hr@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-base transition-all hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In to HR Dashboard'
                  )}
                </Button>
              </form>

              <div className="relative">
                <Separator className="bg-slate-600" />
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm text-slate-400">
                  Don't have an HR account?{' '}
                  <button
                    onClick={() => navigate('/hr/signup')}
                    className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                  >
                    Register your company
                  </button>
                </p>
                <Separator className="bg-slate-700/50" />
                <p className="text-xs text-slate-500">
                  Are you a candidate?{' '}
                  <button
                    onClick={() => navigate('/auth')}
                    className="text-slate-400 hover:text-white underline"
                  >
                    Go to Candidate Login
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HRLogin;
