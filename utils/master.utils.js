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
