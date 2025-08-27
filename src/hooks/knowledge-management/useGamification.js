import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  fetchUserPoints,
  fetchUserBadges,
  fetchUserMissions,
  fetchLeaderboard,
  fetchUserGamificationSummary,
  submitMissionComplete,
  submitUserXPAward,
} from "@/services/knowledge-management.services";

// Get user points and level
export const useUserPoints = () => {
  return useQuery({
    queryKey: ["user-points"],
    queryFn: fetchUserPoints,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user badges
export const useUserBadges = () => {
  return useQuery({
    queryKey: ["user-badges"],
    queryFn: fetchUserBadges,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get user missions
export const useUserMissions = () => {
  return useQuery({
    queryKey: ["user-missions"],
    queryFn: fetchUserMissions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get leaderboard
export const useLeaderboard = (limit = 10) => {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: () => fetchLeaderboard(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get complete gamification summary (all data in one call)
export const useUserGamificationSummary = () => {
  return useQuery({
    queryKey: ["user-gamification-summary"],
    queryFn: fetchUserGamificationSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Complete a mission
export const useCompleteMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitMissionComplete,
    onSuccess: (data) => {
      // Show success message
      message.success("Mission berhasil diselesaikan!");

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["user-points"] });
      queryClient.invalidateQueries({ queryKey: ["user-badges"] });
      queryClient.invalidateQueries({ queryKey: ["user-missions"] });
      queryClient.invalidateQueries({ queryKey: ["user-gamification-summary"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (error) => {
      console.error("Failed to complete mission:", error);
      message.error("Gagal menyelesaikan mission!");
    },
  });
};

// Award XP manually (for admin or special cases)
export const useAwardXP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitUserXPAward,
    onSuccess: (data) => {
      // Show success message if XP was awarded (not skipped)
      if (!data.skipped) {
        message.success(`+${data.points || 0} XP diperoleh!`);
        
        // Check if level up occurred
        if (data.levels && data.levels > 1) {
          message.success(`🎉 Selamat! Naik ke Level ${data.levels}!`, 5);
        }
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user-points"] });
      queryClient.invalidateQueries({ queryKey: ["user-badges"] });
      queryClient.invalidateQueries({ queryKey: ["user-gamification-summary"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (error) => {
      console.error("Failed to award XP:", error);
    },
  });
};

// Hook for real-time XP updates (can be called after user actions)
export const useUpdateUserXP = () => {
  const queryClient = useQueryClient();
  
  const updateXP = (xpData = {}) => {
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["user-points"] });
    queryClient.invalidateQueries({ queryKey: ["user-badges"] });
    queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    queryClient.invalidateQueries({ queryKey: ["user-gamification-summary"] });

    // Show notification if XP data is provided
    if (xpData.xp && typeof window !== 'undefined' && window.showXPNotification) {
      window.showXPNotification(xpData.xp, xpData.action, {
        levelUp: xpData.levelUp,
        newLevel: xpData.newLevel,
        badgeEarned: xpData.badgeEarned,
      });
    }
  };

  return { updateXP };
};

// Hook untuk trigger XP setelah user action (like, comment, etc)
export const useTriggerXP = () => {
  const { updateXP } = useUpdateUserXP();

  const triggerXP = async (action, amount = 0) => {
    // Delay sedikit untuk memberikan waktu server memproses
    setTimeout(() => {
      updateXP({ action, xp: amount });
    }, 500);
  };

  return { triggerXP };
};