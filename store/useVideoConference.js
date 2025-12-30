import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createVideoSession,
  endVideoSession,
  endAllMeetingVideoSessions,
  checkUserHasActiveSession,
} from "@/services/coaching-clinics.services";

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
      // Core state
      isOpen: false,
      meetingData: null,
      viewMode: "hidden", // 'fullscreen' | 'standard' | 'compact' | 'mini' | 'hidden'
      pipPosition: "bottom-right",

      // Session tracking
      sessionId: null,
      isStarting: false, // Prevent double-click race condition

      /**
       * Start meeting dengan session creation di backend
       * @param {Object} data - Meeting data dengan id, jwt, isParticipant, dll
       * @returns {Promise<boolean|Object>} true jika berhasil, { error: string } jika gagal
       */
      startMeeting: async (data) => {
        const { isOpen, isStarting } = get();

        // Prevent double-click
        if (isStarting) {
          return { error: "Sedang memproses..." };
        }

        // Already open with same meeting
        if (isOpen && get().meetingData?.id === data?.id) {
          return false;
        }

        set({ isStarting: true });

        try {
          // Check if user already has active session (prevent multiple meetings)
          const activeCheck = await checkUserHasActiveSession();
          if (activeCheck?.hasActiveSession && activeCheck?.meetingId !== data?.id) {
            set({ isStarting: false });
            return {
              error: `Anda masih memiliki meeting yang sedang berlangsung: ${activeCheck?.meetingTitle || activeCheck?.meetingId}`,
            };
          }

          // Create session in backend
          const { sessionId } = await createVideoSession({
            meetingId: data.id,
            role: data.isParticipant ? "participant" : "consultant",
          });

          set({
            meetingData: data,
            viewMode: "fullscreen",
            isOpen: true,
            sessionId,
            isStarting: false,
          });

          return true;
        } catch (error) {
          console.error("Error starting meeting:", error);
          set({ isStarting: false });
          return { error: error?.response?.data?.message || "Gagal memulai session" };
        }
      },

      /**
       * Resume meeting dari active session (auto-resume saat login/refresh)
       * Tidak perlu create session karena sudah ada
       */
      resumeMeeting: (data) => {
        set({
          meetingData: data,
          viewMode: "fullscreen",
          isOpen: true,
          sessionId: data.sessionId,
        });
      },

      /**
       * Set view mode
       */
      setViewMode: (mode) => {
        if (mode === "hidden") {
          set({ viewMode: "hidden", isOpen: false });
        } else {
          set({ viewMode: mode });
        }
      },

      /**
       * Close meeting (participant leave)
       * End session di backend
       */
      closeMeeting: async () => {
        const meetingId = get().meetingData?.id;

        // Clear local state first (optimistic)
        set({
          meetingData: null,
          viewMode: "hidden",
          isOpen: false,
          sessionId: null,
        });

        // End session in backend (fire and forget with retry)
        if (meetingId) {
          const maxRetries = 3;
          for (let i = 0; i < maxRetries; i++) {
            try {
              await endVideoSession(meetingId);
              break;
            } catch (e) {
              if (i === maxRetries - 1) {
                console.error("Failed to end session after retries:", e);
                // Session akan di-cleanup by heartbeat timeout
              }
              await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
            }
          }
        }
      },

      /**
       * End meeting (consultant only)
       * End all sessions for this meeting
       */
      endMeetingAsConsultant: async () => {
        const meetingId = get().meetingData?.id;

        // Clear local state first
        set({
          meetingData: null,
          viewMode: "hidden",
          isOpen: false,
          sessionId: null,
        });

        // End all sessions for this meeting
        if (meetingId) {
          const maxRetries = 3;
          for (let i = 0; i < maxRetries; i++) {
            try {
              await endAllMeetingVideoSessions(meetingId);
              break;
            } catch (e) {
              if (i === maxRetries - 1) {
                console.error("Failed to end all sessions after retries:", e);
              }
              await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
            }
          }
        }
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
        // Don't persist isOpen, meetingData, sessionId - these should come from backend
      }),
    }
  )
);

export default useVideoConferenceStore;
