// import { useEffect, useRef } from 'react';
// import type { MutableRefObject } from 'react';
// import useProctorStore from '@/store/useProctorStore';
// import * as tf from '@tensorflow/tfjs';
// import * as blazeface from '@tensorflow-models/blazeface';

// type ViolationType = 'no-face' | 'multiple-faces' | 'look-away' | 'face-offscreen';

// type UseProctorOptions = {
//   videoRef: MutableRefObject<HTMLVideoElement | null>;
//   onWarning?: (type: ViolationType, message?: string) => void;
//   sessionId?: string;
//   userId?: string;
// };

// export function useProctor({ videoRef, onWarning, sessionId, userId }: UseProctorOptions) {
//   const enabled = useProctorStore((s) => s.enabled);
//   const addViolation = useProctorStore((s) => s.addViolation);
//   const addWarning = useProctorStore((s) => s.addWarning);
//   const stopStore = useProctorStore((s) => s.stop);

//   const modelRef = useRef<any>(null);
//   const rafRef = useRef<number | null>(null);
//   const socketRef = useRef<any>(null);
  
//   // Refs for throttling and persistence
//   const lastWarningTimeRef = useRef<number>(0);
//   const consecutiveNoFaceRef = useRef<number>(0);
//   const consecutiveMultiFaceRef = useRef<number>(0);

//   useEffect(() => {
//     if (!enabled) return;

//     let mounted = true;

//     (async () => {
//       try {
//         // Set TensorFlow.js backend
//         await tf.setBackend('webgl');
//         await tf.ready();

//         // Mark initializing
//         try { (useProctorStore as any).setState?.({ status: 'initializing' }); } catch {}

//         // Load BlazeFace model
//         const model = await tf.loadGraphModel('/models/blazeface.json');
//         modelRef.current = model;

//         console.info('BlazeFace model loaded successfully');
//         try { (useProctorStore as any).setState?.({ status: 'ready', mode: 'reduced' }); } catch {}

//         // optional: connect socket.io to report violations/events
//         try {
//           const { io } = await import('socket.io-client');
//           const server = (import.meta.env as any).VITE_PROCTOR_SERVER || window.location.origin;
//           socketRef.current = io(server);
//           socketRef.current.on('connect', () => {
//             // connected
//           });
//         } catch (e) {
//           // socket optional
//           socketRef.current = null;
//         }

//         const loop = async () => {
//           if (!mounted) return;
//           try {
//             const video = videoRef.current;
//             if (video && !video.paused && !video.ended && video.videoWidth > 0) {
//               // Prepare input tensor
//               const input = tf.tidy(() => {
//                 const tensor = tf.browser.fromPixels(video);
//                 const resized = tf.image.resizeBilinear(tensor, [256, 256]);
//                 const normalized = resized.div(255.0);
//                 const batched = normalized.expandDims(0);
//                 tensor.dispose();
//                 resized.dispose();
//                 return batched;
//               });

//               // Run detection
//               const predictions = await model.predict(input) as tf.Tensor[];
//               const boxes = predictions[0]; // Bounding boxes
//               const scores = predictions[1]; // Confidence scores

//               const boxesData = await boxes.data();
//               const scoresData = await scores.data();

//               input.dispose();
//               boxes.dispose();
//               scores.dispose();

//               // Count faces with score > 0.75 (increased threshold to reduce false positives)
//               let faceCount = 0;
//               for (let i = 0; i < scoresData.length; i++) {
//                 if (scoresData[i] > 0.75) {
//                   faceCount++;
//                 }
//               }

//               const now = Date.now();
//               const WARNING_COOLDOWN = 5000; // 5 seconds
//               const PERSISTENCE_THRESHOLD = 30; // ~1 second at 30fps

//               if (faceCount === 0) {
//                 consecutiveNoFaceRef.current++;
//                 consecutiveMultiFaceRef.current = 0;

