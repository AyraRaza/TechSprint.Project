import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, Briefcase, TrendingUp, LogOut, MapPin, DollarSign, Clock, Settings, BarChart3, FileText, Plus, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getHRHiringPosts, createHiringPost, deleteHiringPost } from '@/services/firebaseService';
import { uploadImage } from '@/services/imageUpload';
import { HiringPost } from '@/types/interview';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const HRDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = React.useState<HiringPost[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    salaryRange: '',
    requirements: '',
    responsibilities: '',
  });

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
        imageUrl = await uploadImage(selectedFile);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-900/50 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">HR Dashboard</h1>
                <p className="text-sm text-gray-400">Welcome back, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/hr/my-posts')} className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                <FileText className="w-4 h-4 mr-2" />
                My Posts
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" onClick={handleLogout} className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Company Info */}
          <div className="mb-8">
            <Card className="bg-gray-800/70 backdrop-blur-xl border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-400">
                  <Building className="w-5 h-5 mr-2" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/30">
                    <p className="text-sm font-medium text-gray-400 mb-1">Company</p>
                    <p className="text-lg font-semibold text-white">{user.companyName}</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/30">
                    <p className="text-sm font-medium text-gray-400 mb-1">Company Size</p>
                    <p className="text-lg font-semibold text-white">{user.companySize}</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/30">
                    <p className="text-sm font-medium text-gray-400 mb-1">Your Role</p>
                    <p className="text-lg font-semibold text-white">{user.hrRole}</p>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/30">
                    <p className="text-sm font-medium text-gray-400 mb-1">Email</p>
                    <p className="text-lg font-semibold text-white">{user.email}</p>
                  </div>
                </div>
                {(user.companyWebsite || user.linkedin) && (
                  <div className="mt-4 flex space-x-4">
                    {user.companyWebsite && (
                      <a
                        href={user.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center"
                      >
                        🌐 Company Website
                      </a>
                    )}
                    {user.linkedin && (
                      <a
                        href={user.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center"
                      >
                        💼 LinkedIn Profile
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800/70 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/50 transition-colors shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Interviews</CardTitle>
                <Briefcase className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">0</div>
                <p className="text-xs text-gray-500 mt-1">
                  Interviews conducted
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/70 backdrop-blur-xl border-gray-700/50 hover:border-green-500/50 transition-colors shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Active Candidates</CardTitle>
                <Users className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">0</div>
                <p className="text-xs text-gray-500 mt-1">
                  In hiring process
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/70 backdrop-blur-xl border-gray-700/50 hover:border-purple-500/50 transition-colors shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">0%</div>
                <p className="text-xs text-gray-500 mt-1">
                  Interview completion rate
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/70 backdrop-blur-xl border-gray-700/50 hover:border-orange-500/50 transition-colors shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Avg. Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">0.0</div>
                <p className="text-xs text-gray-500 mt-1">
                  Candidate performance
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Card className="bg-gray-800/70 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/50 transition-colors shadow-xl cursor-pointer group">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Plus className="w-5 h-5 mr-2 text-blue-400 group-hover:scale-110 transition-transform" />
                      Create Hiring Post
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Post a new job opening and find the best talent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                      Create New Post
                    </Button>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Create Hiring Post</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Fill in the details for the new job opening.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Senior Frontend Developer"
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g. New York, NY or Remote"
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Type</Label>
                      <Select onValueChange={handleSelectChange} defaultValue={formData.jobType}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700 text-white">
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salaryRange">Salary</Label>
                      <Input
                        id="salaryRange"
                        name="salaryRange"
                        value={formData.salaryRange}
                        onChange={handleInputChange}
                        placeholder="e.g. $80k - $120k"
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the role..."
                      className="bg-gray-800 border-gray-700 min-h-[80px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requirements">Requirements</Label>
                      <Textarea
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleInputChange}
                        placeholder="One per line..."
                        className="bg-gray-800 border-gray-700 min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responsibilities">Responsibilities</Label>
                      <Textarea
                        id="responsibilities"
                        name="responsibilities"
                        value={formData.responsibilities}
                        onChange={handleInputChange}
                        placeholder="One per line..."
                        className="bg-gray-800 border-gray-700 min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Job Banner</Label>
                    <Label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-400">Click to upload hiring banner</p>
                        </div>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Label>
                  </div>

                  <DialogFooter className="sticky bottom-0 bg-gray-900 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-700">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Post'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Card className="bg-gray-800/70 backdrop-blur-xl border-gray-700/50 hover:border-purple-500/50 transition-colors shadow-xl cursor-pointer group" onClick={() => navigate('/hr/my-posts')}>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <FileText className="w-5 h-5 mr-2 text-purple-400 group-hover:scale-110 transition-transform" />
                  My Posts
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage all your created job openings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-purple-600/50 text-purple-400 hover:bg-purple-600/10 hover:border-purple-500">
                  View My Posts
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/70 backdrop-blur-xl border-gray-700/50 hover:border-green-500/50 transition-colors shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Users className="w-5 h-5 mr-2 text-green-400" />
                  Candidate Pool
                </CardTitle>
                <CardDescription className="text-gray-400">
                  View and manage candidates in your hiring pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-green-600/50 text-green-400 hover:bg-green-600/10 hover:border-green-500">
                  View Candidates
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Active Hiring Posts */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
              Your Active Hiring Posts
            </h2>
            {posts.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700/50 p-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-900/50 flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No active posts yet</h3>
                <p className="text-gray-400">Your job openings will appear here once they are created.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <Card key={post.id} className="bg-gray-800/70 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/30 transition-all shadow-xl overflow-hidden">
                    {post.imageUrl && (
                      <div className="w-full h-48 overflow-hidden">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title} 
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold text-white">{post.title}</CardTitle>
                          <CardDescription className="text-blue-400 font-medium">{post.companyName}</CardDescription>
                        </div>
                        <div className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full border border-green-500/20">
                          {post.status.toUpperCase()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                          {post.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-500" />
                          {post.jobType}
                        </div>
                        {post.salaryRange && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                            {post.salaryRange}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-3">{post.description}</p>
                      <div className="pt-4 border-t border-gray-700/50 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Posted on {post.createdAt.toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                            View Details
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700/50 py-12 bg-gray-900/50 backdrop-blur-md mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">PrepBot HR</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} PrepBot. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HRDashboard;
