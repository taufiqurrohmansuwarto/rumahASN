import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/bot",
});

export const getAssistants = async () => {
  return api.get("/assistants").then((res) => res?.data);
};

export const getThreads = async (assistantId) => {
  return api.get(`/assistants/${assistantId}/threads`).then((res) => res?.data);
};

export const chat = async ({ assistantId, threadId, message }) => {
  return api
    .post(`/assistants/chat?assistantId=${assistantId}`, {
      threadId,
      message,
    })
    .then((res) => res?.data);
};

export const getThreadMessages = async ({ assistantId, threadId }) => {
  return api
    .get(`/assistants/${assistantId}/threads/${threadId}/messages`)
    .then((res) => res?.data);
};

export const deleteThreadMessages = async ({ assistantId, threadId }) => {
  return api
    .delete(`/assistants/${assistantId}/threads/${threadId}/messages`)
    .then((res) => res?.data);
};
