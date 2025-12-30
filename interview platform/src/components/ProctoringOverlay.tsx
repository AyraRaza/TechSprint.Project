import React, { useRef, useEffect } from 'react';
import useProctorStore from '@/store/useProctorStore';
import type { MutableRefObject } from 'react';
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  Camera, 
  CameraOff, 
  CheckCircle2,
  XCircle,
  Activity,
  AlertCircle,
  Zap,
  Bell,
  Video,
  Battery,
  BatteryCharging,
  BatteryFull
} from 'lucide-react';

type Props = {
  enabledByDefault?: boolean;
  onReady?: () => void;
  videoRef?: MutableRefObject<HTMLVideoElement | null>;
  cameraEnabled?: boolean;
  stream?: MediaStream | null;
};

export const ProctoringOverlay: React.FC<Props> = ({ enabledByDefault = false, onReady, videoRef, cameraEnabled, stream }) => {
  const overlayRef = useRef<HTMLVideoElement | null>(null);
  const start = useProctorStore((s) => s.start);
  const stop = useProctorStore((s) => s.stop);
  const warnings = useProctorStore((s) => s.warnings);
  const violations = useProctorStore((s) => s.violations);

  useEffect(() => {
    onReady?.();
    return () => {};
  }, [enabledByDefault, start, stop, onReady]);

  // Mirror the main video stream into the small overlay video (if provided)
  useEffect(() => {
    if (!overlayRef.current) return;
    
    if (stream) {
      overlayRef.current.srcObject = stream;
    } else if (videoRef && videoRef.current) {
      overlayRef.current.srcObject = videoRef.current.srcObject as MediaStream | null;
    }
  }, [videoRef, cameraEnabled, stream]);

  // Calculate status indicators
  const getStatusLevel = () => {
    if (violations.length > 2) return { level: 'critical', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: <XCircle className="h-4 w-4" /> };
    if (violations.length > 0) return { level: 'warning', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', icon: <AlertTriangle className="h-4 w-4" /> };
    if (warnings > 0) return { level: 'monitoring', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: <Eye className="h-4 w-4" /> };
    return { level: 'secure', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', icon: <CheckCircle2 className="h-4 w-4" /> };
  };

  const getBatteryLevel = () => {
    if (violations.length > 2) return { level: 'low', icon: <Battery className="h-4 w-4" />, color: 'text-red-400' };
    if (violations.length > 0) return { level: 'medium', icon: <BatteryCharging className="h-4 w-4" />, color: 'text-amber-400' };
    return { level: 'full', icon: <BatteryFull className="h-4 w-4" />, color: 'text-green-400' };
  };

  const status = getStatusLevel();
  const battery = getBatteryLevel();

  return (
    <div className="proctor-overlay fixed bottom-6 left-6 z-50">
      <div className={`w-56 p-3 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-xl border ${status.border} shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${status.color}`} />
            <span className="font-bold text-white text-sm">Proctoring</span>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.color}`}>
            {status.level}
          </div>
        </div>

        {/* Video Feed */}
        <div className="relative mb-3">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-700/50 bg-black">
            {cameraEnabled ? (
              <video
                ref={(r) => (overlayRef.current = r)}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/50">
                <CameraOff className="h-5 w-5 text-gray-600" />
              </div>
            )}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 px-1.5 py-0.5 rounded text-[10px] text-white">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              REC
            </div>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-800/50 rounded-lg p-2 border border-gray-700/30">
            <div className="text-[10px] text-gray-400 mb-0.5">Warnings</div>
            <div className={`text-sm font-bold ${warnings > 0 ? 'text-amber-400' : 'text-green-400'}`}>
              {warnings}
            </div>
          </div>
          <div className="flex-1 bg-gray-800/50 rounded-lg p-2 border border-gray-700/30">
            <div className="text-[10px] text-gray-400 mb-0.5">Violations</div>
            <div className={`text-sm font-bold ${violations.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {violations.length}
            </div>
          </div>
        </div>

        {/* Minimal Activity */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            <span>AI active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${cameraEnabled ? 'bg-green-400' : 'bg-gray-500'}`}></div>
            <span>{cameraEnabled ? 'Live' : 'Standby'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProctoringOverlay;