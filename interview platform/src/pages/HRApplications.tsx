import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Briefcase,
  Search,
  Filter,
  ArrowLeft,
  FileText,
  ExternalLink,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHRApplications, updateApplicationStatus } from '@/services/firebaseService';
import { JobApplication } from '@/types/interview';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const HRApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = React.useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

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

  /**
   * ✅ STATUS UPDATE (EMAIL SENT BY BACKEND)
   */
  const handleStatusUpdate = async (applicationId: string, status: JobApplication['status']) => {
    try {
      // Find the application
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      // 1️⃣ Update status in Firebase DB
      await updateApplicationStatus(applicationId, status);

      // 2️⃣ Call backend / Firebase Function to send email if needed
      if (status === 'shortlisted' || status === 'rejected') {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/applications/${applicationId}/status`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status,
              candidateEmail: application.candidateEmail,
              candidateName: application.candidateName,
              jobTitle: application.jobTitle,
              companyName: user?.companyName || "Our Company",
              hrName: user?.name || "HR Team",
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Backend email trigger failed');
        }
      }

      // 3️⃣ Update local state to reflect status change
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status } : app
        )
      );

      toast.success(
        status === 'shortlisted'
          ? "Interview invitation sent successfully!"
          : status === 'rejected'
          ? "Apology email sent successfully!"
          : `Application marked as ${status}`
      );
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Failed to update status or send email");
    }
  };

  const filteredApplications = applications.filter(app =>
    app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1"><Search className="h-3 w-3" /> Reviewed</Badge>;
      case 'shortlisted':
        return <Badge className="bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Shortlisted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/hr/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Candidate Applications</h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.companyName}</p>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search candidates or job titles..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Manage candidates who applied to your jobs</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map(app => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="font-medium">{app.candidateName}</div>
                        <div className="text-xs text-slate-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" /> {app.candidateEmail}
                        </div>
                        {app.candidatePhone && (
                          <div className="text-xs text-slate-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" /> {app.candidatePhone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Briefcase className="inline h-4 w-4 mr-1" />
                        {app.jobTitle}
                      </TableCell>
                      <TableCell>
                        <Calendar className="inline h-4 w-4 mr-1" />
                        {app.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 flex items-center">
                          <FileText className="h-4 w-4 mr-1" /> View
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusUpdate(app.id, 'reviewed')}>
                              Mark as Reviewed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(app.id, 'shortlisted')}>
                              Shortlist & Send Invitation
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(app.id, 'rejected')}>
                              Reject & Send Apology
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HRApplications;
