
export type Phase = 'tree' | 'blooming' | 'nebula' | 'collapsing';

export type GestureType = 'None' | 'Open_Palm' | 'Closed_Fist';

export interface AppState {
  phase: Phase;
  gesture: GestureType;
  handX: number; // 0.0 to 1.0 (Left to Right)
  handY: number; // New: 0.0 to 1.0 (Bottom to Top)
  cameraEnabled: boolean;
  userPhotos: string[];
  setPhase: (phase: Phase) => void;
  setGesture: (gesture: GestureType) => void;
  setHandX: (x: number) => void;
  setHandY: (y: number) => void;
  setCameraEnabled: (enabled: boolean) => void;
  toggleCamera: () => void;
  addUserPhotos: (photos: string[]) => void;
}

export const ORNAMENT_COLORS = [
  '#F5F5F5', '#87CEEB', '#FFD700', '#800020', '#778899', '#FFB6C1', '#F7E7CE',
];

export const PHOTO_URLS = Array.from({ length: 24 }).map((_, i) => 
  `https://picsum.photos/id/${i + 20}/400/500`
);
