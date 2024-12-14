import axios from "axios";

const api = axios.create({
  baseURL: "/helpdesk/api/bot",
});

const fetchApi = axios.create({
  baseURL: "/helpdesk/api",
  adapter: "fetch",
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
const sendMessage = async ({ threadId, message }) => {
  return api
    .post(`/assistants/chat`, {
      threadId,
      message,
    })
    .then((res) => res?.data);
};

// get all messages in a thread
const getThreadMessages = async ({ threadId }) => {
  return api
    .get(`/assistants/threads/${threadId}/messages`)
    .then((res) => res?.data);
};

export const deleteThreadMessages = async ({ assistantId, threadId }) => {
  return api
    .delete(`/assistants/${assistantId}/threads/${threadId}/messages`)
    .then((res) => res?.data);
};

export const getAssistantThreads = async () => {
  return api.get(`/assistants/threads`).then((res) => res?.data);
};

export const testChatCompletion = async () => {
  return await fetchApi
    .get(`/testing`, {
      responseType: "stream",
    })
    .then((res) => res?.data);
};

export const AssistantAIServices = {
  getAssistants,
  getThreads,
  sendMessage,
  getThreadMessages,
  deleteThreadMessages,
  getAssistantThreads,
  testChatCompletion,
};
