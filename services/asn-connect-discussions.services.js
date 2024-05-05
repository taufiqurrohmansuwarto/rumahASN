import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/asn/discussions",
});

// just admin can create / update / delete discussions
export const createDiscussion = async (data) => {
  return api.post("/admin/all", data).then((res) => res.data);
};

export const updateDiscussion = async ({ id, data }) => {
  return api.patch(`/admin/all/${id}`, data).then((res) => res.data);
};

// user role
export const getDisccusions = async (params) => {
  const query = queryString.stringify(params, {
    skipEmptyString: true,
    skipNull: true,
  });
  return api.get(`/user/all?${query}`).then((res) => res.data);
};

export const getDiscussion = async (id) => {
  return api.get(`/user/all/${id}`).then((res) => res.data);
};

export const upvoteDiscussion = async (id) => {
  return api.put(`/user/all/${id}/votes`).then((res) => res.data);
};

export const downvoteDiscussion = async (id) => {
  return api.delete(`/user/all/${id}/votes`).then((res) => res.data);
};

// create comment
export const createComment = async ({ discussionId, data }) => {
  return api.post(`/user/all/${discussionId}`, data).then((res) => res.data);
};

export const updateComment = async ({ discussionId, commentId, data }) => {
  return api
    .patch(`/user/all/${discussionId}/${commentId}`, data)
    .then((res) => res.data);
};

export const deleteComment = async ({ discussionId, commentId }) => {
  return api
    .delete(`/user/all/${discussionId}/${commentId}`)
    .then((res) => res.data);
};

export const upvoteComment = async ({ discussionId, commentId }) => {
  return api
    .put(`/user/all/${discussionId}/${commentId}/votes`)
    .then((res) => res.data);
};

export const downvoteComment = async ({ discussionId, commentId }) => {
  return api
    .delete(`/user/all/${discussionId}/${commentId}/votes`)
    .then((res) => res.data);
};
