import React from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className, 
  iconClassName, 
  textClassName,
  showText = true 
}) => {
  return (
    <div className={cn("flex items-center gap-3 group cursor-pointer", className)}>
      <div className={cn(
        "relative w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-blue-500/40",
        iconClassName
      )}>
        <Brain className="w-6 h-6 text-white animate-pulse" />
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-4 h-4 text-yellow-400 animate-bounce delay-75" />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200 group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-500",
            textClassName
          )}>
            HireBotics
          </span>
          <span className="text-[8px] uppercase tracking-[0.2em] text-blue-400/80 font-bold -mt-1 group-hover:text-blue-300 transition-colors duration-500">
            Next-Gen Recruitment
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
