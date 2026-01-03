import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building, Briefcase, MapPin, Clock, 
  Trash2, Plus, LayoutDashboard, FileText, Users, 
  Menu, X, Search, LogOut,
  Calendar, Edit3, Eye, Loader2, MoreVertical, LucideIcon
} from 'lucide-react';
import { getHRHiringPosts, deleteHiringPost } from '@/services/firebaseService';
import { HiringPost } from '@/types/interview';
import Logo from '@/components/Logo';
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// --- Sub-components ---

interface SidebarLinkProps {
  name: string;
  icon: LucideIcon;
  path: string;
  isOpen: boolean;
  isActive: boolean;
  onClick: () => void;
}

const SidebarLink = ({ name, icon: Icon, path, isOpen, isActive, onClick }: SidebarLinkProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
      isActive 
        ? "bg-blue-600/10 text-blue-400" 
        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
    )}
  >
    <Icon className={cn(
      "w-5 h-5 flex-shrink-0",
      isActive ? "text-blue-400" : "group-hover:text-slate-100"
    )} />
    {isOpen && <span className="font-medium whitespace-nowrap">{name}</span>}
  </button>
);

const PostCard = ({ post, onDelete }: { post: HiringPost, onDelete: (id: string) => void }) => {
  const navigate = useNavigate();
  
  const formattedDate = post.createdAt instanceof Date 
    ? post.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  return (
    <Card className="bg-[#111827] border-slate-800 overflow-hidden flex flex-col group hover:border-slate-700 transition-all duration-300 shadow-sm relative">
      <div className="relative h-48 overflow-hidden bg-slate-900 flex items-center justify-center">
        {post.imageUrl ? (
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <Building className="w-12 h-12 text-slate-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-60"></div>
        <Badge className={cn(
          "absolute top-4 right-4 text-white border-none backdrop-blur-md shadow-sm",
          post.status === 'active' ? "bg-emerald-500/90" : "bg-slate-500/90"
        )}>
          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
        </Badge>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <CardTitle className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
              {post.title}
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium line-clamp-1">
              {post.companyName}
            </CardDescription>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-800">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#111827] border-slate-800 text-slate-200">
              <DropdownMenuItem onClick={() => toast.info('View feature coming soon')} className="hover:bg-slate-800 cursor-pointer">
                <Eye className="w-4 h-4 mr-2" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('Edit feature coming soon')} className="hover:bg-slate-800 cursor-pointer">
                <Edit3 className="w-4 h-4 mr-2" /> Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-red-400 hover:bg-red-400/10 cursor-pointer">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded-md">
            <MapPin className="w-3 h-3 text-blue-500" />
            {post.location}
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded-md">
            <Clock className="w-3 h-3 text-blue-500" />
            {post.jobType}
          </div>
        </div>
        <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
          {post.description}
        </p>
      </CardContent>

      <div className="p-4 pt-0 mt-auto flex items-center justify-between border-t border-slate-800/50 bg-slate-900/20">
        <div className="flex items-center text-xs text-slate-500 font-medium">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
          {formattedDate}
        </div>
        <Button 
          variant="link" 
          className="text-blue-400 hover:text-blue-300 p-0 h-auto text-xs font-bold"
          onClick={() => toast.info('Application tracking coming soon')}
        >
          View Applications →
        </Button>
      </div>
    </Card>
  );
};

// --- Main Component ---

const HRMyPosts = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState<HiringPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const sidebarLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/hr/dashboard' },
    { name: 'My Posts', icon: FileText, path: '/hr/my-posts' },
    { name: 'Candidates', icon: Users, path: '/hr/applications' },
  ];

  const loadPosts = useCallback(async () => {
    if (!user) return;
    try {
      const hrPosts = await getHRHiringPosts(user.id);
      setPosts(hrPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      loadPosts();
    }
  }, [user, loadPosts]);

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteHiringPost(postId);
      toast.success('Post deleted successfully');
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const filteredPosts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return posts;
    return posts.filter(post => 
      post.title.toLowerCase().includes(term) ||
      post.companyName.toLowerCase().includes(term) ||
      post.location.toLowerCase().includes(term) ||
      post.jobType.toLowerCase().includes(term)
    );
  }, [posts, searchTerm]);

  if (!user) return null;

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
            <SidebarLink 
              key={link.name}
              {...link}
              isOpen={isSidebarOpen}
              isActive={location.pathname === link.path}
              onClick={() => navigate(link.path)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Sign Out</span>}
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
            <div className="relative hidden md:block ml-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Filter your postings..." 
                className="bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64 text-white transition-all focus:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-slate-800/30 p-1.5 pl-4 rounded-full border border-slate-800/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{user.companyName}</p>
              </div>
              <Avatar className="w-10 h-10 border-2 border-slate-700 shadow-inner">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold">
                  {user.name?.charAt(0) || 'H'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950/20">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111827] p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-blue-600/10"></div>
              <div className="relative">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Job Postings</h2>
                <p className="text-slate-500 text-sm mt-1.5 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Manage and track your active job advertisements.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/hr/dashboard', { state: { openDialog: true } })} 
                className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all font-bold"
              >
                <Plus className="w-5 h-5" />
                Post New Job
              </Button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-6">
                <div className="relative">
                  <Loader2 className="animate-spin h-14 w-14 text-blue-500" />
                  <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse rounded-full"></div>
                </div>
                <p className="text-slate-400 font-semibold tracking-wide">Fetching your job postings...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-[#111827] border-2 border-dashed border-slate-800 rounded-3xl p-24 text-center">
                <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-slate-800 text-slate-600 shadow-inner">
                  <Briefcase className="w-12 h-12" />
                </div>
                <h3 className="text-white font-bold text-2xl">No job posts yet</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-4 text-lg leading-relaxed">
                  You haven't created any job advertisements. Start by posting your first job opening to attract candidates.
                </p>
                <Button 
                  onClick={() => navigate('/hr/dashboard', { state: { openDialog: true } })} 
                  className="mt-10 bg-blue-600 hover:bg-blue-700 h-14 px-10 rounded-xl font-bold shadow-lg shadow-blue-600/30"
                >
                  Create First Posting
                </Button>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-[#111827] border-2 border-dashed border-slate-800 rounded-3xl p-24 text-center">
                <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-slate-800 text-slate-600 shadow-inner">
                  <Search className="w-12 h-12" />
                </div>
                <h3 className="text-white font-bold text-2xl">No matching posts</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-4 text-lg leading-relaxed">
                  We couldn't find any job posts matching "<span className="text-blue-400 font-bold">{searchTerm}</span>".
                </p>
                <Button 
                  onClick={() => setSearchTerm('')} 
                  variant="outline" 
                  className="mt-10 border-slate-800 text-slate-300 hover:bg-slate-800 h-12 px-8 rounded-xl"
                >
                  Clear Search Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onDelete={handleDeletePost} 
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HRMyPosts;
