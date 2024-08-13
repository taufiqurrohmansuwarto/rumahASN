import { create } from "zustand";

const calculateCenterPosition = (width, height) => {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 }; // Default position for server-side rendering
  }
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const x = Math.max(0, Math.floor((windowWidth - width) / 2));
  const y = Math.max(0, Math.floor((windowHeight - height) / 2));
  return { x, y };
};

const DEFAULT_SIZE = { width: 800, height: 600 };
const MINIMIZED_SIZE = { width: 300, height: 200 };

// Zustand store
const useVideoConferenceStore = create((set) => ({
  isOpen: false,
  position: calculateCenterPosition(DEFAULT_SIZE.width, DEFAULT_SIZE.height),
  size: DEFAULT_SIZE,
  isMinimized: false,
  openVideoConference: () => set({ isOpen: true, isMinimized: false }),
  closeVideoConference: () => set({ isOpen: false }),
  updatePosition: (newPosition) => set({ position: newPosition }),
  updateSize: (newSize) =>
    set((state) => {
      const updatedSize = { ...state.size, ...newSize };
      return {
        size: updatedSize,
        position: calculateCenterPosition(
          updatedSize.width,
          updatedSize.height
        ),
      };
    }),
  toggleMinimize: () =>
    set((state) => {
      const newSize = state.isMinimized ? DEFAULT_SIZE : MINIMIZED_SIZE;
      return {
        isMinimized: !state.isMinimized,
        size: newSize,
        position: calculateCenterPosition(newSize.width, newSize.height),
      };
    }),
}));

if (typeof window !== "undefined") {
  window.addEventListener(
    "resize",
    useVideoConferenceStore.getState().handleResize
  );
}

export default useVideoConferenceStore;
