import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Play,
  TrendingUp,
  Clock,
  Target,
  Award,
  BarChart3,
  Calendar,
  ArrowRight,
  LogOut,
  Loader2,
  Video,
  FileText,
  Users,
  Zap,
  ChevronRight,
  Bell,
  Settings,
  Home,
  HelpCircle,
  Shield
} from 'lucide-react';
import { getUserAnalytics, getUserInterviews, UserAnalytics, FirestoreInterviewSession } from '@/services/firebaseService';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [recentSessions, setRecentSessions] = useState<FirestoreInterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const [analyticsData, sessions] = await Promise.all([
          getUserAnalytics(user.id),
          getUserInterviews(user.id),
        ]);
        setAnalytics(analyticsData);
        setRecentSessions(sessions.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Brain className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-white border-r-white rounded-2xl animate-spin"></div>
        </div>
        <p className="text-gray-400 text-lg">Loading your dashboard...</p>
        <div className="mt-6 w-64">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/10 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-transparent via-blue-50/5 dark:via-blue-900/5 to-transparent"></div>
      </div>

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
              <Link to="/dashboard" className="flex items-center space-x-2 text-blue-600 font-semibold">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link to="/setup" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <Video className="h-5 w-5" />
                <span>Interviews</span>
              </Link>
              <Link to="/profile" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                <Users className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Welcome back, {user?.name || 'U'} </h1>
          <p className="text-muted-foreground">Track your progress and continue improving.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: Target,
              label: 'Total Sessions',
              value: analytics?.totalSessions || 0,
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50 dark:bg-blue-900/20',
              change: '+2 this week'
            },
            {
              icon: TrendingUp,
              label: 'Average Score',
              value: `${analytics?.averageScore || 0}/10`,
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-50 dark:bg-green-900/20',
              change: '+1.2 vs last week'
            },
            {
              icon: Clock,
              label: 'This Week',
              value: recentSessions.filter(s => s.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-50 dark:bg-purple-900/20',
              change:'Frequency'
            },
            {
              icon: Award,
              label: 'Best Score',
              value: recentSessions.length > 0 ? `${Math.max(...recentSessions.map(s => s.totalScore))}/10` : '-',
              color: 'from-amber-500 to-amber-600',
              bgColor: 'bg-amber-50 dark:bg-amber-900/20',
              change: 'Personal best'
            },
          ].map((stat, i) => (
            <Card key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <stat.icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text`} />
                  </div>
                  {stat.change && (
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full`} style={{ width: '75%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  Performance Trend
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">Last 30 days</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    Week
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    Month
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    All Time
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {analytics?.scoreHistory && analytics.scoreHistory.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.scoreHistory}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={[0, 10]}
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        fill="url(#scoreGradient)"
                        strokeWidth={3}
                        dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ stroke: '#3b82f6', strokeWidth: 2, r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-6">
                    <BarChart3 className="h-20 w-20 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Complete your first interview to see trends</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Your performance data will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skill Breakdown */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                Skill Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {analytics?.skillBreakdown && analytics.skillBreakdown.length > 0 ? (
                analytics.skillBreakdown.map((skill, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">{skill.skill}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{skill.score}<span className="text-gray-400 dark:text-gray-500 text-sm">/10</span></span>
                    </div>
                    <div className="relative">
                      <Progress value={skill.score * 10} className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full" />
                      <div className="rounded-full absolute top-0 left-0 h-3 bg-gradient-to-r from-purple-500 to-purple-600 " style={{ width: `${skill.score * 10}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Beginner</span>
                      <span>Intermediate</span>
                      <span>Advanced</span>
                      <span>Expert</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-6">
                    <Target className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No skill data yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Complete interviews to see skill breakdown</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl">
          <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                Recent Interview Sessions
              </CardTitle>
              <Link to="/results">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => {
                  // Convert difficulty to string for comparison
                  const difficultyStr = session.difficulty?.toString() || '';

                  return (
                    <div
                      key={session.id}
                      className="group flex items-center justify-between p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <Video className="h-7 w-7 text-white" />
                          </div>
                          {session.resumeUsed && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                              <FileText className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-lg capitalize">
                            {session.jobRole?.replace(/-/g, ' ')} Interview
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {session.createdAt.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{session.questions?.length || 0} questions</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">•</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyStr === 'hard'
                                ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                                : difficultyStr === 'medium'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                                  : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                              }`}>
                              {difficultyStr ? difficultyStr.charAt(0).toUpperCase() + difficultyStr.slice(1) : 'Not Set'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{session.totalScore}<span className="text-gray-400 dark:text-gray-500 text-lg">/10</span></p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Overall Score</p>
                        </div>
                        <Button variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 dark:text-gray-500">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-8">
                  <Calendar className="h-24 w-24 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No interviews yet</h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-8">
                  Start your journey to interview mastery with AI-powered mock interviews
                </p>
                <Link to="/setup">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Start Your First Interview
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-2xl">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3">Need Help?</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Check our interview preparation guides and tips</p>
            <Button variant="outline" className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              View Guides
            </Button>
          </div>
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-2xl">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3">Upcoming Goals</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Complete 3 more interviews to unlock advanced analytics</p>
            <div className="h-2 bg-white dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-2xl">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3">Share Progress</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Share your achievements with your network</p>
            <Button variant="outline" className="border-green-300 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20">
              Export Report
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;