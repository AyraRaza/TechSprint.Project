import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, MapPin, DollarSign, Clock, Briefcase, Brain, Home, Video, Users, Bell, ArrowRight, Search, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllHiringPosts } from '@/services/firebaseService';
import { HiringPost } from '@/types/interview';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitJobApplication } from '@/services/firebaseService';
import { uploadResume } from '@/services/imageUpload';
import { Loader2, FileText, Upload, X } from 'lucide-react';

const JobAlerts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = React.useState<HiringPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Application form state
  const [isApplyDialogOpen, setIsApplyDialogOpen] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState<HiringPost | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [applicationData, setApplicationData] = React.useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: ''
  });

  React.useEffect(() => {
    if (user) {
      setApplicationData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
    loadPosts();
  }, [user]);

  const handleApplyClick = (post: HiringPost) => {
    if (!user) {
      toast.error("Please sign in to apply for jobs");
      navigate('/auth');
      return;
    }
    setSelectedJob(post);
    setIsApplyDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !user || !resumeFile) {
      toast.error("Please complete all required fields and upload your resume");
      return;
    }

    setIsSubmitting(true);
    try {
      const resumeUrl = await uploadResume(resumeFile);
      
      await submitJobApplication({
        postId: selectedJob.id,
        hrId: selectedJob.hrId,
        candidateId: user.id,
        candidateName: applicationData.name,
        candidateEmail: applicationData.email,
        candidatePhone: applicationData.phone,
        resumeUrl: resumeUrl,
        coverLetter: applicationData.coverLetter,
        jobTitle: selectedJob.title
      });

      toast.success(`Application sent to ${selectedJob.companyName}!`);
      setIsApplyDialogOpen(false);
      setResumeFile(null);
      setApplicationData(prev => ({ ...prev, phone: '', coverLetter: '' }));
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadPosts = async () => {
    try {
      const allPosts = await getAllHiringPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-10">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  PrepBot
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link to="/setup" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                <Video className="h-5 w-5" />
                <span>Interviews</span>
              </Link>
              <Link to="/job-alerts" className="flex items-center space-x-2 text-blue-600 font-semibold">
                <Bell className="h-5 w-5" />
                <span>Job Alerts</span>
              </Link>
              <Link to="/profile" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                <Users className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2 text-gray-900 dark:text-white">Job Alerts</h1>
            <p className="text-muted-foreground">Discover new opportunities tailored for you.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search jobs, companies..." 
                className="pl-10 w-[300px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="border-gray-200 dark:border-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Loading latest job alerts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No job alerts yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {searchTerm ? "We couldn't find any jobs matching your search." : "New job openings from top companies will appear here."}
            </p>
            {searchTerm && (
              <Button variant="link" onClick={() => setSearchTerm('')} className="mt-4 text-blue-600">
                Clear search
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col">
                {post.imageUrl && (
                  <div className="w-full h-40 overflow-hidden">
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-none">
                      {post.jobType}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {post.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="flex items-center text-gray-600 dark:text-gray-400 font-medium">
                    <Building className="w-4 h-4 mr-1" />
                    {post.companyName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      {post.location}
                    </div>
                    {post.salaryRange && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                        {post.salaryRange}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                    {post.description}
                  </p>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Button 
                    className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-white rounded-xl shadow-md transition-all"
                    onClick={() => handleApplyClick(post)}
                  >
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Apply for {selectedJob?.title}</DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">
                Complete the form below and upload your resume to apply for this position at {selectedJob?.companyName}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleApplicationSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={applicationData.name}
                    onChange={(e) => setApplicationData({...applicationData, name: e.target.value})}
                    required
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={applicationData.email}
                    onChange={(e) => setApplicationData({...applicationData, email: e.target.value})}
                    required
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={applicationData.phone}
                  onChange={(e) => setApplicationData({...applicationData, phone: e.target.value})}
                  placeholder="+1 (555) 000-0000"
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume">Resume (PDF, Max 5MB)</Label>
                <div className="relative">
                  {resumeFile ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate max-w-[300px]">
                          {resumeFile.name}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setResumeFile(null)}
                        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label 
                        htmlFor="resume-upload" 
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-400">PDF, DOCX (MAX. 5MB)</p>
                        </div>
                        <input 
                          id="resume-upload" 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.docx,.doc"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                <Textarea 
                  id="coverLetter" 
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                  placeholder="Why are you a good fit for this role?"
                  className="min-h-[100px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsApplyDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !resumeFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default JobAlerts;
