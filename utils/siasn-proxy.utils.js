// base url for proxy
const BASE_URL = `/siasn-ws/proxy/pns`;

module.exports.proxyDownloadFoto = async (fetcher, nip) => {
  return fetcher.get(`${BASE_URL}/foto/${nip}`, {
    responseType: "arraybuffer",
  });
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
