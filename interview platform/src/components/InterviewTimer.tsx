import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  Timer, 
  AlertTriangle, 
  Clock, 
  Zap, 
  CheckCircle,
  Hourglass,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  AlertCircle,
  Sparkles,
  Award
} from 'lucide-react';

interface InterviewTimerProps {
  timeLimit: number; // in seconds
  isActive: boolean;
  onTimeUp: () => void;
  onTimeUpdate: (elapsed: number) => void;
  className?: string;
}

export function InterviewTimer({ 
  timeLimit, 
  isActive, 
  onTimeUp, 
  onTimeUpdate,
  className 
}: InterviewTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const remaining = Math.max(0, timeLimit - elapsed);
  const progress = (remaining / timeLimit) * 100;
  
  // Determine urgency level
  const isWarning = remaining <= timeLimit * 0.3 && remaining > timeLimit * 0.1;
  const isCritical = remaining <= timeLimit * 0.1;
  const isPlenty = progress > 70;
  
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLimit, onTimeUp, onTimeUpdate]);

  // Notify parent about elapsed/time-up from a separate effect (avoids setState-in-render)
  useEffect(() => {
    // Only notify when timer is active
    if (!isActive) return;

    onTimeUpdate(elapsed);
    if (elapsed >= timeLimit) {
      onTimeUp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);
  
  // Reset when question changes
  const reset = useCallback(() => {
    setElapsed(0);
  }, []);
  
  // Expose reset method
  useEffect(() => {
    if (!isActive && elapsed > 0) {
      // Don't reset automatically, let parent handle it
    }
  }, [isActive, elapsed]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeStatus = () => {
    if (isCritical) return { label: 'Critical', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-500' };
    if (isWarning) return { label: 'Warning', icon: <AlertCircle className="h-4 w-4" />, color: 'text-amber-500' };
    if (isPlenty) return { label: 'Plenty', icon: <BatteryFull className="h-4 w-4" />, color: 'text-green-500' };
    return { label: 'Normal', icon: <Battery className="h-4 w-4" />, color: 'text-blue-500' };
  };

  const status = getTimeStatus();
  
  return (
    <div className={cn("flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl", className)}>
      {/* Timer Header */}
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm text-gray-400">Time Remaining</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{formatTime(remaining)}</span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color} bg-white/10`}>
                {status.icon}
                <span>{status.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Circular progress timer */}
      <div className="relative w-48 h-48">
        {/* Outer glow */}
        <div className={cn(
          "absolute inset-0 rounded-full blur-xl opacity-30",
          isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-blue-500"
        )}></div>
        
        {/* Progress circle */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-700/50"
          />
          {/* Progress circle with gradient */}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {isCritical ? (
                <>
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </>
              ) : isWarning ? (
                <>
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </>
              ) : isPlenty ? (
                <>
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </>
              )}
            </linearGradient>
          </defs>
        </svg>
        
        {/* Timer center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isPlenty && (
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center animate-pulse">
              <Zap className="h-5 w-5 text-white" />
            </div>
          )}
          
          <div className="text-center">
            <div className={cn(
              "text-4xl font-mono font-bold mb-1 tracking-tight",
              isCritical ? "text-red-400" : 
              isWarning ? "text-amber-400" : 
              "text-white"
            )}>
              {formatTime(remaining)}
            </div>
            <div className="text-xs text-gray-400">
              {Math.floor(timeLimit / 60)}:{String(timeLimit % 60).padStart(2, '0')} total
            </div>
          </div>
          
          {/* Time used indicator */}
          <div className="mt-4 text-xs text-gray-500">
            Used: {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Time Progress</span>
          <span>{Math.round(progress)}% remaining</span>
        </div>
        <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isCritical ? "bg-gradient-to-r from-red-500 to-red-600" :
              isWarning ? "bg-gradient-to-r from-amber-500 to-amber-600" :
              "bg-gradient-to-r from-blue-500 to-blue-600"
            )}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Start</span>
          <span>30%</span>
          <span>50%</span>
          <span>70%</span>
          <span>End</span>
        </div>
      </div>
      
      {/* Bonus Indicator */}
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-xl border w-full transition-all",
        isPlenty 
          ? "bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30 text-green-400"
          : isCritical 
          ? "bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/30 text-red-400"
          : "bg-gray-800/50 border-gray-700/50 text-gray-400"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isPlenty ? "bg-green-500/20" : isCritical ? "bg-red-500/20" : "bg-gray-700/50"
        )}>
          {isPlenty ? (
            <Award className="h-5 w-5" />
          ) : isCritical ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <Timer className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium">
            {isPlenty ? 'Time Bonus Active' : 
             isCritical ? 'Time Running Out!' : 
             'Normal Pace'}
          </div>
          <div className="text-sm opacity-80">
            {isPlenty ? 'Answering quickly earns extra points!' :
             isCritical ? 'Complete your answer soon' :
             'You have plenty of time remaining'}
          </div>
        </div>
        {isPlenty && (
          <Sparkles className="h-5 w-5 animate-pulse" />
        )}
      </div>
    </div>
  );
}

// Hook for managing timer state per question
export function useQuestionTimer(timeLimit: number) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);
  
  const stop = useCallback(() => {
    setIsRunning(false);
    return elapsed;
  }, [elapsed]);
  
  const reset = useCallback(() => {
    setElapsed(0);
    setIsRunning(false);
  }, []);
  
  const updateElapsed = useCallback((newElapsed: number) => {
    setElapsed(newElapsed);
  }, []);
  
  // Calculate time bonus: faster = higher bonus
  const calculateTimeBonus = useCallback(() => {
    const percentUsed = elapsed / timeLimit;
    
    if (percentUsed <= 0.3) return 2; // Used less than 30% time: +2 bonus
    if (percentUsed <= 0.5) return 1.5; // Used less than 50% time: +1.5 bonus
    if (percentUsed <= 0.7) return 1; // Used less than 70% time: +1 bonus
    if (percentUsed <= 0.9) return 0.5; // Used less than 90% time: +0.5 bonus
    if (percentUsed >= 1) return -1; // Ran out of time: -1 penalty
    return 0;
  }, [elapsed, timeLimit]);
  
  return {
    elapsed,
    isRunning,
    start,
    stop,
    reset,
    updateElapsed,
    calculateTimeBonus,
    remaining: Math.max(0, timeLimit - elapsed)
  };
}