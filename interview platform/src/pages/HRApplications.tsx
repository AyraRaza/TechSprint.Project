import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Briefcase,
  Search,
  Filter,
  FileText,
  ExternalLink,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  LayoutDashboard,
  Bell,
  Menu,
  X,
  ChevronRight,
  Download,
  Building,
  LogOut,
  MapPin
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getHRApplications, updateApplicationStatus, createNotification } from '@/services/firebaseService';
import { JobApplication } from '@/types/interview';
import Logo from '@/components/Logo';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const HRApplications = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [applications, setApplications] = React.useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const sidebarLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/hr/dashboard' },
    { name: 'My Posts', icon: FileText, path: '/hr/my-posts' },
    { name: 'Candidates', icon: Users, path: '/hr/applications' },
  ];

  React.useEffect(() => {
    if (user?.id) loadApplications();
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    try {
      const data = await getHRApplications(user.id);
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: JobApplication['status']) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      await updateApplicationStatus(applicationId, status);

      if (status === 'shortlisted' || status === 'rejected') {
        const companyName = user?.companyName || "Our Company";
        await createNotification({
          userId: application.candidateId,
          title: status === 'shortlisted' ? 'Interview Invitation' : 'Application Update',
          message: status === 'shortlisted' 
            ? `Great news! You have been shortlisted for the interview round for the ${application.jobTitle} position at ${companyName}. Please check your dashboard to prepare for the next steps.`
            : `Thank you for your interest in the ${application.jobTitle} position at ${companyName}. While we were impressed with your background, we've decided to move forward with other candidates at this time. We wish you the best in your search.`,
          type: status === 'shortlisted' ? 'INTERVIEW' : 'REJECTION',
        });
      }

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status } : app
        )
      );

      toast.success(
        status === 'shortlisted'
          ? "Candidate notified of interview invitation!"
          : status === 'rejected'
          ? "Candidate notified of application update."
          : `Application marked as ${status}`
      );
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Failed to update status or notify candidate");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredApplications = applications.filter(app =>
    app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Reviewed</Badge>;
      case 'shortlisted':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Shortlisted</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
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
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all">
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
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">Candidate Pool</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-500">{user.companyName}</p>
              </div>
              <Avatar className="w-10 h-10 border-2 border-slate-800">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-blue-600 text-white font-bold">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111827] p-6 rounded-2xl border border-slate-800 shadow-sm">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  placeholder="Search by name, email or position..." 
                  className="bg-slate-900 border-slate-800 pl-10 h-11 focus:ring-blue-500 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-none border-slate-800 bg-slate-900 hover:bg-slate-800 h-11 px-6 rounded-xl text-slate-300">
                  <Filter className="w-4 h-4 mr-2" /> Filter
                </Button>
                <div className="text-sm text-slate-500 font-medium px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
                  Total: {filteredApplications.length}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
                <p className="text-slate-500 font-medium">Fetching candidates...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="bg-[#111827] border-2 border-dashed border-slate-800 rounded-3xl p-20 text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800 text-slate-700">
                  <Users className="w-10 h-10" />
                </div>
                <h3 className="text-white font-bold text-2xl">No candidates found</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-3 text-lg">We couldn't find any applications matching your current filters or search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredApplications.map(app => (
                  <Card key={app.id} className="bg-[#111827] border-slate-800 shadow-sm hover:border-slate-700 transition-all duration-300 group">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row items-stretch lg:items-center">
                        {/* Candidate Identity */}
                        <div className="p-6 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-slate-800 lg:w-[350px]">
                          <Avatar className="w-16 h-16 border-2 border-slate-800 group-hover:ring-2 ring-blue-500/30 transition-all">
                            <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 font-bold text-xl uppercase">
                              {app.candidateName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h3 className="font-bold text-xl text-white truncate">{app.candidateName}</h3>
                            <div className="flex flex-col gap-1 mt-1">
                              <span className="flex items-center text-sm text-slate-500 truncate">
                                <Mail className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> {app.candidateEmail}
                              </span>
                              {app.candidatePhone && (
                                <span className="flex items-center text-sm text-slate-500">
                                  <Phone className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> {app.candidatePhone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Application Details */}
                        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Applied For</p>
                            <div className="flex items-center text-slate-200 font-semibold group-hover:text-blue-400 transition-colors">
                              <Briefcase className="w-4 h-4 mr-2 text-slate-500" />
                              {app.jobTitle}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Application Date</p>
                            <div className="flex items-center text-slate-300 font-medium">
                              <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                              {app.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Current Status</p>
                            <div className="pt-1">
                              {getStatusBadge(app.status)}
                            </div>
                          </div>
                        </div>

                        {/* Actions Area */}
                        <div className="p-6 bg-slate-900/30 flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 lg:border-l border-slate-800">
                          <Button 
                            variant="ghost" 
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-11 px-5 rounded-xl border border-blue-400/20"
                            asChild
                          >
                            <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4 mr-2" />
                              Resume
                              <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-50" />
                            </a>
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-slate-800 text-slate-400">
                                <MoreVertical className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-[#111827] border-slate-800 text-slate-300">
                              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-800" />
                              <DropdownMenuItem 
                                className="focus:bg-blue-600/10 focus:text-blue-400 cursor-pointer py-3"
                                onClick={() => handleStatusUpdate(app.id, 'reviewed')}
                              >
                                <Search className="w-4 h-4 mr-2" /> Mark as Reviewed
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="focus:bg-emerald-600/10 focus:text-emerald-400 cursor-pointer py-3"
                                onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" /> Shortlist & Invite
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="focus:bg-rose-600/10 focus:text-rose-400 cursor-pointer py-3 text-rose-400"
                                onClick={() => handleStatusUpdate(app.id, 'rejected')}
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Reject & Close
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HRApplications;
