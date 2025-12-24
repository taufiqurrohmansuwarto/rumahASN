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

// Size configurations for different view modes
const VIEW_MODE_SIZES = {
  fullscreen: { width: "100%", height: "100%" },
  standard: { width: 800, height: 600 },
  compact: { width: 400, height: 300 },
  mini: { width: 200, height: 150 },
};

// Default sizes for legacy compatibility
const DEFAULT_SIZE = { width: 800, height: 600 };

// PiP position configs
const PIP_POSITIONS = {
  "bottom-right": { bottom: 20, right: 20 },
  "bottom-left": { bottom: 20, left: 20 },
  "top-right": { top: 80, right: 20 },
  "top-left": { top: 80, left: 20 },
};

// View mode labels in Indonesian
const VIEW_MODE_LABELS = {
  fullscreen: "Layar Penuh",
  standard: "Jendela Standar",
  compact: "Kompak",
  mini: "Mini",
};

const useVideoConferenceStore = create(
  persist(
    (set, get) => ({
      // State
      isOpen: false,
      meetingData: null, // { jwt, roomName, id, coach, title, isParticipant, ... }
      viewMode: "hidden", // 'fullscreen' | 'standard' | 'compact' | 'mini' | 'hidden'
      pipSize: VIEW_MODE_SIZES.compact,
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

      // Switch to specific view mode
      setViewMode: (mode) => {
        const size = VIEW_MODE_SIZES[mode] || VIEW_MODE_SIZES.compact;
        set({
          viewMode: mode,
          isMinimized: mode !== "fullscreen" && mode !== "standard",
          size: typeof size.width === "number" ? size : get().size,
        });
      },

      // Minimize to compact (PiP) mode
      minimizeToPip: () =>
        set({
          viewMode: "compact",
          isMinimized: true,
          size: VIEW_MODE_SIZES.compact,
        }),

      // Minimize to mini mode
      minimizeToMini: () =>
        set({
          viewMode: "mini",
          isMinimized: true,
          size: VIEW_MODE_SIZES.mini,
        }),

      // Maximize to fullscreen
      maximizeFromPip: () =>
        set({
          viewMode: "fullscreen",
          isMinimized: false,
          size: DEFAULT_SIZE,
        }),

      // Switch to standard window mode
      switchToStandard: () =>
        set({
          viewMode: "standard",
          isMinimized: false,
          size: VIEW_MODE_SIZES.standard,
        }),

      // End meeting completely
      endMeeting: () =>
        set({
          meetingData: null,
          viewMode: "hidden",
          isOpen: false,
          isMinimized: false,
        }),

      // Update PiP/compact size (for resize)
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
            viewMode: "compact",
            size: VIEW_MODE_SIZES.compact,
          });
        }
      },

      // Get PiP position styles
      getPipPositionStyles: () => {
        const position = get().pipPosition;
        return PIP_POSITIONS[position] || PIP_POSITIONS["bottom-right"];
      },

      // Get view mode size
      getViewModeSize: (mode) => {
        return VIEW_MODE_SIZES[mode] || VIEW_MODE_SIZES.compact;
      },

      // Get view mode label
      getViewModeLabel: (mode) => {
        return VIEW_MODE_LABELS[mode] || mode;
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