//                 if (consecutiveNoFaceRef.current > PERSISTENCE_THRESHOLD) {
//                   if (now - lastWarningTimeRef.current > WARNING_COOLDOWN) {
//                     addWarning();
//                     const violation: { id: string; type: ViolationType; timestamp: number; message: string } = {
//                       id: String(now),
//                       type: 'no-face',
//                       timestamp: now,
//                       message: 'Face not detected'
//                     };
//                     addViolation(violation);
//                     onWarning?.('no-face', 'Face not detected');
//                     socketRef.current?.emit?.('violation', { ...violation, sessionId, userId });
//                     lastWarningTimeRef.current = now;
//                   }
//                 }
//               } else if (faceCount > 1) {
//                 consecutiveMultiFaceRef.current++;
//                 consecutiveNoFaceRef.current = 0;

//                 if (consecutiveMultiFaceRef.current > PERSISTENCE_THRESHOLD) {
//                   if (now - lastWarningTimeRef.current > WARNING_COOLDOWN) {
//                     addWarning();
//                     const violation: { id: string; type: ViolationType; timestamp: number; message: string } = {
//                       id: String(now),
//                       type: 'multiple-faces',
//                       timestamp: now,
//                       message: 'Multiple faces detected'
//                     };
//                     addViolation(violation);
//                     onWarning?.('multiple-faces', 'Multiple faces detected');
//                     socketRef.current?.emit?.('violation', { ...violation, sessionId, userId });
//                     lastWarningTimeRef.current = now;
//                   }
//                 }
//               } else {
//                 // Reset counters if everything is normal
//                 consecutiveNoFaceRef.current = 0;
//                 consecutiveMultiFaceRef.current = 0;
//               }
//             }
//           } catch (err) {
//             console.error('Proctor detect error:', err);
//             stopStore();
//             return;
//           }
//           rafRef.current = requestAnimationFrame(loop);
//         };

//         rafRef.current = requestAnimationFrame(loop);
//       } catch (err) {
//         console.error('Failed to initialize proctoring:', err);
//         try { (useProctorStore as any).setState?.({ status: 'error', mode: 'none' }); } catch {}
//         stopStore();
//       }
//     })();

//     return () => {
//       mounted = false;
//       if (rafRef.current) cancelAnimationFrame(rafRef.current);
//       if (modelRef.current) {
//         try { modelRef.current.dispose(); } catch (e) {}
//       }
//       if (socketRef.current) {
//         try { socketRef.current.disconnect(); } catch (e) {}
//       }
//     };
//   }, [enabled, videoRef, onWarning, addViolation, addWarning, stopStore]);

//   return {
//     enabled,
//   };
// }

// export default useProctor;

import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import useProctorStore from '@/store/useProctorStore';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

type ViolationType =
  | 'no-face'
  | 'multiple-faces'
  | 'look-away'
  | 'face-offscreen'
  | 'camera-covered';

type UseProctorOptions = {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  onWarning?: (type: ViolationType, message?: string) => void;
  sessionId?: string;
  userId?: string;
};

