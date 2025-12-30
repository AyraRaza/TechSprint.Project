import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Loader2, 
  Shield, 
  Lock, 
  User, 
  Sparkles,
  Brain,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Loading Content */}
        <div className="relative z-10 text-center">
          {/* Animated Logo */}
          <div className="relative mb-10">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
              <div className="w-24 h-24 bg-white/20 rounded-xl flex items-center justify-center">
                <Brain className="h-14 w-14 text-white" />
              </div>
            </div>
            <div className="absolute inset-0 w-32 h-32 border-4 border-transparent border-t-white border-r-white rounded-2xl animate-spin"></div>
            
            {/* Orbiting Dots */}
            <div className="absolute -top-4 -right-4 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce delay-300"></div>
            <div className="absolute top-1/2 -right-8 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-bounce delay-700"></div>
          </div>

          {/* Loading Text */}
          <h2 className="text-3xl font-bold text-white mb-4">
            Securing Your Session
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-10 text-lg">
            We're verifying your credentials and preparing your personalized interview environment
          </p>

          {/* Loading Progress */}
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Authentication Check</span>
              <span className="text-green-400 font-medium">
                <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                Verifying...
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-[loading_2s_ease-in-out_infinite]"></div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Session Initialization</span>
              <span className="text-blue-400 font-medium">Pending</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-2/3"></div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Environment Setup</span>
              <span className="text-gray-400">Waiting</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-1/3"></div>
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-12 pt-8 border-t border-gray-800/50">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="h-4 w-4 text-green-400" />
                <span>End-to-End Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Lock className="h-4 w-4 text-blue-400" />
                <span>Secure Authentication</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <User className="h-4 w-4 text-purple-400" />
                <span>Personalized Session</span>
              </div>
            </div>
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

  if (!user) {
    return (
      <Navigate 
        to="/auth" 
        state={{ 
          from: location,
          redirectMessage: "Please sign in to access this page"
        }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;