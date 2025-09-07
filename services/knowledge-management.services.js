import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/knowledge",
});

export const getKnowledgeContents = async (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api.get(`/users/contents?${qs}`).then((res) => res.data);
};

export const getUserOwnContents = async (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api.get(`/users/me/contents?${qs}`).then((res) => res.data);
};

export const submitMyContentForReview = async (id) => {
  return await api
    .post(`/users/me/contents/${id}`)
    .then((res) => res.data);
};

export const editMyContent = async ({ id, data }) => {
  return await api
    .put(`/users/me/contents/${id}`, data)
    .then((res) => res.data);
};

export const deleteMyContent = async (id) => {
  return await api.delete(`/users/me/contents/${id}`).then((res) => res.data);
};

export const getUserOwnContent = async (id) => {
  return await api.get(`/users/me/contents/${id}`).then((res) => res.data);
};

export const getUserOwnStats = async () => {
  return await api.get("/users/me/stats").then((res) => res.data);
};

export const getKnowledgeContent = async (id) => {
  return await api.get(`/users/contents/${id}`).then((res) => res.data);
};

export const createKnowledgeContent = async (data) => {
  return await api.post("/users/contents", data).then((res) => res.data);
};

export const updateKnowledgeContent = async ({ id, data }) => {
  return await api.patch(`/users/contents/${id}`, data).then((res) => res.data);
};

export const deleteKnowledgeContent = async (id) => {
  return await api.delete(`/users/contents/${id}`).then((res) => res.data);
};

export const getKnowledgeCategories = async () => {
  return await api.get("/users/refs/categories").then((res) => res.data);
};

// Gamification Services
export const fetchUserPoints = async () => {
  return await api.get("/users/me/points").then((res) => res.data);
};

export const fetchUserBadges = async () => {
  return await api.get("/users/me/badges").then((res) => res.data);
};

export const fetchUserMissions = async () => {
  return await api.get("/users/missions").then((res) => res.data);
};

export const fetchLeaderboard = async (limit = 10) => {
  return await api
    .get(`/users/leaderboard?limit=${limit}`)
    .then((res) => res.data);
};

export const fetchUserGamificationSummary = async () => {
  return await api.get("/users/me/summary").then((res) => res.data);
};

export const submitMissionComplete = async (missionId) => {
  return await api
    .post(`/users/missions/${missionId}/complete`)
    .then((res) => res.data);
};

export const submitUserXPAward = async (xpData) => {
  return await api.post("/users/hooks/xp", xpData).then((res) => res.data);
};

// Dashboard Services
export const getKnowledgeDashboardOverview = async () => {
  return await api.get("/admin/dashboard/overview").then((res) => res.data);
};

export const getKnowledgeCategoryAnalytics = async () => {
  return await api.get("/admin/dashboard/categories").then((res) => res.data);
};

export const flushContent = async () => {
  return await api.get("/admin/flush").then((res) => res.data);
};

// user interactions
export const likeKnowledgeContent = async (id) => {
  return await api.post(`/users/contents/${id}/likes`).then((res) => res.data);
};

export const getKnowledgeContentComments = async (id) => {
  return await api
    .get(`/users/contents/${id}/comments`)
    .then((res) => res.data);
};

export const createKnowledgeContentComment = async ({ id, data }) => {
  return await api
    .post(`/users/contents/${id}/comments`, data)
    .then((res) => res.data);
};

export const deleteKnowledgeContentComment = async ({ id, commentId }) => {
  return await api
    .delete(`/users/contents/${id}/comments/${commentId}`)
    .then((res) => res.data);
};

export const updateKnowledgeContentComment = async ({
  id,
  commentId,
  data,
}) => {
  return await api
    .patch(`/users/contents/${id}/comments/${commentId}`, data)
    .then((res) => res.data);
};

export const bookmarkKnowledgeContent = async (id) => {
  return await api
    .post(`/users/contents/${id}/bookmarks`)
    .then((res) => res.data);
};

