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
