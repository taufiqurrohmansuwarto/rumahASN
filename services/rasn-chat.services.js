import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/rasn-chat",
});

// ============================================
// WORKSPACE ROLES & MEMBERS
// ============================================

export const getWorkspaceRoles = () =>
  api.get("/workspace/roles").then((res) => res?.data);

export const getWorkspaceMembers = (params) =>
  api.get("/workspace/members", { params }).then((res) => res?.data);

export const getMyWorkspaceMembership = () =>
  api.get("/workspace/members/me").then((res) => res?.data);

export const updateMemberWorkspaceRole = (userId, roleId) =>
  api.patch(`/workspace/members/${userId}`, { roleId }).then((res) => res?.data);

// ============================================
// CHANNEL ROLES
// ============================================

export const getChannelRoles = () =>
  api.get("/channel-roles").then((res) => res?.data);

// ============================================
// CHANNELS
// ============================================

export const getChannels = () =>
  api.get("/channels").then((res) => res?.data);

export const getMyChannels = () =>
  api.get("/channels/me").then((res) => res?.data);

export const getPublicChannels = () =>
  api.get("/channels/public").then((res) => res?.data);

export const getArchivedChannels = () =>
  api.get("/channels/archived").then((res) => res?.data);

export const getChannelById = (channelId) =>
  api.get(`/channels/${channelId}`).then((res) => res?.data);

export const createChannel = (data) =>
  api.post("/channels", data).then((res) => res?.data);

export const updateChannel = (channelId, data) =>
  api.patch(`/channels/${channelId}`, data).then((res) => res?.data);

export const deleteChannel = (channelId) =>
  api.delete(`/channels/${channelId}`).then((res) => res?.data);

export const archiveChannel = (channelId) =>
  api.post(`/channels/${channelId}/archive`).then((res) => res?.data);

export const unarchiveChannel = (channelId) =>
  api.delete(`/channels/${channelId}/archive`).then((res) => res?.data);

// ============================================
// CHANNEL MEMBERS
// ============================================

export const getChannelMembers = (channelId) =>
  api.get(`/channels/${channelId}/members`).then((res) => res?.data);

export const joinChannel = (channelId) =>
  api.post(`/channels/${channelId}/join`).then((res) => res?.data);

export const leaveChannel = (channelId) =>
  api.post(`/channels/${channelId}/leave`).then((res) => res?.data);

export const inviteMember = (channelId, userId, roleId = null) =>
  api
    .post(`/channels/${channelId}/members`, { userId, roleId })
    .then((res) => res?.data);

export const removeMember = (channelId, userId) =>
  api.delete(`/channels/${channelId}/members/${userId}`).then((res) => res?.data);

export const updateMemberRole = (channelId, userId, roleId) =>
  api
    .patch(`/channels/${channelId}/members/${userId}`, { roleId })
    .then((res) => res?.data);

export const toggleMuteChannel = (channelId) =>
  api.post(`/channels/${channelId}/mute`).then((res) => res?.data);

export const updateNotificationPref = (channelId, preference) =>
  api
    .patch(`/channels/${channelId}/notification`, { preference })
    .then((res) => res?.data);

// ============================================
// MESSAGES
// ============================================

export const getMessages = (channelId, params) =>
  api.get(`/channels/${channelId}/messages`, { params }).then((res) => res?.data);

export const getChannelDateRange = (channelId) =>
  api.get(`/channels/${channelId}/date-range`).then((res) => res?.data);

export const sendMessage = (channelId, data) =>
  api.post(`/channels/${channelId}/messages`, data).then((res) => res?.data);

export const editMessage = (messageId, content) =>
  api.patch(`/messages/${messageId}`, { content }).then((res) => res?.data);

export const deleteMessage = (messageId) =>
  api.delete(`/messages/${messageId}`).then((res) => res?.data);

export const getThreadMessages = (messageId) =>
  api.get(`/messages/${messageId}/thread`).then((res) => res?.data);

export const searchMessages = (q, channelId = null) => {
  const params = { q };
  if (channelId) params.channelId = channelId;
  return api.get("/search/messages", { params }).then((res) => res?.data);
};

