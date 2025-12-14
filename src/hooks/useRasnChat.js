import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import * as chatApi from "@/services/rasn-chat.services";

// ============================================
// WORKSPACE ROLES & MEMBERS
// ============================================

export const useWorkspaceRoles = () => {
  return useQuery({
    queryKey: ["chat-workspace-roles"],
    queryFn: chatApi.getWorkspaceRoles,
    staleTime: 5 * 60 * 1000,
  });
};

export const useWorkspaceMembers = (params) => {
  return useQuery({
    queryKey: ["chat-workspace-members", params],
    queryFn: () => chatApi.getWorkspaceMembers(params),
    keepPreviousData: true,
  });
};

export const useMyWorkspaceMembership = () => {
  return useQuery({
    queryKey: ["chat-my-membership"],
    queryFn: chatApi.getMyWorkspaceMembership,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateMemberWorkspaceRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }) =>
      chatApi.updateMemberWorkspaceRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-workspace-members"]);
      message.success("Role berhasil diupdate");
    },
  });
};

// ============================================
// CHANNEL ROLES
// ============================================

export const useChannelRoles = () => {
  return useQuery({
    queryKey: ["chat-channel-roles"],
    queryFn: chatApi.getChannelRoles,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================
// CHANNELS
// ============================================

export const useChannels = () => {
  return useQuery({
    queryKey: ["chat-channels"],
    queryFn: chatApi.getChannels,
  });
};

export const useMyChannels = () => {
  return useQuery({
    queryKey: ["chat-my-channels"],
    queryFn: chatApi.getMyChannels,
  });
};

export const useChannel = (channelId) => {
  return useQuery({
    queryKey: ["chat-channel", channelId],
    queryFn: () => chatApi.getChannelById(channelId),
    enabled: !!channelId,
  });
};

export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.createChannel,
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-channels"]);
      queryClient.invalidateQueries(["chat-my-channels"]);
      message.success("Channel berhasil dibuat");
    },
  });
};

export const useUpdateChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, ...data }) =>
      chatApi.updateChannel(channelId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["chat-channels"]);
      queryClient.invalidateQueries(["chat-channel", variables.channelId]);
      message.success("Channel berhasil diupdate");
    },
  });
};

export const useDeleteChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.deleteChannel,
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-channels"]);
      queryClient.invalidateQueries(["chat-my-channels"]);
      message.success("Channel berhasil dihapus");
    },
  });
};

export const useArchiveChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.archiveChannel,
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-channels"]);
      message.success("Channel berhasil diarsipkan");
    },
  });
};

export const useUnarchiveChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.unarchiveChannel,
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-channels"]);
      message.success("Channel berhasil diaktifkan");
    },
  });
};

// ============================================
// CHANNEL MEMBERS
// ============================================

export const useChannelMembers = (channelId) => {
  return useQuery({
    queryKey: ["chat-channel-members", channelId],
    queryFn: () => chatApi.getChannelMembers(channelId),
    enabled: !!channelId,
  });
};

export const useJoinChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.joinChannel,
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-channels"]);
      queryClient.invalidateQueries(["chat-my-channels"]);
      queryClient.invalidateQueries(["chat-channel-members"]);
      message.success("Berhasil bergabung ke channel");
    },
  });
};

export const useLeaveChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.leaveChannel,
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-channels"]);
      queryClient.invalidateQueries(["chat-my-channels"]);
      queryClient.invalidateQueries(["chat-channel-members"]);
      message.success("Berhasil keluar dari channel");
    },
  });
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, userId, roleId }) =>
      chatApi.inviteMember(channelId, userId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([
        "chat-channel-members",
        variables.channelId,
      ]);
      message.success("Member berhasil diundang");
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, userId }) =>
      chatApi.removeMember(channelId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([
        "chat-channel-members",
        variables.channelId,
      ]);
      message.success("Member berhasil dihapus");
    },
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, userId, roleId }) =>
      chatApi.updateMemberRole(channelId, userId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([
        "chat-channel-members",
        variables.channelId,
      ]);
      message.success("Role member berhasil diupdate");
    },
  });
};

