import { create } from "zustand";
import { persist } from "zustand/middleware";

// Size configurations for different view modes
const VIEW_MODE_SIZES = {
  fullscreen: null, // Uses 100% viewport
  standard: { width: 800, height: 600 },
  compact: { width: 400, height: 300 },
  mini: { width: 200, height: 150 },
};

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
      // Core state - simplified
      isOpen: false,
      meetingData: null,
      viewMode: "hidden", // 'fullscreen' | 'standard' | 'compact' | 'mini' | 'hidden'
      pipPosition: "bottom-right",

      // Track last ended meeting to prevent auto-restart (single ID, not array)
      lastEndedMeetingId: null,

      // Start meeting
      startMeeting: (data) => {
        const { lastEndedMeetingId, isOpen } = get();

        // Prevent re-start if already open with same meeting
        if (isOpen && get().meetingData?.id === data?.id) {
          return false;
        }

        // Prevent auto-restart of just-ended meeting
        if (lastEndedMeetingId === data?.id) {
          return false;
        }

        set({
          meetingData: data,
          viewMode: "fullscreen",
          isOpen: true,
        });
        return true;
      },

      // Check if meeting was just ended
      wasMeetingEnded: (meetingId) => {
        return get().lastEndedMeetingId === meetingId;
      },

      // Allow rejoining (clears ended state)
      allowRejoin: (meetingId) => {
        if (get().lastEndedMeetingId === meetingId) {
          set({ lastEndedMeetingId: null });
        }
      },

      // Set view mode
      setViewMode: (mode) => {
        if (mode === "hidden") {
          set({ viewMode: "hidden", isOpen: false });
        } else {
          set({ viewMode: mode });
        }
      },

      // Close meeting (cleanup)
      closeMeeting: () => {
        const meetingId = get().meetingData?.id;
        set({
          meetingData: null,
          viewMode: "hidden",
          isOpen: false,
          lastEndedMeetingId: meetingId || null,
        });
      },

      // Update PiP position
      updatePipPosition: (position) => set({ pipPosition: position }),

      // Get position styles
      getPipPositionStyles: () => {
        const position = get().pipPosition;
        return PIP_POSITIONS[position] || PIP_POSITIONS["bottom-right"];
      },

      // Get size for view mode
      getViewModeSize: (mode) => VIEW_MODE_SIZES[mode] || VIEW_MODE_SIZES.compact,
    }),
    {
      name: "video-conference-storage",
      partialize: (state) => ({
        pipPosition: state.pipPosition,
      }),
    }
  )
);

export default useVideoConferenceStore;
