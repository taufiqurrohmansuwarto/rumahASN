module.exports.riwayatGolonganPangkat = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-golongan/${nip}`);
};

// baru
module.exports.foto = (fetcher, pnsId) => {
  return fetcher.get(`/pns/photo/${pnsId}`);
};

module.exports.dataUtama = (fetcher, nip) => {
  return fetcher.get(`/pns/data-utama/${nip}`);
};

// keluarga
module.exports.anak = (fetcher, nip) => {
  return fetcher.get(`/pns/data-anak/${nip}`);
};

module.exports.pasangan = (fetcher, nip) => {
  return fetcher.get(`/pns/data-pasangan/${nip}`);
};

module.exports.orangTua = (fetcher, nip) => {
  return fetcher.get(`/pns/data-ortu/${nip}`);
};

module.exports.daftarKenaikanPangkat = (fetcher, periode) => {
  return fetcher.get(`/pns/list-kp-instansi?periode=${periode}`);
};

module.exports.listPemberhentianSIASN = (fetcher, tglAwal, tglAkhir) => {
  return fetcher.get(
    `/pns/list-pensiun-instansi?tglAwal=${tglAwal}&tglAkhir=${tglAkhir}`
  );
};

module.exports.updateDataUtama = (fetcher, data) => {
  return fetcher.post(`/pns/data-utama-update`, data);
};

module.exports.riwayatPMK = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-masakerja/${nip}`);
};

module.exports.riwayatPendidikan = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-pendidikan/${nip}`);
};

module.exports.riwayatDiklat = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-diklat/${nip}`);
};

module.exports.riwayatKursus = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-kursus/${nip}`);
};

module.exports.riwayatHukdis = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-hukdis/${nip}`);
};

module.exports.riwayatPindahInstansi = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-pindahinstansi/${nip}`);
};

module.exports.riwayatPindahWilayahKerja = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-pwk/${nip}`);
};

module.exports.riwayatPnsUnor = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-pnsunor/${nip}`);
};

module.exports.riwayatPenghargaan = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-penghargaan/${nip}`);
};

module.exports.riwayatPindahInstansi = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-pindahinstansi/${nip}`);
};

module.exports.riwayatCtln = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-ctln/${nip}`);
};

module.exports.postDataKursus = (fetcher, data) => {
  return fetcher.post(`/kursus/save`, data);
};

module.exports.cpnspns = (fetcher, nip) => {};

module.exports.riwayatKeluarga = (fetcher, nip) => {};

module.exports.riwayatSKP = (fetcher, nip) => {};

module.exports.riwayatPencantumanGelar = (fetcher, nip) => {};

module.exports.riwayatAngkaKredit = (fetcher, nip) => {};

module.exports.riwayatLaporanKinerja = (fetcher, nip) => {};

// tambahan dar webservices
module.exports.rwCltn = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-ctln/${nip}`);
};

module.exports.rwDp3 = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-dp3/${nip}`);
};

module.exports.rwMasaKerja = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-masakerja/${nip}`);
};

module.exports.rwPemberhentian = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-pemberhentian/${nip}`);
};

module.exports.rwPindahInstansi = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-pindahinstansi/${nip}`);
};

module.exports.uploadFileKP = (fetcher, data) => {
  return fetcher.post(`/upload-dok-sk-kp`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
