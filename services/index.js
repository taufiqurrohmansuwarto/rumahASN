import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api",
});

export const createTickets = async (data) => {
  return await api.post("/tickets", data);
};

export const uploadImage = async (data) => {
  return api.post("/upload", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadFiles = async (data) => {
  return api.post("/uploads", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// just for admin only
export const createStatus = async (data) => {
  return await api.post("/ref/status", data).then((res) => res.data);
};

export const updateStatus = async ({ id, data }) => {
  return await api.patch(`/ref/status/${id}`, data).then((res) => res.data);
};

export const deleteStatus = async (id) => {
  return await api.delete(`/ref/status/${id}`).then((res) => res.data);
};

export const getStatus = async () => {
  return await api.get("/ref/status").then((res) => res.data);
};

// users
export const getUsers = async (query) => {
  // change query to querystring
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api.get(`/users?${qs}`).then((res) => res.data);
};

export const updateUsers = async (id, data) => {
  return await api.put(`/users/${id}`, data).then((res) => res.data);
};

// priorities
export const createPriority = async (data) => {
  return await api.post("/ref/priorities", data).then((res) => res.data);
};

export const updatePriority = async ({ id, data }) => {
  return await api.patch(`/ref/priorities/${id}`, data).then((res) => res.data);
};

export const deletePriority = async (id) => {
  return await api.delete(`/ref/priorities/${id}`).then((res) => res.data);
};

export const getPriorities = async () => {
  return await api.get("/ref/priorities").then((res) => res.data);
};

// categories
export const createCategory = async (data) => {
  return await api.post("/ref/categories", data).then((res) => res.data);
};

export const updateCategory = async ({ id, data }) => {
  return await api.patch(`/ref/categories/${id}`, data).then((res) => res.data);
};

export const deleteCategory = async (id) => {
  return await api.delete(`/ref/categories/${id}`).then((res) => res.data);
};

export const getCategories = async () => {
  return await api.get("/ref/categories").then((res) => res.data);
};

// subcategories
export const subCategories = async () => {
  return await api.get("/ref/sub-categories").then((res) => res.data);
};

export const createSubCategory = async (data) => {
  return await api.post("/ref/sub-categories", data).then((res) => res.data);
};

export const updateSubCategory = async ({ id, data }) => {
  return await api
    .patch(`/ref/sub-categories/${id}`, data)
    .then((res) => res.data);
};

export const deleteSubCategory = async (id) => {
  return await api.delete(`/ref/sub-categories/${id}`).then((res) => res.data);
};

// data tree
export const getTreeOrganization = async () => {
  return await api.get("/data/departments").then((res) => res?.data);
};

// comments
export const getComments = async () => {
  return await api.get("/comments").then((res) => res.data);
};

export const createComment = async (data) => {
  return await api.post("/comments", data).then((res) => res.data);
};

export const updateComments = async ({ id, data }) => {
  return await api.patch(`/comments/${id}`, data).then((res) => res.data);
};

export const deleteComments = async (id) => {
  return await api.delete(`/comments/${id}`).then((res) => res.data);
};

export const detailComments = async (id) => {
  return await api.get(`/comments/${id}`).then((res) => res.data);
};

// list berita dan banner

export const dataListBerita = async () => {
  return await api.get("/berita").then((res) => res?.data);
};

export const dataListBanner = async () => {
  return await api.get("/banner").then((res) => res?.data);
};

export const listNotifications = async (simbol = "no") => {
  return await api
    .get(`/notifications?symbol=${simbol}`)
    .then((res) => res?.data);
};

export const clearChatsNotificatoins = async () => {
  return await api.put("/notifications").then((res) => res?.data);
};

// faq and sub faq
export const getFaqs = async () => {
  return await api.get("/ref/faqs").then((res) => res?.data);
};

export const getFaq = async (id) => {
  return await api.get(`/ref/faqs/${id}`).then((res) => res?.data);
};

export const createFaq = async (data) => {
  return await api.post("/ref/faqs", data).then((res) => res?.data);
};

export const updateFaq = async ({ id, data }) => {
  return await api.patch(`/ref/faqs/${id}`, data).then((res) => res?.data);
};

export const deleteFaq = async (id) => {
  return await api.delete(`/ref/faqs/${id}`).then((res) => res?.data);
};

export const getSubFaqs = async () => {
  return await api.get("/ref/sub-faqs").then((res) => res?.data);
};

export const createSubFaq = async (data) => {
  return await api.post("/ref/sub-faqs", data).then((res) => res?.data);
};

export const updateSubFaq = async ({ id, data }) => {
  return await api.patch(`/ref/sub-faqs/${id}`, data).then((res) => res?.data);
};

export const deleteSubFaq = async (id) => {
  return await api.delete(`/ref/sub-faqs/${id}`).then((res) => res?.data);
};

// fucking toogle admin and agent

export const toggleAdminAgent = async (id) => {
  return await api.patch(`/users/${id}`).then((res) => res?.data);
};

export const parseMarkdown = async (data) => {
  return await api.post("/markdown", { text: data }).then((res) => res?.data);
};

// publish tickets
export const publishTickets = async () => {
  return await api.get(`/tickets`).then((res) => res?.data);
};

// detail publish tickets
export const detailPublishTickets = async (id) => {
  return await api.get(`/tickets/${id}`).then((res) => res?.data);
};

// comments
export const createCommentCustomer = async ({ id, data }) => {
  return await api
    .post(`/tickets/${id}/comments`, data)
    .then((res) => res?.data);
};

export const hapusCommentCustomer = async ({ ticketId, commentId }) => {
  return await api
    .delete(`/tickets/${ticketId}/comments/${commentId}`)
    .then((res) => res?.data);
};

export const updateCommentCustomer = async ({ ticketId, commentId, data }) => {
  return await api
    .patch(`/tickets/${ticketId}/comments/${commentId}`, data)
    .then((res) => res?.data);
};

// lock and unlock conversation
export const lockConversation = (id) => {
  return api.put(`/tickets/${id}/lock`);
};

export const unlockConversation = (id) => {
  return api.delete(`/tickets/${id}/lock`);
};

// publish and unpublish
export const publish = (id) => {
  return api.put(`/tickets/${id}/publish`);
};

export const unpublish = (id) => {
  return api.delete(`/tickets/${id}/publish`);
};

// pin and unpin
export const pin = (id) => {
  return api.put(`/tickets/${id}/pin`);
};

export const unpin = (id) => {
  return api.delete(`/tickets/${id}/pin`);
};

// remove service
export const removeTicket = (id) => {
  return api.delete(`/tickets/${id}`);
};

export const markAnswerTicket = ({ id, commentId }) => {
  return api.put(`/tickets/${id}/comments/${commentId}/mark-answer`);
};

export const unmarkAnswerTicket = ({ id, commentId }) => {
  return api.delete(`/tickets/${id}/comments/${commentId}/mark-answer`);
};

export const subscribeTicket = (id) => {
  return api.put(`/tickets/${id}/subscribe`);
};

export const unsubscribeTicket = (id) => {
  return api.delete(`/tickets/${id}/subscribe`);
};

// references
export const refAgents = () => {
  return api.get("/references/agents").then((res) => res?.data);
};

export const refCategories = () => {
  return api.get("/references/categories").then((res) => res?.data);
};

export const refPriorities = () => {
  return api.get("/references/priorities").then((res) => res?.data);
};

export const refStatus = () => {
  return api.get("/references/status").then((res) => res?.data);
};

export const updateCommentsReactions = ({ ticketId, commentId }) => {
  return api
    .put(`/tickets/${ticketId}/comments/${commentId}/reactions`)
    .then((res) => res?.data);
};
