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
