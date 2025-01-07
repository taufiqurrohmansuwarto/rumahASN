const Pendidikan = require("@/utils/pendidikan.json");
const JenisJabatan = require("@/utils/jabatan.json");
const Golongan = require("@/utils/golongan.json");
const Jumlah = require("@/utils/jumlah.json");
const Usia = require("@/utils/usia.json");
const JenisKelamin = require("@/utils/jenis_kelamin.json");

// {"perangkat_daerah":"BADAN KOORDINASI WILAYAH JEMBER","sd":0,"sltp":0,"slta":4,"d-i":0,"d-ii":0,"d-iii":1,"d-iv":2,"s-1":11,"s-2":7,"s-3":0,"grand_total":25}
function convertArrayPendidikan(data) {
  // Daftar atribut yang perlu diubah
  const keys = [
    { key: "sd", type: "SD" },
    { key: "sltp", type: "SLTP" },
    { key: "slta", type: "SLTA" },
    { key: "d-i", type: "D-I" },
    { key: "d-ii", type: "D-II" },
    { key: "d-iii", type: "D-III" },
    { key: "d-iv", type: "D-IV" },
    { key: "s-1", type: "S-1" },
    { key: "s-2", type: "S-2" },
    { key: "s-3", type: "S-3" },
  ];

  // Konversi ke dalam array dengan format {type, value}
  return keys.map((item) => ({
    type: item.type,
    value: data[item.key] || 0, // Default ke 0 jika tidak ada nilai
  }));
}

function convertEselonToKeyValueArray(data) {
  // Daftar atribut yang perlu diubah
  const keys = [
    { key: "eselon_i", type: "Eselon I" },
    { key: "eselon_ii", type: "Eselon II" },
    { key: "eselon_iii", type: "Eselon III" },
    { key: "eselon_iv", type: "Eselon IV" },
    { key: "fungsional", type: "Fungsional" },
    { key: "pelaksana", type: "Pelaksana" },
  ];

  // Konversi ke dalam array dengan format {type, value}
  return keys.map((item) => ({
    type: item.type,
    value: data[item.key] || 0, // Default ke 0 jika tidak ada nilai
  }));
}

function convertGolonganToKeyValueArray(data) {
  // Daftar atribut yang perlu diubah
  const keys = [
    { key: "i/c", type: "I/c" },
    { key: "i/d", type: "I/d" },
    { key: "ii/a", type: "II/a" },
    { key: "ii/b", type: "II/b" },
    { key: "ii/c", type: "II/c" },
    { key: "ii/d", type: "II/d" },
    { key: "iii/a", type: "III/a" },
    { key: "iii/b", type: "III/b" },
    { key: "iii/c", type: "III/c" },
    { key: "iii/d", type: "III/d" },
    { key: "iv/a", type: "IV/a" },
    { key: "iv/b", type: "IV/b" },
    { key: "iv/c", type: "IV/c" },
    { key: "iv/d", type: "IV/d" },
    { key: "iv/e", type: "IV/e" },
  ];

  // Konversi ke dalam array dengan format {type, value}
  return keys.map((item) => ({
    type: item.type,
    value: data[item.key] || 0, // Default ke 0 jika tidak ada nilai
  }));
}

function convertBulanToKeyValueArray(data) {
  // Daftar atribut yang perlu diubah
  const keys = [
    { key: "januari", bulan: "Januari" },
    { key: "februari", bulan: "Februari" },
    { key: "maret", bulan: "Maret" },
    { key: "april", bulan: "April" },
    { key: "mei", bulan: "Mei" },
    { key: "juni", bulan: "Juni" },
    { key: "juli", bulan: "Juli" },
    { key: "agustus", bulan: "Agustus" },
    { key: "september", bulan: "September" },
    { key: "oktober", bulan: "Oktober" },
    { key: "november", bulan: "November" },
    { key: "desember", bulan: "Desember" },
  ];

  // Konversi ke dalam array dengan format {bulan, value}
  return keys.map((item) => ({
    bulan: item.bulan,
    value: data[item.key] || 0, // Default ke 0 jika tidak ada nilai
  }));
}

export const getPendidikanStatistics = async (req, res) => {
  const { perangkat_daerah } = req?.query;
  const data = Pendidikan.find((d) => d?.perangkat_daerah === perangkat_daerah);
  const convertData = convertArrayPendidikan(data);
  return res.status(200).json(convertData);
};

export const getPerangkatDaerah = async (req, res) => {
  const perangkatDaerah = Pendidikan.map((d) => ({
    name: d?.perangkat_daerah,
    value: d?.perangkat_daerah,
    label: d?.perangkat_daerah,
  }));
  return res.status(200).json(perangkatDaerah);
};

export const getJenisJabatanStatistics = async (req, res) => {
  const { perangkat_daerah } = req?.query;
  console.log(perangkat_daerah);
  const data = JenisJabatan.find(
    (d) => d?.perangkat_daerah === perangkat_daerah
  );
  const convertData = convertEselonToKeyValueArray(data);
  return res.status(200).json(convertData);
};

export const getGolonganStatistics = async (req, res) => {
  const { perangkat_daerah } = req?.query;
  const data = Golongan.find((d) => d?.perangkat_daerah === perangkat_daerah);
  const convertData = convertGolonganToKeyValueArray(data);
  return res.status(200).json(convertData);
};

export const getJumlahStatistics = async (req, res) => {
  const { perangkat_daerah } = req?.query;
  const data = Jumlah.find((d) => d?.perangkat_daerah === perangkat_daerah);
  const convertData = convertBulanToKeyValueArray(data);
  return res.status(200).json(convertData);
};

export const getUsiaStatistics = async (req, res) => {
  const { perangkat_daerah } = req?.query;
  const data = Usia.find((d) => d?.perangkat_daerah === perangkat_daerah);
  const convertData = convertUsiaToKeyValueArray(data);
  return res.status(200).json(convertData);
};

/**
 * 
 * @param {*{
    "perangkat_daerah": "BADAN KESATUAN BANGSA DAN POLITIK",
    "kurang_20": 0,
    "20_29": 4,
    "30_39": 12,
    "40_49": 16,
    "50_55": 17,
    "lebih_55": 7,
    "total": 56
  },} data 
 */
const convertUsiaToKeyValueArray = (data) => {
  const keys = [
    { key: "kurang_20", type: "< 20" },
    { key: "20_29", type: "20 - 29" },
    { key: "30_39", type: "30 - 39" },
    { key: "40_49", type: "40 - 49" },
    { key: "50_55", type: "50 - 55" },
    { key: "lebih_55", type: "> 55" },
  ];

  return keys.map((item) => ({
    type: item.type,
    value: data[item.key] || 0, // Default ke 0 jika tidak ada nilai
  }));
};

const convertJenisKelaminToKeyValueArray = (data) => {
  const keys = [
    { key: "L", type: "Laki-laki" },
    { key: "P", type: "Perempuan" },
  ];

  return keys.map((item) => ({
    type: item.type,
    value: data[item.key] || 0, // Default ke 0 jika tidak ada nilai
  }));
};

export const getJenisKelaminStatistics = async (req, res) => {
  const { perangkat_daerah } = req?.query;
  const data = JenisKelamin.find(
    (d) => d?.perangkat_daerah === perangkat_daerah
  );
  const convertData = convertJenisKelaminToKeyValueArray(data);
  return res.status(200).json(convertData);
};
