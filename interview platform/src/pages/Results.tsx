import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import {
  Brain,
  Trophy,
  Target,
  TrendingUp,
  RotateCcw,
  Home,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Award,
  BarChart3,
  Star,
  Zap,
  Shield,
  Clock,
  Calendar,
  ChevronRight,
  Download,
  Share2,
  Sparkles,
  Users,
  MessageSquare,
  Volume2,
  Eye,
  BrainCircuit,
  TargetIcon,
  LineChart,
  GraduationCap
} from 'lucide-react';
import { InterviewSession } from '@/types/interview';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { ThemeToggle } from '@/components/ThemeToggle';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session: InterviewSession | undefined = location.state?.session;

  if (!session) {
    navigate('/dashboard');
    return null;
  }

  // Handle empty feedback array
  if (!session.feedback || session.feedback.length === 0) {
    navigate('/dashboard');
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-amber-500';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'from-green-500 to-green-600';
    if (score >= 6) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Outstanding Performance!';
    if (score >= 8) return 'Excellent Work!';
    if (score >= 7) return 'Great Job!';
    if (score >= 6) return 'Good Progress';
    if (score >= 5) return 'Solid Effort';
    return 'Keep Practicing';
  };

  const getScoreSubLabel = (score: number) => {
    if (score >= 9) return 'You absolutely nailed it!';
    if (score >= 8) return 'Impressive interview skills';
    if (score >= 7) return 'Strong performance overall';
    if (score >= 6) return 'Good foundation to build upon';
    return 'Every practice makes you better';
  };

  // Aggregate feedback data
  const avgClarity = Math.round(session.feedback.reduce((a, f) => a + f.clarity, 0) / session.feedback.length);
  const avgRelevance = Math.round(session.feedback.reduce((a, f) => a + f.relevance, 0) / session.feedback.length);
  const avgTechnical = Math.round(session.feedback.reduce((a, f) => a + (f.technicalAccuracy || 0), 0) / session.feedback.length);
  const avgCommunication = Math.round(session.feedback.reduce((a, f) => a + f.communication, 0) / session.feedback.length);

  const radarData = [
    { skill: 'Clarity', value: avgClarity * 10, icon: <MessageSquare className="h-5 w-5" />, color: 'from-blue-500 to-blue-600' },
    { skill: 'Relevance', value: avgRelevance * 10, icon: <TargetIcon className="h-5 w-5" />, color: 'from-green-500 to-green-600' },
    { skill: 'Technical', value: avgTechnical * 10, icon: <BrainCircuit className="h-5 w-5" />, color: 'from-purple-500 to-purple-600' },
    { skill: 'Communication', value: avgCommunication * 10, icon: <Volume2 className="h-5 w-5" />, color: 'from-amber-500 to-amber-600' },
  ];

  const allStrengths = [...new Set(session.feedback.flatMap(f => f.strengths))].slice(0, 4);
  const allWeaknesses = [...new Set(session.feedback.flatMap(f => f.weaknesses))].slice(0, 4);
  const allImprovements = [...new Set(session.feedback.flatMap(f => f.improvements))].slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 dark:bg-blue-900/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/10 dark:bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-transparent via-blue-50/5 dark:via-blue-950/5 to-transparent"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                PrepBot
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800">
                <Share2 className="h-5 w-5 mr-2" />
                Share Results
              </Button>
              <Button variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800">
                <Download className="h-5 w-5 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-8 py-12 max-w-6xl mx-auto">
        {/* Score Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full border border-blue-500/30 mb-8">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Interview Analysis Complete</span>
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 dark:text-white">
            {getScoreLabel(session.totalScore)}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            {getScoreSubLabel(session.totalScore)} Here's your detailed performance breakdown.
          </p>

          {/* Score Display */}
          <div className="relative inline-block mb-8">
            <div className={`absolute inset-0 w-64 h-64 bg-gradient-to-r ${getScoreBgColor(session.totalScore)} rounded-full blur-3xl opacity-30`}></div>
            <div className="relative">
              <div className={`w-48 h-48 bg-gradient-to-r ${getScoreBgColor(session.totalScore)} rounded-full flex items-center justify-center shadow-2xl`}>
                <div className="w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center">
                  <div className={`text-6xl font-bold ${getScoreColor(session.totalScore)}`}>
                    {session.totalScore}
                  </div>
                  <div className="text-gray-500 text-lg">/10</div>
                  <div className="text-sm text-gray-500 mt-2">Overall Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
            <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Role</div>
                <div className="font-bold text-gray-900 dark:text-white capitalize">{session.jobRole.replace(/-/g, ' ')}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Difficulty</div>
                <div className="font-bold text-gray-900 dark:text-white capitalize">{session.difficulty?.toString() || 'Not Set'}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Questions</div>
                <div className="font-bold text-gray-900 dark:text-white">{session.questions.length} total</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Date</div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {session.createdAt.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Analysis Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Performance Breakdown */}
          <Card className="lg:col-span-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-2xl">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-slate-700">
              <CardTitle className="flex items-center text-xl dark:text-white">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" strokeWidth={1} />
                    <PolarAngleAxis 
                      dataKey="skill" 
                      tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 500 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {radarData.map((skill, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 border border-gray-200 dark:border-slate-600">
                    <div className={`w-12 h-12 bg-gradient-to-r ${skill.color} rounded-xl flex items-center justify-center mb-3`}>
                      {skill.icon}
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white">{skill.skill}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{skill.value / 10}<span className="text-gray-500 dark:text-gray-400 text-lg">/10</span></div>
                    <div className="h-2 bg-gray-200 dark:bg-slate-600 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                        style={{ width: `${skill.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Question-by-Question Scores */}
          <Card className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-2xl">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-slate-700">
              <CardTitle className="flex items-center text-xl dark:text-white">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <LineChart className="h-6 w-6 text-white" />
                </div>
                Question Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {session.feedback.map((feedback, i) => (
                  <div key={i} className="group p-4 rounded-xl border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-lg flex items-center justify-center mr-3">
                          <span className="font-bold text-gray-700 dark:text-gray-300">Q{i + 1}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">Question {i + 1}</span>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(feedback.score)}`}>
                        {feedback.score}<span className="text-gray-500 dark:text-gray-400 text-lg">/10</span>
                      </div>
                    </div>
                    <Progress 
                      value={feedback.score * 10} 
                      className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600"
                    />
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                      <Clock className="h-4 w-4 mr-2" />
                      Time taken: {Math.floor((feedback.timeTaken || 0) / 60)}:{((feedback.timeTaken || 0) % 60).toString().padStart(2, '0')}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Summary Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Strengths */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800 rounded-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Strengths</h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">Areas where you excelled</p>
                </div>
              </div>
              <ul className="space-y-4">
                {allStrengths.map((s, i) => (
                  <li key={i} className="flex items-start p-4 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-green-200/50 dark:border-green-800/50">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-800 dark:text-gray-200">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Areas to Improve */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800 rounded-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mr-4">
                  <XCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Areas to Improve</h3>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">Focus areas for growth</p>
                </div>
              </div>
              <ul className="space-y-4">
                {allWeaknesses.map((w, i) => (
                  <li key={i} className="flex items-start p-4 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-800 dark:text-gray-200">{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <Lightbulb className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recommendations</h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">Actionable next steps</p>
                </div>
              </div>
              <ul className="space-y-4">
                {allImprovements.map((imp, i) => (
                  <li key={i} className="flex items-start p-4 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-blue-600 dark:text-blue-300 font-bold text-sm">{i + 1}</span>
                    </div>
                    <span className="text-gray-800 dark:text-gray-200">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Final Insights */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl mb-12">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Key Insights</h3>
                <p className="text-gray-400">Based on your performance analysis</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <GraduationCap className="h-6 w-6 text-blue-400 mr-3" />
                  <h4 className="font-bold text-white">Learning Path</h4>
                </div>
                <p className="text-gray-300">
                  Focus on {avgTechnical < 8 ? 'technical accuracy' : avgCommunication < 8 ? 'communication skills' : 'advanced concepts'} 
                  for your next practice session. Based on your score trends, you're ready for {session.difficulty?.toString() === 'hard' ? 'expert-level' : 'advanced'} challenges.
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-green-400 mr-3" />
                  <h4 className="font-bold text-white">Confidence Level</h4>
                </div>
                <p className="text-gray-300">
                  Your performance indicates {session.totalScore >= 8 ? 'high' : session.totalScore >= 6 ? 'good' : 'developing'} 
                  confidence in {session.jobRole.replace(/-/g, ' ')} interviews. 
                  {session.totalScore >= 8 ? ' You appear ready for real interviews.' : ' Continued practice will build confidence.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/setup" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-7 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <RotateCcw className="h-6 w-6 mr-3" />
              Practice Again
            </Button>
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 px-12 py-7 text-lg rounded-xl backdrop-blur-sm"
            >
              <Home className="h-6 w-6 mr-3" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Results;