// Hierarchical Comments Services
export const getKnowledgeContentCommentsHierarchical = async (id) => {
  return await api
    .get(`/users/contents/${id}/comments?hierarchical=true`)
    .then((res) => res.data);
};

export const createKnowledgeContentReply = async ({ id, commentId, data }) => {
  return await api
    .post(`/users/contents/${id}/comments/${commentId}/reply`, data)
    .then((res) => res.data);
};

export const likeKnowledgeContentComment = async ({ id, commentId }) => {
  return await api
    .post(`/users/contents/${id}/comments/${commentId}/like`)
    .then((res) => res.data);
};

export const pinKnowledgeContentComment = async ({ id, commentId }) => {
  return await api
    .post(`/users/contents/${id}/comments/${commentId}/pin`)
    .then((res) => res.data);
};

export const getRepliesForComment = async (id, commentId) => {
  return await api
    .get(`/users/contents/${id}/comments/${commentId}/replies`)
    .then((res) => res.data);
};

export const getRelatedContents = async (id) => {
  return await api.get(`/users/contents/${id}/related`).then((res) => res.data);
};

// badges and missions for admin
export const getBadges = async () => {
  return await api.get("/admin/refs/badges").then((res) => res.data);
};

export const getMissions = async () => {
  return await api.get("/admin/refs/missions").then((res) => res.data);
};

export const createBadge = async (data) => {
  return await api.post("/admin/refs/badges", data).then((res) => res.data);
};

export const updateBadge = async ({ id, data }) => {
  return await api
    .patch(`/admin/refs/badges/${id}`, data)
    .then((res) => res.data);
};

export const deleteBadge = async (id) => {
  return await api.delete(`/admin/refs/badges/${id}`).then((res) => res.data);
};

export const createMission = async (data) => {
  return await api.post("/admin/refs/missions", data).then((res) => res.data);
};

export const updateMission = async ({ id, data }) => {
  return await api
    .patch(`/admin/refs/missions/${id}`, data)
    .then((res) => res.data);
};

export const deleteMission = async (id) => {
  return await api.delete(`/admin/refs/missions/${id}`).then((res) => res.data);
};

// badges and missions for user
export const getUserBadges = async () => {
  return await api.get("/users/me/badges").then((res) => res.data);
};

export const getUserMissions = async () => {
  return await api.get("/users/me/missions").then((res) => res.data);
};

export const userMissionComplete = async (id) => {
  return await api
    .post(`/users/me/missions/${id}/complete`)
    .then((res) => res.data);
};

export const getUserPoints = async () => {
  return await api.get("/users/me/points").then((res) => res.data);
};

export const uploadKnowledgeContentAttachment = async (contentId, data) => {
  return await api
    .post(`/users/contents/${contentId}/upload`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5 minutes timeout
    })
    .then((res) => res.data)
    .catch((error) => {
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Upload timeout - file terlalu besar atau koneksi lambat"
        );
      }
      throw error;
    });
};

