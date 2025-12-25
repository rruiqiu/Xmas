
import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { useStore } from '../store';
import { GestureType } from '../types';

const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const { cameraEnabled, setGesture, setHandX, setHandY } = useStore();
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const lastGestureRef = useRef<GestureType>('None');
  const gestureDebounceRef = useRef<number>(0);

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Loading MediaPipe models...");
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );
        gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        console.log("MediaPipe loaded successfully.");
        setLoaded(true);
      } catch (err) {
        console.error("Failed to load MediaPipe:", err);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    let animationId: number;
    let lastVideoTime = -1;

    const enableCam = async () => {
      if (!gestureRecognizerRef.current || !videoRef.current || !cameraEnabled) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play();
                predictWebcam();
            };
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    };

    const predictWebcam = () => {
      if (!cameraEnabled || !videoRef.current || !gestureRecognizerRef.current) return;

      const video = videoRef.current;
      if (video.readyState === 4 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        try {
            const results = gestureRecognizerRef.current.recognizeForVideo(video, performance.now());

            if (results && results.gestures && results.gestures.length > 0) {
              const firstHandGestures = results.gestures[0];
              const landmarks = results.landmarks[0];
              
              if (landmarks && landmarks.length > 0) {
                  const avgX = 1 - (landmarks.reduce((sum, l) => sum + l.x, 0) / landmarks.length);
                  const avgY = 1 - (landmarks.reduce((sum, l) => sum + l.y, 0) / landmarks.length);
                  setHandX(avgX);
                  setHandY(avgY);
              }

              if (firstHandGestures && firstHandGestures.length > 0) {
                  const categoryName = firstHandGestures[0].categoryName;
                  let detected: GestureType = 'None';
                  if (categoryName === 'Open_Palm') detected = 'Open_Palm';
                  if (categoryName === 'Closed_Fist') detected = 'Closed_Fist';

                  if (detected === lastGestureRef.current) {
                    gestureDebounceRef.current++;
                  } else {
                    gestureDebounceRef.current = 0;
                    lastGestureRef.current = detected;
                  }

                  if (gestureDebounceRef.current > 5) {
                    setGesture(detected);
                  }
              }
            } else {
                setGesture('None');
                lastGestureRef.current = 'None';
            }
        } catch (e) {
            console.warn("Prediction loop warning (ignoring):", e);
        }
      }
      animationId = requestAnimationFrame(predictWebcam);
    };

    if (cameraEnabled && loaded) {
      enableCam();
    } else {
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (videoRef.current && videoRef.current.srcObject) {
         (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraEnabled, loaded, setGesture, setHandX, setHandY]);

  if (!cameraEnabled) return null;

  return (
    <div className="absolute top-4 right-4 w-48 h-36 rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-50 pointer-events-none">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform -scale-x-100 opacity-80" 
      />
      {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px] text-white animate-pulse">
              LOADING TRACKER...
          </div>
      )}
      <div className="absolute bottom-1 left-0 w-full text-center text-[10px] text-white/70 font-mono bg-black/50">
          Motion Active
      </div>
    </div>
  );
};

export default HandTracker;
