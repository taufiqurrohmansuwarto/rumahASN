import { create } from "zustand";
import { persist } from "zustand/middleware";

const calculateCenterPosition = (width, height) => {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 };
  }
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const x = Math.max(0, Math.floor((windowWidth - width) / 2));
  const y = Math.max(0, Math.floor((windowHeight - height) / 2));
  return { x, y };
};

const DEFAULT_SIZE = { width: 800, height: 600 };
const MINIMIZED_SIZE = { width: 400, height: 300 };

// PiP position configs
const PIP_POSITIONS = {
  "bottom-right": { bottom: 20, right: 20 },
  "bottom-left": { bottom: 20, left: 20 },
  "top-right": { top: 80, right: 20 },
  "top-left": { top: 80, left: 20 },
};

const useVideoConferenceStore = create(
  persist(
    (set, get) => ({
      // State
      isOpen: false,
      meetingData: null, // { jwt, roomName, id, coach, title, ... }
      viewMode: "hidden", // 'fullscreen' | 'pip' | 'hidden'
      pipSize: MINIMIZED_SIZE,
      pipPosition: "bottom-right",
      position: calculateCenterPosition(DEFAULT_SIZE.width, DEFAULT_SIZE.height),
      size: DEFAULT_SIZE,
      isMinimized: false,

      // Actions - Start meeting with data
      startMeeting: (data) =>
        set({
          meetingData: data,
          viewMode: "fullscreen",
          isOpen: true,
          isMinimized: false,
        }),

      // Minimize to PiP mode
      minimizeToPip: () =>
        set({
          viewMode: "pip",
          isMinimized: true,
          size: get().pipSize,
        }),

      // Maximize from PiP to fullscreen
      maximizeFromPip: () =>
        set({
          viewMode: "fullscreen",
          isMinimized: false,
          size: DEFAULT_SIZE,
        }),

      // End meeting completely
      endMeeting: () =>
        set({
          meetingData: null,
          viewMode: "hidden",
          isOpen: false,
          isMinimized: false,
        }),

      // Update PiP size (for resize)
      updatePipSize: (newSize) =>
        set({
          pipSize: { ...get().pipSize, ...newSize },
        }),

      // Change PiP position
      updatePipPosition: (position) =>
        set({
          pipPosition: position,
        }),

      // Legacy actions for backwards compatibility
      openVideoConference: () =>
        set({ isOpen: true, isMinimized: false, viewMode: "fullscreen" }),

      closeVideoConference: () =>
        set({
          isOpen: false,
          meetingData: null,
          viewMode: "hidden",
        }),

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

      toggleMinimize: () => {
        const state = get();
        if (state.isMinimized) {
          set({
            isMinimized: false,
            viewMode: "fullscreen",
            size: DEFAULT_SIZE,
          });
        } else {
          set({
            isMinimized: true,
            viewMode: "pip",
            size: MINIMIZED_SIZE,
          });
        }
      },

      // Get PiP position styles
      getPipPositionStyles: () => {
        const position = get().pipPosition;
        return PIP_POSITIONS[position] || PIP_POSITIONS["bottom-right"];
      },
    }),
    {
      name: "video-conference-storage",
      partialize: (state) => ({
        pipSize: state.pipSize,
        pipPosition: state.pipPosition,
      }),
    }
  )
);

export default useVideoConferenceStore;
