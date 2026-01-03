import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, Users, Briefcase, TrendingUp, LogOut, MapPin, 
  DollarSign, Clock, Settings, BarChart3, FileText, Plus, 
  Image as ImageIcon, Loader2, Trash2, LayoutDashboard, 
  Search, Bell, Menu, X, ChevronRight, ExternalLink, Globe
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getHRHiringPosts, createHiringPost, deleteHiringPost, uploadHiringPostImage } from '@/services/firebaseService';
import { HiringPost } from '@/types/interview';
import Logo from '@/components/Logo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const HRDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [posts, setPosts] = React.useState<HiringPost[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    salaryRange: '',
    requirements: '',
    responsibilities: '',
  });

  const sidebarLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/hr/dashboard' },
    { name: 'My Posts', icon: FileText, path: '/hr/my-posts' },
    { name: 'Candidates', icon: Users, path: '/hr/applications' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, jobType: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      let imageUrl = '';
      if (selectedFile) {
        imageUrl = await uploadHiringPostImage(user.id, selectedFile);
      }

      await createHiringPost({
        hrId: user.id,
        companyName: user.companyName || 'Unknown Company',
        title: formData.title,
        description: formData.description,
        location: formData.location,
        jobType: formData.jobType,
        salaryRange: formData.salaryRange,
        requirements: formData.requirements.split('\n').filter(r => r.trim() !== ''),
        responsibilities: formData.responsibilities.split('\n').filter(r => r.trim() !== ''),
        imageUrl
      });

      toast.success('Hiring post created successfully!');
      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        jobType: 'Full-time',
        salaryRange: '',
        requirements: '',
        responsibilities: '',
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create hiring post.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  React.useEffect(() => {
    if (user?.id) {
      loadPosts();
    }
  }, [user]);

  React.useEffect(() => {
    if (location.state?.openDialog) {
      setIsDialogOpen(true);
      // Clear state to avoid reopening on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const loadPosts = async () => {
    if (!user) return;
    try {
      const hrPosts = await getHRHiringPosts(user.id);
      setPosts(hrPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteHiringPost(postId);
      toast.success('Post deleted successfully');
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-[#111827] border-r border-slate-800 transition-all duration-300 z-50 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6">
          <Logo showText={isSidebarOpen} />
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {sidebarLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                location.pathname === link.path 
                  ? "bg-blue-600/10 text-blue-400" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
              )}
            >
              <link.icon className={cn(
                "w-5 h-5",
                location.pathname === link.path ? "text-blue-400" : "group-hover:text-slate-100"
              )} />
              {isSidebarOpen && <span className="font-medium">{link.name}</span>}
              {isSidebarOpen && location.pathname === link.path && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header className="h-20 bg-[#111827]/50 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#111827]" />
            </button>
            <Separator orientation="vertical" className="h-8 bg-slate-800" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-500">{user.hrRole}</p>
              </div>
              <Avatar className="w-10 h-10 border-2 border-slate-800 ring-2 ring-blue-500/20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-blue-600 text-white font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Area */}
        <main className="flex-1 overflow-y-auto bg-[#0B0F1A] p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Overview</h2>
                <p className="text-slate-400 mt-1">Manage your recruitment process and company profile.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 px-6 h-11 rounded-xl flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Post New Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[650px] bg-[#111827] border-slate-800 text-slate-200">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-white">Create Job Opportunity</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Specify the role requirements and details to attract top candidates.
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[80vh] px-1">
                      <form onSubmit={handleSubmit} className="space-y-6 py-6 pr-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">Job Title</Label>
                            <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Full Stack Developer" className="bg-slate-900 border-slate-800 h-11 focus:ring-blue-500" required />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">Location</Label>
                            <Input name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Remote / San Francisco" className="bg-slate-900 border-slate-800 h-11" required />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">Job Type</Label>
                            <Select onValueChange={handleSelectChange} defaultValue={formData.jobType}>
                              <SelectTrigger className="bg-slate-900 border-slate-800 h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-800">
                                <SelectItem value="Full-time">Full-time</SelectItem>
                                <SelectItem value="Part-time">Part-time</SelectItem>
                                <SelectItem value="Contract">Contract</SelectItem>
                                <SelectItem value="Internship">Internship</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">Salary Range</Label>
                            <Input name="salaryRange" value={formData.salaryRange} onChange={handleInputChange} placeholder="e.g. $120k - $150k" className="bg-slate-900 border-slate-800 h-11" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Job Description</Label>
                          <Textarea name="description" value={formData.description} onChange={handleInputChange} className="bg-slate-900 border-slate-800 min-h-[120px]" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">Key Requirements (one per line)</Label>
                            <Textarea name="requirements" value={formData.requirements} onChange={handleInputChange} className="bg-slate-900 border-slate-800 min-h-[100px]" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">Responsibilities (one per line)</Label>
                            <Textarea name="responsibilities" value={formData.responsibilities} onChange={handleInputChange} className="bg-slate-900 border-slate-800 min-h-[100px]" />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-slate-300">Hiring Banner</Label>
                          <div 
                            onClick={() => document.getElementById('job-image')?.click()}
                            className="w-full h-32 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 transition-all bg-slate-900/50 group"
                          >
                            {previewUrl ? (
                              <img src={previewUrl} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <>
                                <ImageIcon className="w-8 h-8 text-slate-500 mb-2 group-hover:text-blue-500 transition-colors" />
                                <span className="text-xs text-slate-500 font-medium">Click to upload banner image</span>
                              </>
                            )}
                            <input id="job-image" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800">Cancel</Button>
                          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 h-11 px-8 rounded-xl">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Posting'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Interviews', value: '0', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Active Candidates', value: '0', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'Success Rate', value: '0%', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                { label: 'Avg. Score', value: '0.0', icon: BarChart3, color: 'text-orange-400', bg: 'bg-orange-400/10' },
              ].map((stat, i) => (
                <Card key={i} className="bg-[#111827] border-slate-800/50 shadow-sm p-6 hover:translate-y-[-2px] transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
                    </div>
                    <div className={cn("p-3 rounded-xl", stat.bg)}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>0% from last month</span>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Active Jobs Table/List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    Active Postings
                  </h3>
                  <Button variant="link" className="text-blue-400 p-0 h-auto" onClick={() => navigate('/hr/my-posts')}>
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="bg-[#111827] border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center">
                      <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                        <Briefcase className="w-10 h-10 text-slate-700" />
                      </div>
                      <h4 className="text-white font-semibold text-lg">No active jobs</h4>
                      <p className="text-slate-500 max-w-xs mx-auto mt-2">Ready to grow your team? Create your first hiring post to start receiving applications.</p>
                      <Button 
                        variant="outline" 
                        className="mt-6 border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl h-11 px-8"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        Create Your First Post
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {posts.slice(0, 4).map((post) => (
                        <Card key={post.id} className="bg-[#111827] border-slate-800/50 p-5 group hover:border-slate-700 transition-all duration-300">
                          <div className="flex gap-6 items-center">
                            {post.imageUrl ? (
                              <img src={post.imageUrl} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-900" />
                            ) : (
                              <div className="w-24 h-24 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800">
                                <Building className="w-10 h-10 text-slate-700" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-lg font-bold text-white truncate">{post.title}</h4>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10">Active</Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {post.location}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.jobType}</span>
                                {post.salaryRange && <span className="flex items-center gap-1 font-medium text-slate-400"><DollarSign className="w-3.5 h-3.5" /> {post.salaryRange}</span>}
                              </div>
                              <div className="mt-3 flex items-center gap-2">
                                <p className="text-xs text-slate-600 uppercase tracking-widest font-bold">Applications: 0</p>
                                <Separator orientation="vertical" className="h-3 bg-slate-800" />
                                <p className="text-xs text-slate-600">Posted: {post.createdAt.toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white hover:bg-slate-800" onClick={() => navigate(`/hr/my-posts`)}>
                                <ChevronRight className="w-5 h-5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500/70 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDeletePost(post.id)}>
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Cards */}
              <div className="space-y-8">
                {/* Company Info Card */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-purple-500" />
                    Organization
                  </h3>
                  <Card className="bg-[#111827] border-slate-800/50 p-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full -mr-16 -mt-16" />
                    <div className="relative z-10 flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                        {user.companyName?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white leading-tight">{user.companyName}</h4>
                        <p className="text-slate-500 text-sm">Corporate Account</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Industry Size</span>
                        <span className="text-slate-200 font-medium">{user.companySize} employees</span>
                      </div>
                      <Separator className="bg-slate-800/50" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Current Role</span>
                        <span className="text-slate-200 font-medium">{user.hrRole}</span>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-2">
                      {user.companyWebsite && (
                        <a href={user.companyWebsite} target="_blank" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-all">
                          Visit Website <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Quick Shortcuts */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-400" />
                    Shortcuts
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => navigate('/hr/applications')} className="p-4 bg-[#111827] border border-slate-800/50 rounded-2xl hover:bg-slate-800/50 transition-all text-left group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5 text-emerald-500" />
                      </div>
                      <span className="text-sm font-bold text-white">Candidates</span>
                    </button>
                    <button onClick={() => navigate('/hr/my-posts')} className="p-4 bg-[#111827] border border-slate-800/50 rounded-2xl hover:bg-slate-800/50 transition-all text-left group">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5 text-purple-500" />
                      </div>
                      <span className="text-sm font-bold text-white">Archives</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HRDashboard;