export const useToggleMuteChannel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.toggleMuteChannel,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["chat-my-channels"]);
      message.success(data?.muted ? "Channel di-mute" : "Channel di-unmute");
    },
  });
};

export const useUpdateNotificationPref = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, preference }) =>
      chatApi.updateNotificationPref(channelId, preference),
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-my-channels"]);
      message.success("Preferensi notifikasi diupdate");
    },
  });
};

// ============================================
// MESSAGES
// ============================================

export const useMessages = (channelId, params) => {
  return useQuery({
    queryKey: ["chat-messages", channelId, params],
    queryFn: () => chatApi.getMessages(channelId, params),
    enabled: !!channelId,
    refetchInterval: 5000, // Poll setiap 5 detik
    keepPreviousData: true,
  });
};

export const useThreadMessages = (messageId) => {
  return useQuery({
    queryKey: ["chat-thread", messageId],
    queryFn: () => chatApi.getThreadMessages(messageId),
    enabled: !!messageId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, ...data }) =>
      chatApi.sendMessage(channelId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["chat-messages", variables.channelId]);
      if (variables.parentId) {
        queryClient.invalidateQueries(["chat-thread", variables.parentId]);
      }
    },
  });
};

export const useEditMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, content }) =>
      chatApi.editMessage(messageId, content),
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-messages"]);
      queryClient.invalidateQueries(["chat-thread"]);
      message.success("Pesan berhasil diedit");
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-messages"]);
      queryClient.invalidateQueries(["chat-thread"]);
      message.success("Pesan berhasil dihapus");
    },
  });
};

export const useSearchMessages = (q, channelId) => {
  return useQuery({
    queryKey: ["chat-search-messages", q, channelId],
    queryFn: () => chatApi.searchMessages(q, channelId),
    enabled: !!q && q.length >= 2,
  });
};

// ============================================
// REACTIONS
// ============================================

export const useToggleReaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, emoji }) =>
      chatApi.toggleReaction(messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-messages"]);
      queryClient.invalidateQueries(["chat-thread"]);
    },
  });
};

export const useMessageReactions = (messageId) => {
  return useQuery({
    queryKey: ["chat-reactions", messageId],
    queryFn: () => chatApi.getMessageReactions(messageId),
    enabled: !!messageId,
  });
};

// ============================================
// MENTIONS
// ============================================

export const useMyMentions = (params) => {
  return useQuery({
    queryKey: ["chat-mentions", params],
    queryFn: () => chatApi.getMyMentions(params),
    refetchInterval: 30000,
    keepPreviousData: true,
  });
};

export const useMentionCount = () => {
  return useQuery({
    queryKey: ["chat-mention-count"],
    queryFn: chatApi.getMentionCount,
    refetchInterval: 30000,
  });
};

export const useMarkMentionAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.markMentionAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-mentions"]);
      queryClient.invalidateQueries(["chat-mention-count"]);
    },
  });
};

export const useMarkAllMentionsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.markAllMentionsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-mentions"]);
      queryClient.invalidateQueries(["chat-mention-count"]);
      message.success("Semua mention ditandai sudah dibaca");
    },
  });
};

// ============================================
// PINNED MESSAGES
// ============================================

export const usePinnedMessages = (channelId) => {
  return useQuery({
    queryKey: ["chat-pinned", channelId],
    queryFn: () => chatApi.getPinnedMessages(channelId),
    enabled: !!channelId,
  });
};

export const useTogglePinMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, messageId }) =>
      chatApi.togglePinMessage(channelId, messageId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["chat-pinned", variables.channelId]);
      queryClient.invalidateQueries(["chat-messages", variables.channelId]);
      message.success(
        data?.action === "pinned" ? "Pesan di-pin" : "Pesan di-unpin"
      );
    },
  });
};

// ============================================
// BOOKMARKS
// ============================================

export const useMyBookmarks = (params) => {
  return useQuery({
    queryKey: ["chat-bookmarks", params],
    queryFn: () => chatApi.getMyBookmarks(params),
    keepPreviousData: true,
  });
};

export const useBookmarkCount = () => {
  return useQuery({
    queryKey: ["chat-bookmark-count"],
    queryFn: chatApi.getBookmarkCount,
    staleTime: 60000,
  });
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, note }) => chatApi.toggleBookmark(messageId, note),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["chat-bookmarks"]);
      queryClient.invalidateQueries(["chat-bookmark-count"]);
      message.success(
        data?.bookmarked ? "Pesan disimpan" : "Pesan dihapus dari simpanan"
      );
    },
  });
};

