// base url for proxy
const BASE_URL = `/siasn-ws/proxy/pns`;

const { default: axios } = require("axios");

const api = axios.create({
  baseURL: "https://siasn.bkd.jatimprov.go.id/pemprov-api",
  timeout: 60000, // 1 menit
});

module.exports.getFileAsn = async (filePath) => {
  const response = await api.get(
    `/vendor/download-file-asn?file_path=${filePath}`,
    {
      responseType: "arraybuffer",
    }
  );
  return response.data;
};

module.exports.proxyDownloadFoto = async (fetcher, nip) => {
  return fetcher.get(`${BASE_URL}/foto/${nip}`, {
    responseType: "arraybuffer",
  });
};

module.exports.cariPnsKinerja = async (fetcher, nip) => {
  const url = `${BASE_URL}/cari-pns-kinerja/${nip}`;
  return fetcher.get(url);
};

module.exports.proxyKeluargaDataOrtu = async (fetcher, nip) => {
  return fetcher.get(`${BASE_URL}/data-ortu/${nip}`);
};

module.exports.proxyKeluargaAnak = async (fetcher, nip) => {
  return fetcher.get(`${BASE_URL}/data-anak/${nip}`);
};

module.exports.proxyKeluargaPasangan = async (fetcher, nip) => {
  return fetcher.get(`${BASE_URL}/data-pasangan/${nip}`);
};

module.exports.proxyDataUtamaASN = async (fetcher, nip) => {
  return fetcher.get(`/siasn-ws/proxy/asn/${nip}/data-utama`);
};

module.exports.proxyGelar = async (fetcher, nip) => {
  return fetcher.get(`${BASE_URL}/data-gelar/${nip}`);
};

module.exports.proxyGelarCheck = async (fetcher, nip, gelarId, loc) => {
  return fetcher.get(`${BASE_URL}/data-gelar/${nip}/${gelarId}/check/${loc}`);
};

module.exports.proxyGelarUncheck = async (fetcher, nip, gelarId, loc) => {
  return fetcher.get(`${BASE_URL}/data-gelar/${nip}/${gelarId}/uncheck/${loc}`);
};

module.exports.getDataUtamaASNProxy = (fetcher, nip) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetcher.get(
        `/siasn-ws/proxy/asn/${nip}/data-utama`
      );
      resolve(response.data?.data);
    } catch (error) {
      resolve(null);
    }
  });
};

module.exports.proxyLayananRekapPG = async (fetcher, query) => {
  return fetcher.get(`/siasn-ws/proxy/layanan/rekap/pg`, {
    params: query,
  });
};

module.exports.proxyLayananRekapPengadaan = async (fetcher, query) => {
  return fetcher.get(`/siasn-ws/proxy/layanan/rekap/pengadaan`, {
    params: query,
  });
};