export const uploadKnowledgeContentAttachmentAdmin = async (
  contentId,
  data
) => {
  return await api
    .post(`/admin/contents/${contentId}/upload`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
};

export const uploadMultipleKnowledgeContentAttachments = async (
  contentId,
  files
) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return await api
    .post(`/users/contents/${contentId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5 minutes timeout
    })
    .then((res) => res.data)
    .catch((error) => {
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Upload timeout - file terlalu besar atau koneksi lambat"
        );
      }
      throw error;
    });
};

// admin
export const getReferensiKategori = async () => {
  return await api.get("/admin/refs/categories").then((res) => res.data);
};

export const createReferensiKategori = async (data) => {
  return await api.post("/admin/refs/categories", data).then((res) => res.data);
};

export const updateReferensiKategori = async ({ id, data }) => {
  return await api
    .patch(`/admin/refs/categories/${id}`, data)
    .then((res) => res.data);
};

export const deleteReferensiKategori = async (id) => {
  return await api
    .delete(`/admin/refs/categories/${id}`)
    .then((res) => res.data);
};

// badges and missions for admin
export const getReferensiBadges = async () => {
  return await api.get("/admin/refs/badges").then((res) => res.data);
};

export const createReferensiBadge = async (data) => {
  return await api.post("/admin/refs/badges", data).then((res) => res.data);
};

export const updateReferensiBadge = async ({ id, data }) => {
  return await api
    .patch(`/admin/refs/badges/${id}`, data)
    .then((res) => res.data);
};

export const deleteReferensiBadge = async (id) => {
  return await api.delete(`/admin/refs/badges/${id}`).then((res) => res.data);
};

// missions for admin
export const getReferensiMissions = async () => {
  return await api.get("/admin/refs/missions").then((res) => res.data);
};

export const createReferensiMission = async (data) => {
  return await api.post("/admin/refs/missions", data).then((res) => res.data);
};

export const updateReferensiMission = async ({ id, data }) => {
  return await api
    .patch(`/admin/refs/missions/${id}`, data)
    .then((res) => res.data);
};

export const deleteReferensiMission = async (id) => {
  return await api.delete(`/admin/refs/missions/${id}`).then((res) => res.data);
};

// admin contents
export const getAdminKnowledgeContents = async (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api.get(`/admin/contents?${qs}`).then((res) => res.data);
};

export const getAdminKnowledgeContentDetail = async (id) => {
  return await api.get(`/admin/contents/${id}`).then((res) => res.data);
};

export const updateAdminKnowledgeContent = async ({ id, payload }) => {
  return await api
    .patch(`/admin/contents/${id}`, payload)
    .then((res) => res.data);
};

export const updateAdminKnowledgeContentStatus = async ({ id, payload }) => {
  return await api
    .patch(`/admin/contents/${id}/status`, payload)
    .then((res) => res.data);
};

// dashboard
export const getDashboardOverview = async () => {
  return await api.get("/admin/dashboard/overview").then((res) => res.data);
};

export const getCategoryAnalytics = async () => {
  return await api.get("/admin/dashboard/categories").then((res) => res.data);
};

// gamification
export const getUserGamificationSummary = async () => {
  return await api.get("/users/me/summary").then((res) => res.data);
};

export const getUserGamificationBadges = async () => {
  return await api.get("/users/me/badges").then((res) => res.data);
};

export const getUserGamificationMissions = async () => {
  return await api.get("/users/missions").then((res) => res.data);
};

export const getUserGamificationCompletedMissions = async (missionId) => {
  return await api
    .get(`/users/missions/${missionId}/complete`)
    .then((res) => res.data);
};

export const getUserGamificationPoints = async () => {
  return await api.get("/users/me/points").then((res) => res.data);
};

export const awardUserXP = async (data) => {
  return await api.post("/users/hooks/xp", data).then((res) => res.data);
};

export const getUserLeaderboard = async () => {
  return await api.get("/users/leaderboard").then((res) => res.data);
};

// Media upload services
export const uploadKnowledgeContentMediaCreate = async (data) => {
  return await api
    .post("/users/contents/upload-media", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5 minutes timeout
    })
    .then((res) => res.data)
    .catch((error) => {
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Upload timeout - file terlalu besar atau koneksi lambat"
        );
      }
      throw error;
    });
};

export const uploadKnowledgeContentMedia = async (contentId, data) => {
  return await api
    .post(`/users/contents/${contentId}/upload-media`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5 minutes timeout
    })
    .then((res) => res.data)
    .catch((error) => {
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Upload timeout - file terlalu besar atau koneksi lambat"
        );
      }
      throw error;
    });
};

export const uploadKnowledgeContentMediaAdmin = async (contentId, data) => {
  return await api
    .post(`/admin/contents/${contentId}/upload-media`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // 5 minutes timeout
    })
    .then((res) => res.data)
    .catch((error) => {
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Upload timeout - file terlalu besar atau koneksi lambat"
        );
      }
      throw error;
    });
};

// Knowledge Insights Services
export const getTopContributors = async (params = {}) => {
  const qs = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api
    .get(`/users/insights/top-contributors?${qs}`)
    .then((res) => res.data);
};

export const getTopContents = async (params = {}) => {
  const qs = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api
    .get(`/users/insights/top-contents?${qs}`)
    .then((res) => res.data);
};

export const getTopCategories = async (params = {}) => {
  const qs = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api
    .get(`/users/insights/top-categories?${qs}`)
    .then((res) => res.data);
};

export const getTopTags = async (params = {}) => {
  const qs = queryString.stringify(params, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api
    .get(`/users/insights/top-tags?${qs}`)
    .then((res) => res.data);
};

// ===== KNOWLEDGE REVISIONS SERVICES =====

// User Revision Services
export const createRevision = async (contentId) => {
  return await api
    .post(`/users/me/contents/${contentId}/create-revision`)
    .then((res) => res.data);
};

export const getMyRevisions = async (contentId) => {
  return await api
    .get(`/users/me/contents/${contentId}/revisions`)
    .then((res) => res.data);
};

export const updateRevision = async ({ contentId, versionId, data }) => {
  return await api
    .put(`/users/me/contents/${contentId}/revisions/${versionId}`, data)
    .then((res) => res.data);
};

export const submitRevision = async ({ contentId, versionId, submitNotes }) => {
  return await api
    .post(`/users/me/contents/${contentId}/revisions/${versionId}/submit`, {
      submitNotes,
    })
    .then((res) => res.data);
};

// Admin Revision Services
export const getPendingRevisions = async (query = {}) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api
    .get(`/admin/revisions/pending?${qs}`)
    .then((res) => res.data);
};

export const getRevisionDetails = async (versionId, contentId = null) => {
  // If contentId is provided, use user endpoint; otherwise use admin endpoint
  const endpoint = contentId 
    ? `/users/me/contents/${contentId}/revisions/${versionId}`
    : `/admin/revisions/${versionId}/approve`;
    
  return await api
    .get(endpoint)
    .then((res) => res.data);
};

export const approveRevision = async ({
  versionId,
  action,
  rejectionReason,
}) => {
  return await api
    .post(`/admin/revisions/${versionId}/approve`, {
      action, // 'approve' or 'reject'
      rejectionReason,
    })
    .then((res) => res.data);
};

// Revision Bulk Operations
export const bulkApproveRevisions = async (versionIds) => {
  const promises = versionIds.map((versionId) =>
    approveRevision({ versionId, action: "approve" })
  );
  return await Promise.allSettled(promises);
};

export const bulkRejectRevisions = async (versionIds, rejectionReason) => {
  const promises = versionIds.map((versionId) =>
    approveRevision({ versionId, action: "reject", rejectionReason })
  );
  return await Promise.allSettled(promises);
};

// ===== NOTIFICATION SERVICES =====

// User Notification Services
export const getUserNotifications = async (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api.get(`/users/me/notifications?${qs}`).then((res) => res.data);
};

export const getUserUnreadNotificationsCount = async () => {
  return await api.get("/users/me/notifications/unread-count").then((res) => res.data);
};

export const markNotificationAsRead = async (id) => {
  return await api.put(`/users/me/notifications/${id}/read`).then((res) => res.data);
};

export const markAllNotificationsAsRead = async () => {
  return await api.put("/users/me/notifications/mark-all-read").then((res) => res.data);
};

export const deleteNotification = async (id) => {
  return await api.delete(`/users/me/notifications/${id}`).then((res) => res.data);
};

// Admin Notification Services
export const getAdminNotifications = async (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api.get(`/admin/notifications?${qs}`).then((res) => res.data);
};

export const getNotificationStats = async (detailed = false) => {
  const endpoint = detailed 
    ? "/admin/notifications/stats?detailed=true" 
    : "/admin/notifications/stats";
  
  return await api.get(endpoint).then((res) => res.data);
};

export const broadcastNotification = async (data) => {
  return await api.post("/admin/notifications/broadcast", data).then((res) => res.data);
};

export const updateAdminNotification = async ({ id, data }) => {
  return await api.put(`/admin/notifications/${id}`, data).then((res) => res.data);
};

export const deleteAdminNotification = async (id) => {
  return await api.delete(`/admin/notifications/${id}`).then((res) => res.data);
};
