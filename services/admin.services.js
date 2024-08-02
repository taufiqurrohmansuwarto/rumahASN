import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/admins",
});

export const reportSimasterEmployees = async () => {
  return api
    .get(`/reports/simaster/employees`, {
      responseType: "arraybuffer",
    })
    .then((res) => res?.data);
};

export const updateKategories = async ({ id, data }) => {
  return await api
    .patch(`/tickets/${id}/properties`, data)
    .then((res) => res?.data);
};

export const getAllTickets = async (query) => {
  return api
    .get(
      `/tickets?${queryString.stringify(query, {
        skipNull: true,
        skipEmptyString: true,
      })}`
    )
    .then((res) => res?.data);
};

export const detailTicket = (id) => {
  return api.get(`/tickets/${id}`).then((res) => res?.data);
};

export const listAgents = async () => {
  return api.get(`/agents`).then((res) => res?.data);
};

// agents
export const assignAgents = async ({ id, data }) => {
  return api.patch(`/ticket-agents/${id}`, data).then((res) => res?.data);
};

export const removeAgents = async (id) => {
  return api.delete(`/ticket-agents/${id}`).then((res) => res?.data);
};

export const adminDashboard = async (type = "standard") => {
  return api.get(`/dashboard?type=${type}`).then((res) => res?.data);
};

export const excelReport = async () => {
  return api
    .get(`/reports`, {
      responseType: "arraybuffer",
    })
    .then((res) => res?.data);
};

export const commentsCustomersToAgents = async (id) => {
  return api.get(`/tickets/${id}/comments-customers`).then((res) => res?.data);
};

export const trends = async () => {
  return api.get(`/analysis/trends`).then((res) => res?.data);
};

export const agentsPerformances = async () => {
  return api.get(`/analysis/performa-agent`).then((res) => res?.data);
};

export const customerSatisafactionsScore = async () => {
  return api.get(`/analysis/kepuasan-pelanggan`).then((res) => res?.data);
};

export const ticketStatisticsScore = async () => {
  return api.get(`/analysis/statistik-tiket`).then((res) => res?.data);
};

export const comparePegawaiAdmin = async () => {
  return api.get(`/dashboard-komparasi`).then((res) => res?.data);
};


