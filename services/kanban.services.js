import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/kanban",
});

// ==========================================
// PROJECTS
// ==========================================

export const getProjects = async (params = {}) => {
  const { data } = await api.get("/projects", { params });
  return data;
};

export const getProject = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}`);
  return data;
};

export const createProject = async (payload) => {
  const { data } = await api.post("/projects", payload);
  return data;
};

export const updateProject = async ({ projectId, ...payload }) => {
  const { data } = await api.patch(`/projects/${projectId}`, payload);
  return data;
};

export const deleteProject = async (projectId) => {
  const { data } = await api.delete(`/projects/${projectId}`);
  return data;
};

export const toggleArchiveProject = async (projectId) => {
  const { data } = await api.patch(`/projects/${projectId}/archive`);
  return data;
};

// ==========================================
// MEMBERS
// ==========================================

export const getMembers = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/members`);
  return data;
};

export const addMember = async ({ projectId, ...payload }) => {
  const { data } = await api.post(`/projects/${projectId}/members`, payload);
  return data;
};

export const updateMember = async ({ projectId, memberId, ...payload }) => {
  const { data } = await api.patch(
    `/projects/${projectId}/members/${memberId}`,
    payload
  );
  return data;
};

export const removeMember = async ({ projectId, memberId }) => {
  const { data } = await api.delete(
    `/projects/${projectId}/members/${memberId}`
  );
  return data;
};

// ==========================================
// WATCHERS
// ==========================================

export const getWatchers = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/watchers`);
  return data;
};

export const addWatcher = async ({ projectId, ...payload }) => {
  const { data } = await api.post(`/projects/${projectId}/watchers`, payload);
  return data;
};

export const updateWatcher = async ({ projectId, watcherId, ...payload }) => {
  const { data } = await api.patch(
    `/projects/${projectId}/watchers/${watcherId}`,
    payload
  );
  return data;
};

export const removeWatcher = async ({ projectId, watcherId }) => {
  const { data } = await api.delete(
    `/projects/${projectId}/watchers/${watcherId}`
  );
  return data;
};

// ==========================================
// COLUMNS
// ==========================================

export const getColumns = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/columns`);
  return data;
};

export const createColumn = async ({ projectId, ...payload }) => {
  const { data } = await api.post(`/projects/${projectId}/columns`, payload);
  return data;
};

export const updateColumn = async ({ projectId, columnId, ...payload }) => {
  const { data } = await api.patch(
    `/projects/${projectId}/columns/${columnId}`,
    payload
  );
  return data;
};

export const deleteColumn = async ({ projectId, columnId }) => {
  const { data } = await api.delete(
    `/projects/${projectId}/columns/${columnId}`
  );
  return data;
};

export const reorderColumns = async ({ projectId, column_orders }) => {
  const { data } = await api.patch(`/projects/${projectId}/columns/reorder`, {
    column_orders,
  });
  return data;
};

// ==========================================
// TASKS
// ==========================================

export const getTasks = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/tasks`);
  return data;
};

export const getTask = async (taskId) => {
  const { data } = await api.get(`/tasks/${taskId}`);
  return data;
};

export const createTask = async ({ projectId, ...payload }) => {
  const { data } = await api.post(`/projects/${projectId}/tasks`, payload);
  return data;
};

export const updateTask = async ({ taskId, ...payload }) => {
  const { data } = await api.patch(`/tasks/${taskId}`, payload);
  return data;
};

export const deleteTask = async (taskId) => {
  const { data } = await api.delete(`/tasks/${taskId}`);
  return data;
};

export const moveTask = async ({ taskId, column_id, position }) => {
  const { data } = await api.patch(`/tasks/${taskId}/move`, {
    column_id,
    position,
  });
  return data;
};

export const getMyTasks = async (params = {}) => {
  const { data } = await api.get("/me/tasks", { params });
  return data;
};

export const getOverdueTasks = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/tasks/overdue`);
  return data;
};

// ==========================================
// SUBTASKS
// ==========================================

export const createSubtask = async ({ taskId, ...payload }) => {
  const { data } = await api.post(`/tasks/${taskId}/subtasks`, payload);
  return data;
};

