
import { create } from 'zustand';
import { AppState } from './types';

export const useStore = create<AppState>((set) => ({
  phase: 'tree',
  gesture: 'None',
  handX: 0.5,
  handY: 0.5, // Default to center
  cameraEnabled: false,
  userPhotos: [],
  setPhase: (phase) => set({ phase }),
  setGesture: (gesture) => set({ gesture }),
  setHandX: (handX) => set({ handX }),
  setHandY: (handY) => set({ handY }),
  setCameraEnabled: (enabled) => set({ cameraEnabled: enabled }),
  toggleCamera: () => set((state) => ({ cameraEnabled: !state.cameraEnabled })),
  addUserPhotos: (photos) => set((state) => ({ 
    userPhotos: [...photos, ...state.userPhotos] 
  })),
}));
