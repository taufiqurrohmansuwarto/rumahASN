module.exports.getRwPendidikanMaster = async (fetcher, nip) => {
  try {
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-pendidikan`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

// keluarga, pasangan, dan anak
module.exports.getRwPasangan = async (fetcher, nip) => {
  try {
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-pasangan`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

// penghargaan
module.exports.getRwPenghargaan = async (fetcher, nip) => {
  try {
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-penghargaan`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports.getRwAnak = async (fetcher, nip) => {
  try {
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-anak`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports.getRwKedudukanHukum = async (fetcher, nip) => {
  try {
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-kedudukan-hukum`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports.getRwPindah = async (fetcher, nip) => {
  try {
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-pindah`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports.getRwPangkat = async (fetcher, nip) => {
  try {
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-pangkat`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports.getAllEmployees = async (fetcher, res) => {
  try {
    const result = await fetcher.get(`/master-ws/operator/full-employees`);
    return result?.data;
  } catch (error) {
    console.log(error);
  }
};

module.exports.getRwDiklat = async (fetcher, nip) => {
  try {
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-diklat`
    );

    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports.getRwJabDokter = async (fetcher, nip) => {
  try {
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-jab-dokter`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports.getRwJabGuru = async (fetcher, nip) => {
  try {
    const result = await fetcher.get(
      `/master-ws/operator/employees/${nip}/rw-jab-guru`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports.referensiJenjang = [
  {
    label: "Sekolah Dasar",
    kode_bkn: 5,
    kode_master: 1,
  },
  {
    label: "SLTP",
    kode_bkn: 10,
    kode_master: 2,
  },
  {
    label: "SLTP Kejuruan",
    kode_bkn: 12,
    kode_master: 2,
  },
  {
    label: "SLTA",
    kode_bkn: 15,
    kode_master: 3,
  },
  {
    label: "SLTA Kejuruan",
    kode_bkn: 17,
    kode_master: 3,
  },
  {
    label: "SLTA Keguruan",
    kode_bkn: 18,
    kode_master: 3,
  },
  {
    label: "Diploma I",
    kode_bkn: 20,
    kode_master: 4,
  },
  {
    label: "Diploma II",
    kode_bkn: 25,
    kode_master: 5,
  },
  {
    label: "Diploma III/Sarjana",
    kode_bkn: 30,
    kode_master: 6,
  },
  {
    label: "Diploma IV",
    kode_bkn: 35,
    kode_master: 7,
  },
  {
    label: "S-1/Sarjana",
    kode_bkn: 40,
    kode_master: 8,
  },
  {
    label: "S-2",
    kode_bkn: 45,
    kode_master: 9,
  },
  {
    label: "S-3/Doktor",
    kode_bkn: 50,
    kode_master: 10,
  },
];
