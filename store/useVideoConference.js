import { create } from "zustand";

// Zustand store
const useVideoConferenceStore = create((set) => ({
  isOpen: false,
  position: { x: 20, y: 20 },
  size: { width: 800, height: 600 },
  isMinimized: false,
  openVideoConference: () => set({ isOpen: true, isMinimized: false }),
  closeVideoConference: () => set({ isOpen: false }),
  updatePosition: (newPosition) => set({ position: newPosition }),
  updateSize: (newSize) => set({ size: newSize }),
  toggleMinimize: () =>
    set((state) => ({
      isMinimized: !state.isMinimized,
      size: state.isMinimized
        ? { width: 800, height: 600 }
        : { width: 300, height: 200 },
    })),
}));

export default useVideoConferenceStore;
