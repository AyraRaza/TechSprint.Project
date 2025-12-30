import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

import { 
  Brain, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Upload,
  FileText,
  X,
  Loader2,
  Code,
  Cpu,
  Database,
  Cloud,
  Smartphone,
  Globe,
  Users,
  Shield,
  Target,
  Zap,
  BarChart,
  Rocket,
  Sparkles,
  Camera,
  Clock,
  FileCheck
} from 'lucide-react';
import { JOB_ROLES, DIFFICULTIES, ROUND_TYPES, JobRole, Difficulty, RoundType } from '@/types/interview';
import { parseResume } from '@/lib/gemini';
import { cn } from '@/lib/utils';


const InterviewSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('intermediate');
  const [selectedRoundType, setSelectedRoundType] = useState<RoundType>('mixed');
  const [questionCount, setQuestionCount] = useState(5);
  const [proctorEnabled, setProctorEnabled] = useState(true);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  
  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeContent, setResumeContent] = useState<string | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);

  // Auto-request camera permission if proctoring is enabled
  useEffect(() => {
    if (step === 3 && proctorEnabled && !cameraAllowed) {
      handleProctorToggle(true);
    }
  }, [step, proctorEnabled, cameraAllowed]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or DOCX file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setResumeFile(file);
    setIsParsingResume(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const parsedContent = await parseResume(base64, file.type);
        setResumeContent(parsedContent);
        toast({
          title: 'Resume parsed successfully',
          description: 'Your interview will include personalized questions based on your resume',
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error parsing resume:', error);
      toast({
        title: 'Failed to parse resume',
        description: 'Questions will be role-based instead',
        variant: 'destructive',
      });
      setResumeFile(null);
    } finally {
      setIsParsingResume(false);
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    setResumeContent(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStart = () => {
    if (!selectedRole) return;
    
    const config = {
      jobRole: selectedRole,
      difficulty: selectedDifficulty,
      roundType: selectedRoundType,
      questionCount,
      resumeContent: resumeContent || undefined,
      proctorEnabled,
    };
    
    navigate('/interview', { state: { config } });
  };

  const handleProctorToggle = async (enabled: boolean) => {
    setProctorEnabled(enabled);
    if (!enabled) {
      setCameraAllowed(false);
      return;
    }

    // Request camera permission proactively so Start can be enabled only when granted
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // stop immediately, we only wanted permission
      stream.getTracks().forEach((t) => t.stop());
      setCameraAllowed(true);
      toast({ title: 'Camera permission granted', description: 'Proctoring enabled' });
    } catch (err) {
      console.error('Camera permission denied', err);
      setCameraAllowed(false);
      // Keep proctorEnabled true to ensure it remains mandatory even if permission fails
      toast({ title: 'Camera permission required', description: 'Enable camera to use proctoring', variant: 'destructive' });
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedRole !== null;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 dark:bg-blue-900/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/10 dark:bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-transparent via-blue-50/5 dark:via-blue-950/5 to-transparent"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50">
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
              <Link to="/dashboard">
                <Button variant="outline" className="border-gray-300  dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300">
                  Dashboard 
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-8 py-12 max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-16">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500",
                s === step 
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-110"
                  : s < step 
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                  : "bg-gray-200 text-gray-500"
              )}>
                {s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "w-24 h-1 mx-4 transition-all duration-500",
                  s < step ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gray-200"
                )}></div>
              )}
            </div>
          ))}
          <div className="ml-8 hidden md:block">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {step === 1 && "Select Role"}
              {step === 2 && "Configure Interview"}
              {step === 3 && "Review & Start"}
            </div>
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                What role are you preparing for?
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                Select your target position. Our AI will tailor questions specifically for this role.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {JOB_ROLES.map((role) => {
                const roleIcons: Record<string, React.ReactNode> = {
                  'frontend': <Code className="h-6 w-6" />,
                  'backend': <Cpu className="h-6 w-6" />,
                  'full-stack': <Globe className="h-6 w-6" />,
                  'mobile': <Smartphone className="h-6 w-6" />,
                  'devops': <Cloud className="h-6 w-6" />,
                  'data-engineer': <Database className="h-6 w-6" />,
                };
                
                return (
                  <div 
                    key={role.value}
                    className={cn(
                      "cursor-pointer transition-all duration-300 rounded-2xl border-2 overflow-hidden group",
                      selectedRole === role.value 
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 shadow-lg transform scale-[1.02]"
                        : "border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md"
                    )}
                    onClick={() => setSelectedRole(role.value)}
                  >
                    <div className="p-6">
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors",
                        selectedRole === role.value 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-600"
                      )}>
                        {roleIcons[role.value] || <Code className="h-6 w-6" />}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{role.label}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{role.description}</p>
                      {selectedRole === role.value && (
                        <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Selected
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Difficulty, Round Type & Resume */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl mb-6">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Configure Your Interview
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                Customize the difficulty, question types, and upload your resume for personalized questions.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Resume & Difficulty */}
              <div className="space-y-8">
                {/* Resume Upload */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <FileCheck className="h-6 w-6 mr-3 text-blue-600" />
                    Upload Your Resume (Optional)
                  </h3>
                  <Card className="border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors dark:bg-slate-700/50">
                    <CardContent className="p-8">
                      {!resumeFile ? (
                        <div 
                          className="text-center cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Upload className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">Upload Resume</p>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Get personalized questions based on your experience
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Supports PDF and DOCX files up to 5MB</p>
                          <Button 
                            variant="outline" 
                            className="mt-6 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700"
                          >
                            Choose File
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                                <FileText className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">{resumeFile.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={removeResume}
                              disabled={isParsingResume}
                              className="hover:bg-white/50 dark:hover:bg-slate-500/50"
                            >
                              {isParsingResume ? (
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                              ) : (
                                <X className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-red-500" />
                              )}
                            </Button>
                          </div>
                          <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4">
                            {isParsingResume ? (
                              <div className="flex items-center">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-3" />
                                <span className="text-blue-600 dark:text-blue-400 font-medium">Analyzing your resume...</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                                <CheckCircle2 className="h-5 w-5 mr-3" />
                                Ready for personalized questions
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Difficulty Selection */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Zap className="h-6 w-6 mr-3 text-amber-600" />
                    Difficulty Level
                  </h3>
                  <div className="space-y-4">
                    {DIFFICULTIES.map((diff) => (
                      <div 
                        key={diff.value}
                        className={cn(
                          "cursor-pointer p-5 rounded-xl border-2 transition-all duration-300",
                          selectedDifficulty === diff.value 
                            ? "border-amber-500 bg-gradient-to-r from-amber-50 to-amber-100 shadow-md"
                            : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
                        )}
                        onClick={() => setSelectedDifficulty(diff.value)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{diff.label}</p>
                            <p className="text-gray-600 text-sm mt-1">{diff.description}</p>
                          </div>
                          {selectedDifficulty === diff.value && (
                            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Round Type */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <BarChart className="h-6 w-6 mr-3 text-purple-600" />
                  Question Types
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select the types of questions you want to practice. Choose "Mixed" for a comprehensive interview.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ROUND_TYPES.map((type) => {
                    // Get the round type value as string for comparison
                    const typeValue = type.value as string;
                    
                    return (
                      <div 
                        key={type.value}
                        className={cn(
                          "cursor-pointer p-5 rounded-xl border-2 transition-all duration-300 h-full",
                          selectedRoundType === type.value 
                            ? "border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-700 dark:to-slate-600 shadow-md"
                            : "border-gray-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-slate-700/50"
                        )}
                        onClick={() => setSelectedRoundType(type.value)}
                      >
                        <div className="flex flex-col h-full">
                          <div className="flex items-start mb-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center mr-3",
                              selectedRoundType === type.value 
                                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                                : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
                            )}>
                              {typeValue === 'technical' && <Code className="h-5 w-5" />}
                              {typeValue === 'behavioral' && <Users className="h-5 w-5" />}
                              {typeValue === 'system-design' && <Cpu className="h-5 w-5" />}
                              {typeValue === 'mixed' && <Globe className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{type.label}</p>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{type.description}</p>
                            </div>
                          </div>
                          {selectedRoundType === type.value && (
                            <div className="mt-auto pt-3 border-t border-purple-200 dark:border-purple-800">
                              <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium">
                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                Selected
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Final Configuration */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-6">
                <Rocket className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Review & Start Your Interview
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                Finalize your settings and begin your AI-powered interview session.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Question Count & Proctoring */}
              <div className="lg:col-span-2 space-y-8">
                {/* Question Count */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Clock className="h-6 w-6 mr-3 text-blue-600" />
                    Interview Duration
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white">{questionCount} Questions</p>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          Estimated time: {questionCount * 5} minutes
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Questions</div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                          {questionCount}
                        </div>
                      </div>
                    </div>
                    <Slider
                      value={[questionCount]}
                      onValueChange={(v) => setQuestionCount(v[0])}
                      min={3}
                      max={10}
                      step={1}
                      className="w-full [&>div>span]:bg-gradient-to-r [&>div>span]:from-blue-500 [&>div>span]:to-blue-600"
                    />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <div className="font-medium">Quick</div>
                        <div>3 questions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Standard</div>
                        <div>5 questions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Comprehensive</div>
                        <div>10 questions</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proctoring */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl border border-blue-200 dark:border-slate-600 p-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Shield className="h-6 w-6 mr-3 text-blue-600" />
                    Proctoring Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-700/50 rounded-xl border border-blue-200 dark:border-slate-600">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mr-4">
                          <Camera className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">Camera Proctoring</p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Monitor your session for integrity</p>
                        </div>
                      </div>
                      <Label className="flex items-center gap-3 cursor-not-allowed opacity-70">
                        <Checkbox 
                          checked={proctorEnabled} 
                          onCheckedChange={() => {}}
                          disabled={true}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-6 w-6"
                        />
                        <span className="font-medium">
                          {proctorEnabled ? 'Mandatory' : 'Disabled'}
                        </span>
                      </Label>
                    </div>
                    
                    {proctorEnabled && (
                      <div className={cn(
                        "p-4 rounded-xl border transition-all",
                        cameraAllowed 
                          ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-300 dark:border-green-800"
                          : "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-300 dark:border-amber-800"
                      )}>
                        <div className="flex items-center">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                            cameraAllowed ? "bg-green-100 dark:bg-green-900" : "bg-amber-100 dark:bg-amber-900"
                          )}>
                            {cameraAllowed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
                            )}
                          </div>
                          <div>
                            <p className={cn(
                              "font-bold",
                              cameraAllowed ? "text-green-800 dark:text-green-200" : "text-amber-800 dark:text-amber-200"
                            )}>
                              {cameraAllowed ? 'Camera permission granted' : 'Camera permission required'}
                            </p>
                            <p className={cn(
                              "text-sm",
                              cameraAllowed ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"
                            )}>
                              {cameraAllowed 
                                ? 'Your camera is ready for proctored interview'
                                : 'Please allow camera access to enable proctoring'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Summary */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-8 flex items-center">
                  <Sparkles className="h-7 w-7 mr-3 text-blue-400" />
                  Interview Summary
                </h3>
                
                <div className="space-y-6">
                  {[
                    { 
                      label: 'Target Role', 
                      value: selectedRole ? selectedRole.replace(/-/g, ' ') : 'Not selected',
                      icon: Users,
                      color: 'from-blue-500 to-blue-600'
                    },
                    { 
                      label: 'Difficulty', 
                      value: selectedDifficulty ? selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1) : 'Not set',
                      icon: Zap,
                      color: 'from-amber-500 to-amber-600'
                    },
                    { 
                      label: 'Question Type', 
                      value: selectedRoundType ? selectedRoundType.charAt(0).toUpperCase() + selectedRoundType.slice(1) : 'Not set',
                      icon: BarChart,
                      color: 'from-purple-500 to-purple-600'
                    },
                    { 
                      label: 'Questions', 
                      value: `${questionCount} questions`,
                      icon: Clock,
                      color: 'from-green-500 to-green-600'
                    },
                    { 
                      label: 'Resume', 
                      value: resumeContent ? 'Personalized' : 'Role-based',
                      icon: FileText,
                      color: resumeContent ? 'from-green-500 to-green-600' : 'from-gray-500 to-gray-600'
                    },
                    { 
                      label: 'Proctoring', 
                      value: proctorEnabled ? 'Enabled' : 'Disabled',
                      icon: Shield,
                      color: proctorEnabled ? 'from-blue-500 to-blue-600' : 'from-gray-500 to-gray-600'
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center mr-4`}>
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">{item.label}</p>
                          <p className="font-bold">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-gray-700">
                  <p className="text-gray-300 text-sm mb-6">
                    Ready to start your AI-powered interview? Click below to begin.
                  </p>
                  <Button 
                    onClick={handleStart}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isParsingResume || (proctorEnabled && !cameraAllowed)}
                    title={proctorEnabled && !cameraAllowed ? 'Enable camera permission to start proctored interview' : undefined}
                  >
                    {isParsingResume ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                        Processing Resume...
                      </>
                    ) : (
                      <>
                        Start Interview Now
                        <Rocket className="h-5 w-5 ml-3" />
                      </>
                    )}
                  </Button>
                  
                  {proctorEnabled && !cameraAllowed && (
                    <p className="text-amber-400 text-sm mt-4 text-center">
                      Camera permission required for proctored interviews
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <Button 
            variant="outline" 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 px-8 py-6 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Backs
          </Button>
          
          {step < 3 ? (
            <Button 
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed() || isParsingResume}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              Continue to Next Step
              <ArrowRight className="h-5 w-5 ml-3" />
            </Button>
          ) : (
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Review your settings before starting
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewSetup;