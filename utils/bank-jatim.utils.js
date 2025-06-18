const BASE_URL = "/partners/bankjatim";

// ping
export const pingKoneksi = async (fetcher) => {
  const url = `${BASE_URL}/ping`;
  const result = await fetcher.post(url);
  return result;
};

// pengajuan
export const pengajuanKredit = async (fetcher, data) => {
  const url = `${BASE_URL}/loans/application`;
  return fetcher.post(url, data);
};

// cek peminjaman
export const cekPeminjamanKredit = async (fetcher, data) => {
  const url = `${BASE_URL}/loans/cek`;
  return fetcher.post(url, data);
};

// simulasi
export const simulasiKredit = async (fetcher, data) => {
  const url = `${BASE_URL}/loans/simulation`;
  return fetcher.post(url, data);
};

// histories
export const historiesKredit = async (fetcher, data) => {
  const url = `${BASE_URL}/loans/histories`;
  return fetcher.post(url, data);
};