export const useUpdateBookmarkNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, note }) =>
      chatApi.updateBookmarkNote(messageId, note),
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-bookmarks"]);
      message.success("Catatan berhasil diupdate");
    },
  });
};

export const useCheckBookmarkStatus = (messageId) => {
  return useQuery({
    queryKey: ["chat-bookmark-status", messageId],
    queryFn: () => chatApi.checkBookmarkStatus(messageId),
    enabled: !!messageId,
  });
};

// ============================================
// USER PRESENCE
// ============================================

export const useOnlineUsers = () => {
  return useQuery({
    queryKey: ["chat-online-users"],
    queryFn: chatApi.getOnlineUsers,
    refetchInterval: 30000,
  });
};

export const useChannelOnlineUsers = (channelId) => {
  return useQuery({
    queryKey: ["chat-channel-online", channelId],
    queryFn: () => chatApi.getChannelOnlineUsers(channelId),
    enabled: !!channelId,
    refetchInterval: 30000,
  });
};

export const useUpdatePresence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ status, statusText, statusEmoji }) =>
      chatApi.updatePresence(status, statusText, statusEmoji),
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-online-users"]);
    },
  });
};

export const useHeartbeat = () => {
  return useMutation({
    mutationFn: chatApi.sendHeartbeat,
  });
};

// ============================================
// VIDEO CALLS
// ============================================

export const useActiveCall = (channelId) => {
  return useQuery({
    queryKey: ["chat-active-call", channelId],
    queryFn: () => chatApi.getActiveCall(channelId),
    enabled: !!channelId,
    refetchInterval: 5000,
  });
};

export const useCallHistory = (channelId, params) => {
  return useQuery({
    queryKey: ["chat-call-history", channelId, params],
    queryFn: () => chatApi.getCallHistory(channelId, params),
    enabled: !!channelId,
  });
};

export const useStartVideoCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, callType, title }) =>
      chatApi.startVideoCall(channelId, callType, title),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["chat-active-call", variables.channelId]);
      queryClient.invalidateQueries(["chat-messages", variables.channelId]);
    },
  });
};

export const useEndVideoCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.endVideoCall,
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-active-call"]);
      queryClient.invalidateQueries(["chat-call-history"]);
      message.success("Panggilan berakhir");
    },
  });
};

export const useJoinCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.joinCall,
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-active-call"]);
    },
  });
};

export const useLeaveCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.leaveCall,
    onSuccess: () => {
      queryClient.invalidateQueries(["chat-active-call"]);
      message.success("Keluar dari panggilan");
    },
  });
};

// ============================================
// MEDIA / ATTACHMENTS
// ============================================

export const useChannelMedia = (channelId, params) => {
  return useQuery({
    queryKey: ["chat-media", channelId, params],
    queryFn: () => chatApi.getChannelMedia(channelId, params),
    enabled: !!channelId,
  });
};

export const useUploadChatFile = () => {
  return useMutation({
    mutationFn: ({ file, onProgress }) =>
      chatApi.uploadChatFile(file, onProgress),
  });
};

export const useUploadVoiceMessage = () => {
  return useMutation({
    mutationFn: ({ blob, channelId, onProgress }) =>
      chatApi.uploadVoiceMessage(blob, channelId, onProgress),
  });
};

// ============================================
// STATS
// ============================================

export const useChatStats = () => {
  return useQuery({
    queryKey: ["chat-stats"],
    queryFn: chatApi.getChatStats,
    staleTime: 60000,
  });
};

export const useUnreadCounts = () => {
  return useQuery({
    queryKey: ["chat-unread-counts"],
    queryFn: chatApi.getUnreadCounts,
    refetchInterval: 30000,
  });
};

// ============================================
// SEARCH USERS
// ============================================

export const useSearchUsers = (q) => {
  return useQuery({
    queryKey: ["chat-search-users", q],
    queryFn: () => chatApi.searchUsers(q),
    enabled: !!q && q.length >= 2,
  });
};

