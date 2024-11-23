import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/bot",
});

// list all assistants
const getAssistants = async () => {
  return api.get("/assistants").then((res) => res?.data);
};

// list all history threads
const getThreads = async (assistantId) => {
  return api.get(`/assistants/${assistantId}/threads`).then((res) => res?.data);
};

// chat with assistant
const sendMessage = async ({ assistantId, threadId, message }) => {
  return api
    .post(`/assistants/chat?assistantId=${assistantId}`, {
      threadId,
      message,
    })
    .then((res) => res?.data);
};

// get all messages in a thread
const getThreadMessages = async ({ assistantId, threadId }) => {
  return api
    .get(`/assistants/${assistantId}/threads/${threadId}/messages`)
    .then((res) => res?.data);
};

export const deleteThreadMessages = async ({ assistantId, threadId }) => {
  return api
    .delete(`/assistants/${assistantId}/threads/${threadId}/messages`)
    .then((res) => res?.data);
};

export const AssistantAIServices = {
  getAssistants,
  getThreads,
  sendMessage,
  getThreadMessages,
  deleteThreadMessages,
};