// ============================================
// REACTIONS
// ============================================

export const toggleReaction = (messageId, emoji) =>
  api.post(`/messages/${messageId}/reactions`, { emoji }).then((res) => res?.data);

export const getMessageReactions = (messageId) =>
  api.get(`/messages/${messageId}/reactions`).then((res) => res?.data);

// ============================================
// MENTIONS
// ============================================

export const getMyMentions = (params) =>
  api.get("/mentions", { params }).then((res) => res?.data);

export const getMentionCount = () =>
  api.get("/mentions/count").then((res) => res?.data);

export const markMentionAsRead = (mentionId) =>
  api.patch(`/mentions/${mentionId}`).then((res) => res?.data);

export const markAllMentionsAsRead = () =>
  api.patch("/mentions").then((res) => res?.data);

// ============================================
// PINNED MESSAGES
// ============================================

export const getPinnedMessages = (channelId) =>
  api.get(`/channels/${channelId}/pinned`).then((res) => res?.data);

export const togglePinMessage = (channelId, messageId) =>
  api.post(`/messages/${messageId}/pin`, { channelId }).then((res) => res?.data);

// ============================================
// BOOKMARKS
// ============================================

export const getMyBookmarks = (params) =>
  api.get("/bookmarks", { params }).then((res) => res?.data);

export const getBookmarkCount = () =>
  api.get("/bookmarks/count").then((res) => res?.data);

export const toggleBookmark = (messageId, note = null) =>
  api.post(`/bookmarks/${messageId}`, { note }).then((res) => res?.data);

export const updateBookmarkNote = (messageId, note) =>
  api.patch(`/bookmarks/${messageId}`, { note }).then((res) => res?.data);

export const checkBookmarkStatus = (messageId) =>
  api.get(`/bookmarks/${messageId}`).then((res) => res?.data);

// ============================================
// USER PRESENCE
// ============================================

export const updatePresence = (status, statusText = null, statusEmoji = null) =>
  api
    .post("/presence", { status, statusText, statusEmoji })
    .then((res) => res?.data);

export const getOnlineUsers = () =>
  api.get("/presence/online").then((res) => res?.data);

export const getChannelOnlineUsers = (channelId) =>
  api.get(`/channels/${channelId}/online`).then((res) => res?.data);

export const sendHeartbeat = () =>
  api.post("/presence/heartbeat").then((res) => res?.data);

// ============================================
// VIDEO CALLS
// ============================================

export const startVideoCall = (channelId, callType = "video", title = null) =>
  api
    .post(`/channels/${channelId}/calls`, { callType, title })
    .then((res) => res?.data);

export const endVideoCall = (callId) =>
  api.delete(`/calls/${callId}`).then((res) => res?.data);

export const getActiveCall = (channelId) =>
  api.get(`/channels/${channelId}/calls/active`).then((res) => res?.data);

export const joinCall = (callId) =>
  api.post(`/calls/${callId}/join`).then((res) => res?.data);

export const leaveCall = (callId) =>
  api.post(`/calls/${callId}/leave`).then((res) => res?.data);

export const getCallHistory = (channelId, params) =>
  api.get(`/channels/${channelId}/calls`, { params }).then((res) => res?.data);

// ============================================
// ATTACHMENTS / MEDIA
// ============================================

export const getChannelMedia = (channelId, params) =>
  api.get(`/channels/${channelId}/media`, { params }).then((res) => res?.data);

// ============================================
// STATS & MISC
// ============================================

export const getChatStats = () =>
  api.get("/stats").then((res) => res?.data);

export const getUnreadCounts = () =>
  api.get("/unread").then((res) => res?.data);

export const searchUsers = (q) =>
  api.get("/search/users", { params: { q } }).then((res) => res?.data);

// ============================================
// FILE UPLOAD
// ============================================

export const uploadChatFile = (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  return api
    .post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    })
    .then((res) => res?.data);
};

export const uploadVoiceMessage = (blob, channelId, onProgress) => {
  const formData = new FormData();
  formData.append("voice", blob, "voice.webm");
  formData.append("channelId", channelId);

  return api
    .post("/upload/voice", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    })
    .then((res) => res?.data);
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

