import {
  getDataUtamaMaster,
  getRwPasangan,
  getRwPendidikanMaster,
  getRwPangkat,
  getRwDiklat,
  getRwKedudukanHukum,
} from "./master.utils";

export const cachedDataPegawai = async (
  masterFetcher,
  siasnFetcher,
  employeeNumber
) => {
  const master_data_utama = await getDataUtamaMaster(
    masterFetcher,
    employeeNumber
  );

  const { data: master_rw_pendidikan } = await getRwPendidikanMaster(
    masterFetcher,
    employeeNumber
  );

  const { data: master_rw_pasangan } = await getRwPasangan(
    masterFetcher,
    employeeNumber
  );

  //   get rw pangkat
  const { data: master_rw_pangkat } = await getRwPangkat(
    masterFetcher,
    employeeNumber
  );

  const { data: master_rw_kedudukan_hukum } = await getRwKedudukanHukum(
    masterFetcher,
    employeeNumber
  );

  const { data: master_rw_diklat } = await getRwDiklat(
    masterFetcher,
    employeeNumber
  );

  //   get rw diklat
  //   get rw jabatan dokter
  //   get rw jabatan
  //   get rw pindah
  //    get rw hukdis
  //   get rw anak
  //   get rw-skp
  //  get rw-jab-guru

  return {
    simaster: {
      master_data_utama,
      master_rw_pendidikan,
      master_rw_pasangan,
      master_rw_pangkat,
      master_rw_kedudukan_hukum,
      master_rw_diklat,
    },
  };
};
