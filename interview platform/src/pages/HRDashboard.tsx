import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, Briefcase, TrendingUp, LogOut, MapPin, DollarSign, Clock, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getHRHiringPosts } from '@/services/firebaseService';
import { HiringPost } from '@/types/interview';

const HRDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = React.useState<HiringPost[]>([]);
  
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
            <Card className="bg-gray-800/70 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/50 transition-colors shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <FileText className="w-5 h-5 mr-2 text-blue-400" />
                  Interview Management
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Create and manage interview sessions for your candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                  Create Interview
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
                  <Card key={post.id} className="bg-gray-800/70 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/30 transition-all shadow-xl">
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
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                          View Details
                        </Button>
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
