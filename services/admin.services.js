import axios from "axios";
import queryString from "query-string";

const api = axios.create({
  baseURL: "/helpdesk/api/admins",
});

export const getSiasnToken = async () => {
  try {
    const response = await api.get(`/siasn-token`);
    return response.data?.data || null;
  } catch (error) {
    console.error("Error fetching SIASN token:", error);
    throw new Error(
      error.response?.data?.message || "Gagal mengambil token SIASN"
    );
  }
};

export const setSiasnToken = async (token) => {
  try {
    const response = await api.post(`/siasn-token`, { token });
    return response.data;
  } catch (error) {
    console.error("Error setting SIASN token:", error);
    throw new Error(
      error.response?.data?.message || "Gagal memperbarui token SIASN"
    );
  }
};

export const testConnectionSiasn = async () => {
  return api.get(`/siasn-token/testing`).then((res) => res?.data);
};

export const downloadFineTunning = async () => {
  return api
    .get(`/openai/download`, {
      responseType: "blob",
    })
    .then((res) => res?.data);
};

export const summarizeQuestion = async (id) => {
  return api.post(`/openai/summarize`, { id }).then((res) => res?.data);
};

export const getSolution = async ({ question, id }) => {
  return api
    .post(`/openai/solution`, { question, id })
    .then((res) => res?.data);
};

export const deleteSummary = async ({ id }) => {
  return api.put(`/openai/summarize`, { id }).then((res) => res?.data);
};

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

// pengadaan asn
export const getMejaRegistrasi = async () => {
  return api.get(`/pengadaan-asn/meja-registrasi`).then((res) => res?.data);
};

export const uploadMejaRegistrasi = async (data) => {
  return api
    .post(`/pengadaan-asn/meja-registrasi`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res?.data);
};

// peremajaan pendidikan
export const createUsulanPeremajaanPendidikan = async (data) => {
  return api
    .post(`/siasn/usulan-peremajaan/pendidikan`, data)
    .then((res) => res?.data);
};

// upload file
export const uploadFilePeremajaanPendidikan = async (data) => {
  return api
    .post(`/siasn/usulan-peremajaan/pendidikan/upload`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res?.data);
};

// submit usulan
export const submitUsulanPeremajaanPendidikan = async (data) => {
  return api
    .post(`/siasn/usulan-peremajaan/pendidikan/submit`, data)
    .then((res) => res?.data);
};

// update data usulan
export const updateDataUsulanPeremajaanPendidikan = async (data) => {
  return api
    .post(`/siasn/usulan-peremajaan/pendidikan/update`, data)
    .then((res) => res?.data);
};
