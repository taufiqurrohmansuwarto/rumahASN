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

export const getCategories = async (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });
  return await api.get(`/ref/categories?${qs}`).then((res) => res.data);
};

// subcategories
export const subCategories = async (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });

  return await api.get(`/ref/sub-categories?${qs}`).then((res) => res.data);
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

export const listNotifications = async (query) => {
  const qs = queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });
  return await api.get(`/notifications?${qs}`).then((res) => res?.data);
};

export const clearChatsNotificatoins = async () => {
  return await api.put("/notifications").then((res) => res?.data);
};

export const removeNotification = async (id) => {
  return await api.delete(`/notifications/${id}`).then((res) => res?.data);
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

export const detailSubFaqs = async (id) => {
  return await api.get(`/ref/sub-faqs/${id}`).then((res) => res?.data);
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
export const publishTickets = async (query) => {
  const qs = queryString.stringify(query, { arrayFormat: "comma" });
  console.log(qs);

  return await api.get(`/tickets?${qs}`).then((res) => res?.data);
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

export const updateCommentsReactions = ({ ticketId, commentId, data }) => {
  return api
    .patch(`/tickets/${ticketId}/comments/${commentId}/reactions`, data)
    .then((res) => res?.data);
};

export const removeCommentsReactions = ({ ticketId, commentId, data }) => {
  return api
    .put(`/tickets/${ticketId}/comments/${commentId}/reactions`, data)
    .then((res) => res?.data);
};

// update ticket property
export const editTicket = ({ id, data }) => {
  return api.patch(`/tickets/${id}`, data).then((res) => res?.data);
};

export const changeStatus = ({ id, data }) => {
  return api.patch(`/tickets/${id}/status`, data).then((res) => res?.data);
};

export const changeAssignee = ({ id, data }) => {
  return api.patch(`/tickets/${id}/agents`, data).then((res) => res?.data);
};

export const changePrioritySubcategory = ({ id, data }) => {
  return api
    .patch(`/tickets/${id}/priority-sub-category`, data)
    .then((res) => res?.data);
};

export const changeFeedbackTicket = ({ id, data }) => {
  return api.patch(`/tickets/${id}/feedback`, data).then((res) => res?.data);
};

// saved replies
export const getSavedReplies = () => {
  return api.get("/saved-replies").then((res) => res?.data);
};

export const createSavedReplies = (data) => {
  return api.post("/saved-replies", data).then((res) => res?.data);
};

export const updateSavedReplies = ({ id, data }) => {
  return api.patch(`/saved-replies/${id}`, data).then((res) => res?.data);
};

export const deleteSavedReplies = (id) => {
  return api.delete(`/saved-replies/${id}`).then((res) => res?.data);
};

export const detailSavedReplies = (id) => {
  return api.get(`/saved-replies/${id}`).then((res) => res?.data);
};

// mentions
export const usersMentionsMarkdown = () => {
  return api.get("/users-mentions").then((res) => res?.data);
};

export const ticketsMentionsMarkdown = (ticketNumber) => {
  return api
    .get(`/tickets-mentions?ticket_number=${ticketNumber}`)
    .then((res) => res?.data);
};

export const pinnetdTickets = () => {
  return api.get("/tickets/pinned").then((res) => res?.data);
};

// list berita
export const publikasiCasn = (query) => {
  const params = queryString.stringify(query);

  return api.get(`/web/publikasi-casn?${params}`).then((res) => res?.data);
};

export const detailPublikasiCasn = (id) => {
  return api.get(`/web/publikasi-casn/${id}`).then((res) => res?.data);
};

export const nilaiCasn = () => {
  return api.get(`/web/nilai-casn`).then((res) => res?.data);
};

// ticket feedbacks
export const createFeedbacks = (data) => {
  return api.post("/feedbacks", data).then((res) => res?.data);
};

export const getFeedbacks = () => {
  return api.get("/feedbacks").then((res) => res?.data);
};

// app rating
export const showAppRating = () => {
  return api.get("/ratings").then((res) => res?.data);
};

export const closeAppRating = () => {
  return api.delete("/ratings").then((res) => res?.data);
};

export const giveAppRating = (data) => {
  return api.post("/ratings", data).then((res) => res?.data);
};

// check layanan siasn
export const pencarianLayananSIASN = ({ jenis_layanan, nip }) => {
  return api
    .get(`/layanan/siasn?jenis_layanan=${jenis_layanan}&nip=${nip}`)
    .then((res) => res?.data);
};

export const ticketReminder = (id) => {
  return api.post(`/tickets/${id}/reminders`).then((res) => res?.data);
};

export const getTicketRecommendations = (id) => {
  return api.get(`/tickets/${id}/recommendations`).then((res) => res?.data);
};

export const recommendationFaq = (title) => {
  return api
    .get(`/recommendations/faqs?title=${title}`)
    .then((res) => res?.data);
};

// profile
export const ownProfile = () => {
  return api.get("/profiles").then((res) => res?.data);
};
export const updateOwnProfile = (data) => {
  return api.patch("/profiles", data).then((res) => res?.data);
};
export const getProfile = (id) => {
  return api.get(`/profiles/${id}`).then((res) => res?.data);
};

// private messages

// send message
export const sendPrivateMessage = (data) => {
  return api.post("/private-messages", data).then((res) => res?.data);
};

// read message
export const readPrivateMessage = (id) => {
  return api.patch(`/private-messages/${id}`).then((res) => res?.data);
};

// detail message
export const detailPrivateMessage = (id) => {
  return api.get(`/private-messages/${id}`).then((res) => res?.data);
};

// all message
export const getPrivateMessages = (query = {}) => {
  const params = queryString.stringify(query, {
    arrayFormat: "comma",
    skipEmptyString: true,
    skipNull: true,
  });

  return api.get(`/private-messages?${params}`).then((res) => res?.data);
};

export const getListYoutube = () => {
  return api.get("/videos").then((res) => res?.data);
};

// ipasn
export const getIpasn = (nip) => {
  return api.get(`/siasn/${nip}/ip-asn`).then((res) => res?.data);
};