export function useProctor({
  videoRef,
  onWarning,
  sessionId,
  userId,
}: UseProctorOptions) {
  const enabled = useProctorStore((s) => s.enabled);
  const setStatus = useProctorStore((s) => s.setStatus);
  const addViolation = useProctorStore((s) => s.addViolation);
  const addWarning = useProctorStore((s) => s.addWarning);
  const stopStore = useProctorStore((s) => s.stop);

  const modelRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const rafRef = useRef<number | null>(null);
  const socketRef = useRef<any>(null);

  const lastWarningTimeRef = useRef<number>(0);
  const consecutiveNoFaceRef = useRef<number>(0);
  const consecutiveMultiFaceRef = useRef<number>(0);
  const consecutiveDarkFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }
    let mounted = true;

    (async () => {
      try {
        // Set TensorFlow.js backend
        try {
          await tf.setBackend('webgl');
          await tf.ready();
        } catch (e) {
          console.warn('WebGL backend failed, falling back to CPU', e);
          await tf.setBackend('cpu');
          await tf.ready();
        }

        // Mark initializing
        (useProctorStore as any).setState?.({ status: 'initializing' });

        // Load BlazeFace model (official TF.js package)
        const model = await blazeface.load();
        modelRef.current = model;
        
        if (mounted) {
          setStatus('ready');
          console.log('Proctoring system ready and monitoring');
        }

        console.info('BlazeFace model loaded successfully');
        (useProctorStore as any).setState?.({ status: 'ready', mode: 'reduced' });

        // Optional: connect socket.io
        try {
          const { io } = await import('socket.io-client');
          const server = (import.meta.env as any).VITE_PROCTOR_SERVER || window.location.origin;
          socketRef.current = io(server);
        } catch {
          socketRef.current = null;
        }

        // Detection loop
        const loop = async () => {
          if (!mounted) return;

          const video = videoRef.current;
          if (video && !video.paused && !video.ended && video.videoWidth > 0 && modelRef.current) {
            try {
              const predictions = await modelRef.current.estimateFaces(video, false);

              let faceCount = predictions.length;
              const now = Date.now();
              const WARNING_COOLDOWN = 5000; // 5 sec
              const PERSISTENCE_THRESHOLD = 30; // ~1 sec at 30fps
              const DARK_FRAME_PERSISTENCE = 30; // ~1 second (reduced from 60)

              const canWarn =
                now - lastWarningTimeRef.current > WARNING_COOLDOWN;

              if (
                consecutiveDarkFrameRef.current > DARK_FRAME_PERSISTENCE &&
                canWarn
              ) {
                const violation = {
                  id: String(now),
                  type: 'camera-covered' as ViolationType,
                  timestamp: now,
                  message: 'Camera appears to be covered',
                };

                addWarning();
                addViolation(violation);
                onWarning?.('camera-covered', violation.message);
                socketRef.current?.emit?.('violation', {
                  ...violation,
                  sessionId,
                  userId,
                });

                lastWarningTimeRef.current = now;
                consecutiveDarkFrameRef.current = 0;
              } else if (faceCount === 0) {
                consecutiveNoFaceRef.current++;
                consecutiveMultiFaceRef.current = 0;

                if (consecutiveNoFaceRef.current > PERSISTENCE_THRESHOLD &&
                    now - lastWarningTimeRef.current > WARNING_COOLDOWN) {
                  addWarning();
                  const violation = {
                    id: String(now),
                    type: 'no-face' as ViolationType,
                    timestamp: now,
                    message: 'Face not detected'
                  };
                  addViolation(violation);
                  onWarning?.('no-face', 'Face not detected');
                  socketRef.current?.emit?.('violation', { ...violation, sessionId, userId });
                  lastWarningTimeRef.current = now;
                }
              } else if (faceCount > 1) {
                consecutiveMultiFaceRef.current++;
                consecutiveNoFaceRef.current = 0;

                if (consecutiveMultiFaceRef.current > PERSISTENCE_THRESHOLD &&
                    now - lastWarningTimeRef.current > WARNING_COOLDOWN) {
                  addWarning();
                  const violation = {
                    id: String(now),
                    type: 'multiple-faces' as ViolationType,
                    timestamp: now,
                    message: 'Multiple faces detected'
                  };
                  addViolation(violation);
                  onWarning?.('multiple-faces', 'Multiple faces detected');
                  socketRef.current?.emit?.('violation', { ...violation, sessionId, userId });
                  lastWarningTimeRef.current = now;
                }
              } else {
                consecutiveNoFaceRef.current = 0;
                consecutiveMultiFaceRef.current = 0;
              }
            } catch (err) {
              console.error('Proctor detect error:', err);
              stopStore();
              return;
            }
          }

          rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

      } catch (err) {
        console.error('Failed to initialize proctoring:', err);
        (useProctorStore as any).setState?.({ status: 'error', mode: 'none' });
        stopStore();
      }
    })();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (modelRef.current) modelRef.current.dispose?.();
      if (socketRef.current) socketRef.current.disconnect?.();
    };
  }, [enabled]);

  return { enabled };
}


export default useProctor;
