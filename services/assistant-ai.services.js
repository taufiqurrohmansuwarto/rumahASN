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
  const response = await fetchApi.get(`/testing`, {
    responseType: "stream",
    headers: {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });

  return response;
};

export const sendFeedback = async (data) => {
  return api.post(`/assistants/feedback`, data).then((res) => res?.data);
};

export const getFeedback = async () => {
  return api.get(`/assistants/feedback`).then((res) => res?.data);
};

export const updateResponse = async ({ threadId, id, response }) => {
  return api
    .patch(`/assistants/threads/${threadId}/messages/${id}`, {
      response,
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
