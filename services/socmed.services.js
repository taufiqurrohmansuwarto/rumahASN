import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/asn/socmed",
});

export const getPosts = () => {
  return api.get("/posts").then((res) => res?.data);
};

export const getPost = (id) => {
  return api.get(`/posts/${id}`).then((res) => res?.data);
};

export const createPost = (data) => {
  return api.post("/posts", data).then((res) => res?.data);
};

export const updatePost = ({ id, data }) => {
  return api.patch(`/posts/${id}`, data).then((res) => res?.data);
};

export const deletePost = (id) => {
  return api.delete(`/posts/${id}`).then((res) => res?.data);
};

export const likePost = (id) => {
  return api.put(`/posts/${id}/likes`).then((res) => res?.data);
};

export const getComments = (postId) => {
  return api.get(`/posts/${postId}/comments`).then((res) => res?.data);
};

export const createComment = ({ postId, data }) => {
  return api.post(`/posts/${postId}/comments`, data).then((res) => res?.data);
};

export const updateComment = ({ postId, commentId, data }) => {
  return api
    .patch(`/posts/${postId}/comments/${commentId}`, data)
    .then((res) => res?.data);
};

export const deleteComment = ({ postId, commentId }) => {
  return api
    .delete(`/posts/${postId}/comments/${commentId}`)
    .then((res) => res?.data);
};
