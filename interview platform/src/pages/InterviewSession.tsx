import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, 
  Mic, 
  MicOff, 
  Send, 
  Camera,
  CameraOff,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Volume2,
  Video,
  Headphones,
  MessageSquare,
  Zap,
  Target,
  Shield,
  Eye,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useInterview } from '@/hooks/useInterview';
import { InterviewTimer } from '@/components/InterviewTimer';
import ProctoringOverlay from '@/components/ProctoringOverlay';
import useProctor from '@/hooks/useProctor';
import useProctorStore from '@/store/useProctorStore';
import { QuestionFeedback } from '@/types/interview';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const InterviewSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state?.config;
  
  const {
    session,
    currentQuestionIndex,
    isLoading,
    isGenerating,
    startInterview,
    submitAnswer,
    nextQuestion,
    endInterview,
    currentQuestion,
    progress,
    error,
    timeLimit
  } = useInterview();

  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<QuestionFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const startProctor = useProctorStore((s) => s.start);
  const stopProctor = useProctorStore((s) => s.stop);

  // Callback ref to ensure video element gets the stream immediately when mounted
  const setVideoRef = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && mediaStreamRef.current) {
      element.srcObject = mediaStreamRef.current;
    }
  }, []);

  useEffect(() => {
    if (!config) {
      navigate('/setup');
      return;
    }

    const init = async () => {
      if (config.proctorEnabled) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          mediaStreamRef.current = stream;
          setMediaStream(stream);
          if (videoRef.current) videoRef.current.srcObject = stream;
          setCameraEnabled(true);
          startProctor();

          // wait for proctor init (ready or error) with timeout
          const start = Date.now();
          const timeout = 10000; // ms
          while (true) {
            const st = useProctorStore.getState().status;
            if (st === 'ready') break;
            if (st === 'error') {
              toast.error('Proctoring failed to initialize. Please check your browser or model files.');
              // stop proctor and return to setup
              stopProctor();
              navigate('/setup');
              return;
            }
            if (Date.now() - start > timeout) {
              toast.error('Proctoring initialization timed out. Please try again.');
              stopProctor();
              navigate('/setup');
              return;
            }
            // small delay
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, 200));
          }
        } catch (err) {
          console.error('Camera permission required for proctoring', err);
          toast.error('Camera permission is required for proctoring. Please enable it to continue.');
          navigate('/setup');
          return;
        }
      }

      startInterview(config);
    };

    init();
  }, [config, navigate, startInterview, startProctor]);

  // Ensure video stream is attached when camera is enabled
  useEffect(() => {
    if (cameraEnabled && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [cameraEnabled]);

  // Start timer when question loads
  useEffect(() => {
    if (session && currentQuestion && !showFeedback) {
      setTimerActive(true);
      setElapsedTime(0);
    }
  }, [session, currentQuestion, showFeedback, currentQuestionIndex]);

  const toggleCamera = useCallback(async () => {
    // If proctoring is required, prevent turning off camera
    if (cameraEnabled) {
      if (config?.proctorEnabled) {
        toast.warning('Camera must remain enabled for proctored interviews.');
        return;
      }
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      stopProctor();
      setCameraEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraEnabled(true);
      } catch (err) {
        console.error('Camera access denied:', err);
      }
    }
  }, [cameraEnabled, config, stopProctor]);

  const handleTimeUp = useCallback(() => {
    toast.warning("Time's up! Submitting your current answer...");
    if (answer.trim()) {
      handleSubmitAnswer();
    } else {
      // Auto-submit with empty answer penalty
      handleSubmitAnswer();
    }
  }, [answer]);

  const handleTimeUpdate = useCallback((elapsed: number) => {
    setElapsedTime(elapsed);
  }, []);

  // Initialize proctoring hook (reads store.enabled internally)
  const handleProctorWarning = useCallback((type: string, message?: string) => {
    if (message) toast.warning(message);
  }, []);

  useProctor({ videoRef, onWarning: handleProctorWarning });

  const handleSubmitAnswer = async () => {
    if (isLoading) return;
    
    setTimerActive(false);
    const timeTaken = elapsedTime;
    
    try {
      const feedback = await submitAnswer(answer || "(No answer provided)", timeTaken);
      setCurrentFeedback(feedback);
      setShowFeedback(true);
      setAnswer('');
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleNextQuestion = async () => {
    if (session && currentQuestionIndex >= session.questions.length - 1) {
      const completedSession = await endInterview();
      navigate('/results', { state: { session: completedSession } });
    } else {
      nextQuestion();
      setShowFeedback(false);
      setCurrentFeedback(null);
      setElapsedTime(0);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-700/50">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Interview Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button 
            onClick={() => navigate('/setup')} 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            Go Back to Setup
          </Button>
        </div>
      </div>
    );
  }

  if (isGenerating || !session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="w-28 h-28 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <div className="absolute inset-0 w-28 h-28 border-4 border-transparent border-t-white border-r-white rounded-2xl animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          {isGenerating ? 'Generating AI Questions...' : 'Preparing Your Interview...'}
        </h2>
        <p className="text-gray-400 max-w-md text-center mb-8">
          {isGenerating 
            ? 'Our AI is crafting personalized questions based on your role and difficulty level.' 
            : 'Setting up your interview environment and proctoring system.'
          }
        </p>
        <div className="w-64">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-800/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3">
                <Logo />
              </Link>
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                  Live Session
                </span>
                <span className="text-gray-400">
                  <span className="text-white font-semibold">{currentQuestionIndex + 1}</span> of {session.questions.length}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-40">
                  <Progress value={progress} className="h-2 bg-gray-700" />
                </div>
                <span className="text-sm text-gray-400 font-medium">{progress}%</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Recording</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-8 py-8">
        {config?.proctorEnabled && (
          <ProctoringOverlay enabledByDefault={true} videoRef={videoRef} cameraEnabled={cameraEnabled} stream={mediaStream} />
        )}
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Camera & Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Camera Preview */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-700/50">
                <h3 className="font-bold flex items-center">
                  <Video className="h-5 w-5 mr-2 text-blue-400" />
                  Camera Preview
                  {config?.proctorEnabled && (
                    <span className="ml-2 px-2 py-1 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 text-xs rounded-full border border-green-500/30">
                      <Shield className="h-3 w-3 inline mr-1" />
                      Proctored
                    </span>
                  )}
                </h3>
              </div>
              <div className="p-4">
                <div className="aspect-[4/3] bg-gray-900/50 rounded-xl overflow-hidden relative border border-gray-700/50">
                  {cameraEnabled ? (
                    <video 
                      ref={setVideoRef}
                      autoPlay 
                      muted 
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gray-800/70 rounded-full flex items-center justify-center mb-4">
                        <CameraOff className="h-10 w-10 text-gray-600" />
                      </div>
                      <p className="text-gray-500">Camera is disabled</p>
                      <p className="text-gray-600 text-sm mt-1">Enable for proctoring</p>
                    </div>
                  )}
                  
                  {/* Camera controls */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                    <Button
                      size="icon"
                      variant={cameraEnabled ? "default" : "secondary"}
                      onClick={toggleCamera}
                      className="rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:bg-gray-700/80 h-12 w-12"
                    >
                      {cameraEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
                    </Button>
                    <Button
                      size="icon"
                      variant={isRecording ? "destructive" : "secondary"}
                      onClick={toggleRecording}
                      className="rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:bg-gray-700/80 h-12 w-12"
                    >
                      {isRecording ? (
                        <div className="flex items-center">
                          <Mic className="h-5 w-5" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      ) : (
                        <MicOff className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Info */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl">
              <div className="p-6">
                <h3 className="font-bold mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-400" />
                  Session Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-900/30 rounded-lg">
                    <span className="text-gray-400">Role</span>
                    <span className="font-semibold capitalize">{session.jobRole.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-900/30 rounded-lg">
                    <span className="text-gray-400">Difficulty</span>
                    <span className={`font-semibold capitalize px-3 py-1 rounded-full text-sm ${
                      session.difficulty?.toString() === 'hard' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : session.difficulty?.toString() === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {session.difficulty || 'Not Set'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-900/30 rounded-lg">
                    <span className="text-gray-400">Question Type</span>
                    <span className="font-semibold capitalize">{currentQuestion.type}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-900/30 rounded-lg">
                    <span className="text-gray-400">Time Remaining</span>
                    <span className="font-semibold">
                      {Math.floor((currentQuestion.timeLimit || timeLimit) / 60)}:
                      {((currentQuestion.timeLimit || timeLimit) % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Panel */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-xl border border-blue-700/30 rounded-2xl">
              <div className="p-6">
                <h3 className="font-bold mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-400" />
                  Quick Tips
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <MessageSquare className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-sm text-gray-300">Be clear and concise in your answers</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <Headphones className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-sm text-gray-300">Speak clearly if using voice response</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <Eye className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-sm text-gray-300">Maintain eye contact with camera</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <HelpCircle className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-sm text-gray-300">Ask for clarification if needed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Panel - Question & Answer Area */}
          <div className="lg:col-span-2 space-y-8">
            {!showFeedback ? (
              <>
                {/* Timer and Question Card */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Timer */}
                  <div className="w-full md:w-64">
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-400 mb-2 flex items-center justify-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Time Remaining
                        </p>
                        <InterviewTimer
                          timeLimit={currentQuestion.timeLimit || timeLimit}
                          isActive={timerActive && !isLoading}
                          onTimeUp={handleTimeUp}
                          onTimeUpdate={handleTimeUpdate}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Elapsed Time</p>
                        <p className="text-xl font-bold">
                          {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Question Card */}
                  <div className="flex-1 bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-xl border border-blue-700/30 rounded-2xl overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Brain className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                {currentQuestion.type} Question
                              </span>
                              <span className="text-sm text-gray-400">
                                Question {currentQuestionIndex + 1}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-400">
                              <Clock className="h-4 w-4 mr-1" />
                              {Math.floor((currentQuestion.timeLimit || timeLimit) / 60)}:{((currentQuestion.timeLimit || timeLimit) % 60).toString().padStart(2, '0')} limit
                            </div>
                          </div>
                          <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>
                          <div className="flex items-center text-sm text-gray-400">
                            {currentQuestion.answerMode === 'voice' ? (
                              <>
                                <Mic className="h-4 w-4 mr-2" />
                                Voice response recommended, or type below
                              </>
                            ) : (
                              <>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Type your answer in the box below
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answer Input */}
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                        Your Answer
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">{answer.length} characters</span>
                        {currentQuestion.answerMode === 'voice' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Volume2 className="h-4 w-4 mr-2" />
                            Voice Input
                          </Button>
                        )}
                      </div>
                    </div>
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder={
                        currentQuestion.answerMode === 'voice' 
                          ? "Type your answer here or use voice input...\n\nSpeak clearly and structure your response with clear points."
                          : "Type your detailed answer here...\n\nBe specific, provide examples, and structure your thoughts clearly."
                      }
                      className="min-h-[200px] bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 resize-none focus:border-blue-500 focus:ring-blue-500 text-base"
                      disabled={isLoading}
                    />
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700/50">
                      <div className="text-sm text-gray-500">
                        Press Enter for new line • Ctrl+Enter to submit
                      </div>
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={isLoading || !answer.trim()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-base font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                            Evaluating Answer...
                          </>
                        ) : (
                          <>
                            Submit Answer
                            <Send className="h-5 w-5 ml-3" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Feedback Display */
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden animate-in fade-in duration-500">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Question Feedback</h2>
                      <p className="text-gray-400">Detailed analysis of your response</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Time bonus display */}
                      {currentFeedback?.timeBonus !== 0 && (
                        <div className={cn(
                          "flex items-center space-x-2 px-4 py-2 rounded-xl font-medium",
                          currentFeedback?.timeBonus && currentFeedback.timeBonus > 0 
                            ? "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30" 
                            : "bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30"
                        )}>
                          {currentFeedback?.timeBonus && currentFeedback.timeBonus > 0 ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <TrendingDown className="h-5 w-5" />
                          )}
                          <span>
                            {currentFeedback?.timeBonus && currentFeedback.timeBonus > 0 ? '+' : ''}
                            {currentFeedback?.timeBonus?.toFixed(1)} time bonus
                          </span>
                        </div>
                      )}
                      <div className="text-right">
                        <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          {currentFeedback?.adjustedScore.toFixed(1)}
                          <span className="text-2xl text-gray-400">/10</span>
                        </div>
                        <div className="text-sm text-gray-400">Final Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'Clarity', value: currentFeedback?.clarity, icon: MessageSquare, color: 'from-blue-500 to-blue-600' },
                      { label: 'Relevance', value: currentFeedback?.relevance, icon: Target, color: 'from-green-500 to-green-600' },
                      { label: 'Technical Accuracy', value: currentFeedback?.technicalAccuracy, icon: Brain, color: 'from-purple-500 to-purple-600' },
                      { label: 'Communication', value: currentFeedback?.communication, icon: Volume2, color: 'from-amber-500 to-amber-600' },
                    ].map((metric, i) => (
                      <div key={i} className="bg-gray-900/50 rounded-xl p-5 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}>
                            <metric.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{metric.value}</div>
                            <div className="text-xs text-gray-400">/10</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">{metric.label}</div>
                        <div className="h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                            style={{ width: `${(metric.value || 0) * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700/30 rounded-2xl p-6">
                      <h4 className="font-bold text-green-400 flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-green-400" />
                        </div>
                        Strengths
                      </h4>
                      <ul className="space-y-3">
                        {currentFeedback?.strengths.map((s, i) => (
                          <li key={i} className="flex items-start">
                            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                            <span className="text-gray-300">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 border border-amber-700/30 rounded-2xl p-6">
                      <h4 className="font-bold text-amber-400 flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                          <XCircle className="h-6 w-6 text-amber-400" />
                        </div>
                        Areas to Improve
                      </h4>
                      <ul className="space-y-3">
                        {currentFeedback?.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start">
                            <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            </div>
                            <span className="text-gray-300">{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/30 rounded-2xl p-6 mb-8">
                    <h4 className="font-bold text-blue-400 flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <Zap className="h-6 w-6 text-blue-400" />
                      </div>
                      Suggestions for Improvement
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {currentFeedback?.improvements.map((imp, i) => (
                        <div key={i} className="flex items-start p-4 bg-gray-900/30 rounded-xl">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-blue-400 font-bold">{i + 1}</span>
                          </div>
                          <span className="text-gray-300">{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleNextQuestion}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-semibold rounded-xl"
                  >
                    {currentQuestionIndex >= session.questions.length - 1 ? (
                      <>
                        View Complete Interview Results
                        <ChevronRight className="h-5 w-5 ml-3" />
                      </>
                    ) : (
                      <>
                        Continue to Next Question
                        <ArrowRight className="h-5 w-5 ml-3" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewSession;