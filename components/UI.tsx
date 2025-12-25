
import React, { useRef, useEffect } from 'react';
import { useStore } from '../store';
import HandTracker from './HandTracker';

// SVG Icons
const SnowflakeIcon = () => (
    <svg className="w-6 h-6 text-white animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
    </svg>
);

const CameraIcon = ({ on }: { on: boolean }) => (
    <svg className={`w-5 h-5 ${on ? 'text-green-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const UploadIcon = () => (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const MagicIcon = () => (
    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
    </svg>
);

const UI: React.FC = () => {
  const { phase, gesture, handX, handY, cameraEnabled, toggleCamera, addUserPhotos, userPhotos, setPhase } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.play().catch(err => console.log("Autoplay prevented:", err));
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files) as File[];
          const urls: string[] = [];
          files.forEach((file: File) => {
              if (file.type.startsWith('image/')) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                      if (ev.target?.result) {
                          urls.push(ev.target.result as string);
                          if (urls.length === files.length) {
                              addUserPhotos(urls);
                              if (phase === 'tree') setPhase('blooming');
                          }
                      }
                  };
                  reader.readAsDataURL(file);
              }
          });
      }
  };

  const togglePhaseManual = () => {
      if (phase === 'tree' || phase === 'collapsing') setPhase('blooming');
      else if (phase === 'nebula' || phase === 'blooming') setPhase('collapsing');
  };

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
        
        {/* Top Section */}
        <div className="flex justify-between items-start">
            <div className="flex flex-col gap-4">
                <div className="backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-xl shadow-lg animate-fade-in w-56">
                    <h2 className="text-white/60 text-[10px] uppercase tracking-widest mb-2 font-semibold border-b border-white/10 pb-1">Motion Sensor</h2>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${gesture !== 'None' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                            <span className="text-white font-mono text-[10px]">
                                {gesture === 'None' ? 'SEARCHING...' : gesture.replace('_', ' ')}
                            </span>
                        </div>
                        <span className="text-white/40 text-[9px] uppercase font-bold">{phase}</span>
                    </div>
                    
                    {/* 2D Control Pad */}
                    <div className="relative w-full aspect-square bg-black/40 rounded-lg border border-white/5 overflow-hidden group">
                        {/* Grid lines */}
                        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-10">
                            {[...Array(16)].map((_, i) => <div key={i} className="border-[0.5px] border-white" />)}
                        </div>
                        
                        {/* Center lines */}
                        <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-white/10" />
                        <div className="absolute left-1/2 top-0 w-[0.5px] h-full bg-white/10" />

                        {/* Hand Marker */}
                        {gesture !== 'None' && (
                            <div 
                                className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-out"
                                style={{ left: `${handX * 100}%`, top: `${(1 - handY) * 100}%` }}
                            >
                                <div className="w-full h-full rounded-full bg-yellow-400 shadow-[0_0_15px_#fbbf24] animate-pulse" />
                                <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400 opacity-20" />
                            </div>
                        )}

                        {/* Axis Labels */}
                        <div className="absolute bottom-1 w-full text-center text-[7px] text-white/30 uppercase tracking-tighter">Rotation Axis</div>
                        <div className="absolute left-1 top-1/2 -rotate-90 origin-left -translate-y-1/2 text-[7px] text-white/30 uppercase tracking-tighter">Scale Axis</div>
                    </div>

                    <div className="mt-3 flex justify-between text-[8px] text-white/40 font-mono">
                        <span>X: {handX.toFixed(2)}</span>
                        <span>Y: {handY.toFixed(2)}</span>
                    </div>
                </div>

                {userPhotos.length > 0 && (
                    <div className="backdrop-blur-md bg-black/20 border border-white/10 p-3 rounded-xl shadow-lg w-56 pointer-events-auto overflow-hidden">
                        <h3 className="text-white/60 text-[10px] uppercase tracking-wider mb-2 font-bold">Your Memories ({userPhotos.length})</h3>
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {userPhotos.map((url, i) => (
                                <div key={i} className="w-10 h-10 rounded border border-white/20 overflow-hidden bg-white/10 flex-shrink-0">
                                    <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="pointer-events-auto relative flex flex-col items-end gap-3">
                <button 
                    onClick={togglePhaseManual}
                    className="group backdrop-blur-md bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-200 px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-lg active:scale-95"
                >
                    <MagicIcon />
                    <span className="text-xs font-bold uppercase tracking-tighter">
                        {phase === 'tree' ? 'Bloom Memories' : 'Back to Tree'}
                    </span>
                </button>

                <div className="h-px w-12 bg-white/10 my-1" />

                <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current?.click()} className="backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95">
                    <UploadIcon />
                    <span className="text-xs font-medium uppercase">Add Photos</span>
                </button>

                <button onClick={toggleCamera} className="backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95">
                    <CameraIcon on={cameraEnabled} />
                    <span className="text-xs font-medium uppercase">{cameraEnabled ? 'Stop Tracking' : 'Start Tracking'}</span>
                </button>

                <HandTracker />
            </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-4 pointer-events-auto">
            {phase === 'nebula' && (
                <div className="flex flex-col items-center gap-1 text-white/40 text-[9px] uppercase tracking-[0.2em]">
                    <span className="animate-pulse">Move hand <b className="text-yellow-200">UP</b> to Scale UP • <b className="text-yellow-200">DOWN</b> to Scale DOWN</span>
                    {gesture === 'None' && <span className="text-red-400/60 font-bold">Resting Mode - Show Hand to Control</span>}
                </div>
            )}
            <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-full px-6 py-2 flex items-center gap-4 shadow-2xl hover:bg-black/60 transition-all group">
                <div className="animate-spin-slow p-1 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                    <SnowflakeIcon />
                </div>
                <div className="overflow-hidden w-40 relative">
                    <div className="whitespace-nowrap animate-marquee text-white/80 text-[11px] font-medium uppercase tracking-widest">
                        Christmas Memories • Interactive WebGL Experience
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <audio ref={audioRef} autoPlay loop src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Gustav_Holst_-_the_planets%2C_op._32_-_iii._mercury%2C_the_winged_messenger.ogg" />
      
      <style>{`
        @keyframes marquee { 0% { transform: translateX(50%); } 100% { transform: translateX(-150%); } }
        .animate-marquee { display: inline-block; animation: marquee 12s linear infinite; }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
      `}</style>
    </>
  );
};

export default UI;