export const toggleSubtask = async ({ taskId, subtaskId }) => {
  const { data } = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`);
  return data;
};

export const updateSubtask = async ({ taskId, subtaskId, ...payload }) => {
  const { data } = await api.patch(
    `/tasks/${taskId}/subtasks/${subtaskId}`,
    payload
  );
  return data;
};

export const deleteSubtask = async ({ taskId, subtaskId }) => {
  const { data } = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
  return data;
};

export const reorderSubtasks = async ({ taskId, subtask_orders }) => {
  const { data } = await api.patch(`/tasks/${taskId}/subtasks/reorder`, {
    subtask_orders,
  });
  return data;
};

// ==========================================
// COMMENTS
// ==========================================

export const getComments = async ({ taskId, page = 1, limit = 20 }) => {
  const { data } = await api.get(`/tasks/${taskId}/comments`, {
    params: { page, limit },
  });
  return data;
};

export const addComment = async ({ taskId, ...payload }) => {
  const { data } = await api.post(`/tasks/${taskId}/comments`, payload);
  return data;
};

export const updateComment = async ({ taskId, commentId, ...payload }) => {
  const { data } = await api.patch(
    `/tasks/${taskId}/comments/${commentId}`,
    payload
  );
  return data;
};

export const deleteComment = async ({ taskId, commentId }) => {
  const { data } = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  return data;
};

export const getRecentComments = async ({ projectId, limit = 10 }) => {
  const { data } = await api.get(`/projects/${projectId}/reports/comments`, {
    params: { limit },
  });
  return data;
};

// ==========================================
// ATTACHMENTS
// ==========================================

export const getAttachments = async (taskId) => {
  const { data } = await api.get(`/tasks/${taskId}/attachments`);
  return data;
};

export const uploadAttachment = async ({ taskId, file }) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const addLinkAttachment = async ({ taskId, url, name }) => {
  const { data } = await api.post(`/tasks/${taskId}/attachments/link`, {
    url,
    name,
  });
  return data;
};

export const deleteAttachment = async ({ taskId, attachmentId }) => {
  const { data } = await api.delete(
    `/tasks/${taskId}/attachments/${attachmentId}`
  );
  return data;
};

export const getAttachmentUrl = async ({ taskId, attachmentId }) => {
  const { data } = await api.get(
    `/tasks/${taskId}/attachments/${attachmentId}`
  );
  return data;
};

export const getProjectStorageUsage = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/storage`);
  return data;
};

export const downloadAllAttachments = (taskId) => {
  // Return URL for direct download
  return `/helpdesk/api/kanban/tasks/${taskId}/attachments/download-all`;
};

// ==========================================
// LABELS
// ==========================================

export const getLabels = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/labels`);
  return data;
};

export const createLabel = async ({ projectId, ...payload }) => {
  const { data } = await api.post(`/projects/${projectId}/labels`, payload);
  return data;
};

export const updateLabel = async ({ projectId, labelId, ...payload }) => {
  const { data } = await api.patch(
    `/projects/${projectId}/labels/${labelId}`,
    payload
  );
  return data;
};

export const deleteLabel = async ({ projectId, labelId }) => {
  const { data } = await api.delete(`/projects/${projectId}/labels/${labelId}`);
  return data;
};

// ==========================================
// TIME ENTRIES
// ==========================================

export const getTimeEntriesByTask = async (taskId) => {
  const { data } = await api.get(`/tasks/${taskId}/time-entries`);
  return data;
};

export const logTimeEntry = async ({ taskId, ...payload }) => {
  const { data } = await api.post(`/tasks/${taskId}/time-entries`, payload);
  return data;
};

export const updateTimeEntry = async ({ taskId, entryId, ...payload }) => {
  const { data } = await api.patch(
    `/tasks/${taskId}/time-entries/${entryId}`,
    payload
  );
  return data;
};

export const deleteTimeEntry = async ({ taskId, entryId }) => {
  const { data } = await api.delete(`/tasks/${taskId}/time-entries/${entryId}`);
  return data;
};

export const getMyTimeEntries = async (params = {}) => {
  const { data } = await api.get("/me/time-entries", { params });
  return data;
};

// ==========================================
// REPORTS
// ==========================================

export const getProjectOverview = async (projectId) => {
  const { data } = await api.get(`/projects/${projectId}/reports/overview`);
  return data;
};

export const getMemberReport = async ({ projectId, start_date, end_date }) => {
  const { data } = await api.get(`/projects/${projectId}/reports/members`, {
    params: { start_date, end_date },
  });
  return data;
};

export const getActivityLog = async ({ projectId, page = 1, limit = 50 }) => {
  const { data } = await api.get(`/projects/${projectId}/reports/activities`, {
    params: { page, limit },
  });
  return data;
};

export const getTimeReport = async ({ projectId, start_date, end_date }) => {
  const { data } = await api.get(`/projects/${projectId}/reports/time`, {
    params: { start_date, end_date },
  });
  return data;
};

export const getBurndownData = async ({ projectId, start_date, end_date }) => {
  const { data } = await api.get(`/projects/${projectId}/reports/burndown`, {
    params: { start_date, end_date },
  });
  return data;
};

// ==========================================
// AI FEATURES
// ==========================================

export const aiTaskAssist = async ({ title, description }) => {
  const { data } = await api.post("/ai/task-assist", { title, description });
  return data;
};

export const aiProjectSummary = async (projectId) => {
  const { data } = await api.get(`/ai/project-summary?projectId=${projectId}`);
  return data;
};

export const aiGenerateSubtasks = async (taskId) => {
  const { data } = await api.post(`/tasks/${taskId}/ai-subtasks`);
  return data;
};

export const aiTaskSummary = async (taskId) => {
  const { data } = await api.get(`/tasks/${taskId}/ai-summary`);
  return data;
};

export const aiLaporanKegiatan = async ({ projectId, startDate, endDate }) => {
  const { data } = await api.get(
    `/ai/laporan-kegiatan?projectId=${projectId}&startDate=${startDate}&endDate=${endDate}`
  );
  return data;
};

export const aiTaskLaporan = async (taskId) => {
  const { data } = await api.get(`/tasks/${taskId}/ai-laporan`);
  return data;
};

export const aiRefineText = async ({ text, type }) => {
  const { data } = await api.post("/ai/refine-text", { text, type });
  return data;
};
