module.exports.riwayatGolonganPangkat = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-golongan/${nip}`);
};

module.exports.riwayatPMK = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-masakerja/${nip}`);
};

module.exports.riwayatPendidikan = (fetcher, nip) => {
  console.log(nip);
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
  const {
    nip,
    namaKursus,
    penyelenggara,
    tahun,
    jam,
    tanggalMulai,
    tanggalSelesai,
    tempat,
    noSertifikat,
  } = data;
};

module.exports.cpnspns = (fetcher, nip) => {};

module.exports.riwayatKeluarga = (fetcher, nip) => {};

module.exports.riwayatSKP = (fetcher, nip) => {};

module.exports.riwayatPencantumanGelar = (fetcher, nip) => {};

module.exports.riwayatAngkaKredit = (fetcher, nip) => {};

module.exports.riwayatLaporanKinerja = (fetcher, nip) => {};
