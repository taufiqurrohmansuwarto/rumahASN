const { trim } = require("lodash");
const paparse = require("papaparse");
const path = require("path");
const fs = require("fs");

const parseCSV = (filePath) => {
  const file = fs.readFileSync(filePath, "utf8");
  return paparse.parse(file, {
    header: true,
    skipEmptyLines: true,
    delimiter: ";",
  }).data;
};

const getFilePath = (filename) => path.join(process.cwd(), `docs/${filename}`);

// ----------Sub Bagian TATA USAHA SMKN 8 MALANG remove ------------
const removeDash = (text) => {
  return text.replace(/-/g, " ");
};

module.exports.refSiasnUnor = () => {
  const data = parseCSV(getFilePath("siasn/unor-new.csv"));

  const result = data.map((item) => {
    return {
      ...item,
      NamaUnor: trim(removeDash(item?.NamaUnor)),
    };
  });

  return result;
};

module.exports.riwayatGolonganPangkat = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-golongan/${nip}`);
};

// baru
module.exports.foto = (fetcher, pnsId) => {
  return fetcher.get(`/pns/photo/${pnsId}`, {
    responseType: "arraybuffer",
  });
};

module.exports.IPASNBaru = (fetcher, nip) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await fetcher.get(`/pns/nilaiipasn/${nip}`);
      resolve(result?.data?.data);
    } catch (error) {
      if (error?.code === 0) {
        resolve(null);
      } else {
        reject(error);
      }
    }
  });
  // return fetcher.get(`/pns/nilaiipasn/${nip}`).then((res) => res?.data);
};

module.exports.saveUnorJabatan = (fetcher, data) => {
  return fetcher.post(`/jabatan/unorjabatan/save`, data);
};

module.exports.removeJabatan = (fetcher, jabatanId) => {
  return fetcher.delete(`/jabatan/delete/${jabatanId}`);
};

module.exports.dataUtama = (fetcher, nip) => {
  return fetcher.get(`/pns/data-utama/${nip}`).then((res) => {
    return res.data?.data;
  });
};

// keluarga
module.exports.anak = (fetcher, nip) => {
  return fetcher.get(`/pns/data-anak/${nip}`);
};

module.exports.pasangan = (fetcher, nip) => {
  return fetcher.get(`/pns/data-pasangan/${nip}`);
};

module.exports.tambahPasangan = (fetcher, data) => {
  return fetcher.post(`/keluarga/pasangan/save`, data);
};

module.exports.tambahAnak = (fetcher, data) => {
  return fetcher.post(`/keluarga/anak/save`, data);
};

module.exports.orangTua = (fetcher, nip) => {
  return fetcher.get(`/pns/data-ortu/${nip}`);
};

// end of keluarga

module.exports.daftarKenaikanPangkat = (
  fetcher,
  periode,
  limit = 100,
  offset = 0
) => {
  return fetcher.get(
    `/pns/list-kp-instansi?periode=${periode}&limit=${limit}&offset=${offset}`
  );
};

module.exports.daftarPengadaanInstansi = (fetcher, tahunAnggaran) => {
  return fetcher
    .get(`/pengadaan/list-pengadaan-instansi?tahun=${tahunAnggaran}`)
    .then((res) => res?.data?.data);
};

module.exports.daftarPengadaanDokumen = (fetcher, tahunAnggaran) => {
  return fetcher
    .get(`/pengadaan/dokumen-pengadaan?tahun=${tahunAnggaran}`)
    .then((res) => res?.data?.data);
};

module.exports.daftarPengadaanDokumen = (fetcher, tahunAnggaran) => {
  const url = `/pengadaan/dokumen-pengadaan?tahun=${tahunAnggaran}`;
  return fetcher.get(url).then((res) => res?.data);
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
  return new Promise(async (resolve, reject) => {
    try {
      const result = await fetcher.get(`/pns/rw-diklat/${nip}`);
      resolve(result?.data);
    } catch (error) {
      console.log(error);
      resolve([]);
    }
  });
  // return fetcher.get(`/pns/rw-diklat/${nip}`);
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

module.exports.tambahRiwayatPengharggan = (fetcher, data) => {
  return fetcher.post(`/penghargaan/save`, data);
};

module.exports.hapusRiwayatPenghargaan = (fetcher, id) => {
  return fetcher.delete(`/penghargaan/delete/${id}`);
};

module.exports.riwayatPindahInstansi = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-pindahinstansi/${nip}`);
};

module.exports.riwayatCtln = (fetcher, nip) => {
  return fetcher.get(`/pns/rw-cltn/${nip}`);
};

module.exports.postDataKursus = (fetcher, data) => {
  return fetcher.post(`/kursus/save`, data);
};

module.exports.postDataDiklat = (fetcher, data) => {
  return fetcher.post(`/diklat/save`, data);
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

module.exports.removeKursusSiasn = (fetcher, id) => {
  return fetcher.delete(`/kursus/delete/${id}`);
};

module.exports.removeDiklatSiasn = (fetcher, id) => {
  return fetcher.delete(`/diklat/delete/${id}`);
};

// kinerja periodik
module.exports.rwKinerjaPeriodik = (fetcher, nip) => {
  return new Promise((resolve, reject) => {
    fetcher
      .get(`/pns/rw-kinerjaperiodik/${nip}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        if (error?.code === 0) {
          resolve([]);
        } else {
          reject(error);
        }
      });
  });
};

// create kinerja periodik
module.exports.createKinerjaPeriodik = (fetcher, data) => {
  return fetcher.post(`/kinerjaperiodik/save`, data);
};

module.exports.hapusKinerjaPeriodik = (fetcher, id) => {
  return fetcher.delete(`/kinerjaperiodik/delete/${id}`);
};

// create cpns / pns
module.exports.createCpnsPns = (fetcher, data) => {
  return fetcher.post(`/cpns/save`, data);
};

// admin
module.exports.kenaikanPangkatPeriode = (fetcher, periode) => {
  return fetcher
    .get(`/pns/list-kp-instansi?periode=${periode}`)
    .then((res) => res?.data);
};

// create hukuman disiplin
module.exports.createHukdis = (fetcher, data) => {
  return fetcher.post(`/hukdis/save`, data);
};

// integrated mutasi
module.exports.fetchIntegratedMutasi = (fetcher, data) => {
  return fetcher.post(`/imut/simpeg/usulan/list`, data);
};

module.exports.downloadDokumenAPI = (fetcher, path) => {
  return fetcher
    .get(`/download-dok?filePath=${path}`, {
      responseType: "arraybuffer",
    })
    .then((res) => {
      return res?.data;
    });
};
