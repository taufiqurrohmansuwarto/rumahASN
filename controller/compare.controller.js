const SiasnEmployees = require("@/models/siasn-employees.model");
const SyncPegawai = require("@/models/sync-pegawai.model");
const { referensiJenjang } = require("@/utils/master.utils");
const { difference, trim, toLower, defaults, countBy, toNumber } = require("lodash");

const comparePegawai = async (req, res) => {
    try {
        const user = req.user;
        const opdId = user.organization_id;

        const employees = await SyncPegawai.query().where('skpd_id', 'ilike', `${opdId}%`);
        const nipEmployeesMaster = employees.map((employee) => employee.nip_master);
        const siasnEmployees = await SiasnEmployees.query().whereIn(
          "nip_baru",
          nipEmployeesMaster
        );
        const nipEmployeesSiasn = siasnEmployees.map(siasnEmployee => siasnEmployee.nip_baru)

        const diff = difference(nipEmployeesMaster, nipEmployeesSiasn);

        const result = employees.map((employee, index) => {
            const currentEmployees = siasnEmployees.find(siasnEmployees => siasnEmployees.nip_baru === employee.nip_master);
            const referensiJenjangId = referensiJenjang?.find(
              (item) =>
                String(item?.kode_bkn) ===
                currentEmployees?.tingkat_pendidikan_id
            );

            if (currentEmployees) {
                const { id, foto, ...allData } = employee;
    
                const namaMaster = allData?.nama_master;
                const namaSiasn = currentEmployees?.nama;
    
                const tglLahirMaster = allData?.tgl_lahir_master;
                const tglLahirSiasn = currentEmployees?.tanggal_lahir;
    
                const nipMaster = allData?.nip_master;
                const nipSiasn = currentEmployees?.nip_baru;
    
                const emailMaster = allData?.email_master;
                const emailSiasn = currentEmployees?.email;
    
                const pangkatMaster = allData?.kode_golongan_bkn;
                const pangkatSiasn = currentEmployees?.gol_akhir_id;
    
                const jenisJabatanMaster = allData?.kode_jenis_jabatan_bkn;
                const jenisJabatanSiasn = currentEmployees?.jenis_jabatan_id;
    
                const jenjangPendidikanMaster = referensiJenjangId?.kode_master;
                const jenjangPendidikanSiasn = allData?.kode_jenjang_master;

                return {
                    id: index + 1,
                    nip_master: employee.nip_master,
                  valid_nik: toNumber(currentEmployees?.is_valid_nik) == 1 ? 1 : 0,
                  nama: compareString(namaMaster, namaSiasn) ? 1 : 0,
                  nip: compareString(nipMaster, nipSiasn) ? 1 : 0,
                  tgl_lahir: compareString(tglLahirMaster, tglLahirSiasn) ? 1 : 0,
                  email: compareString(emailMaster, emailSiasn) ? 1 : 0,
                  pangkat: compareString(pangkatMaster, pangkatSiasn) ? 1 : 0,
                  jenis_jabatan: compareString(
                    jenisJabatanMaster,
                    jenisJabatanSiasn
                  )
                    ? 1
                    : 0,
                  jenjang_pendidikan: compareString(
                    jenjangPendidikanMaster,
                    jenjangPendidikanSiasn
                  )
                    ? 1
                    : 0,
                };
            } else {
                return;
            }

        });       

        const filteredNik = result.filter(r => r?.valid_nik === 0).map(i => i?.nip_master);
        const filteredNama = result
          .filter((r) => r?.nama === 0)
          .map((i) => i?.nip_master);
        const filteredNip = result.filter(r => r?.nip === 0).map(i => i?.nip_master);
        const filteredEmail = result.filter(r => r?.email === 0).map(i => i?.nip_master);
        const filteredPangkat = result
        .filter((r) => r?.pangkat === 0)
        .map((i) => i?.nip_master);
        const filteredJenisJabatan = result
          .filter((r) => r?.jenis_jabatan === 0)
          .map((i) => i?.nip_master);
        const filteredJenjangPendidikan = result
          .filter((r) => r?.jenjang_pendidikan === 0)
          .map((i) => i?.nip_master);

        res.json({
          pegawaiSimaster: employees.length,
          pegawaiSiAsn: siasnEmployees.length,
          // diff,
          result: result.length,
          nikBelumValid: filteredNik.length,
          nikBelumValidDetail: filteredNik,
          namaBelumValid: filteredNama.length,
          namaBelumValidDetail: filteredNama,
          nipBelumValid: filteredNip.length,
          nipBelumValidDetail: filteredNip,
          filteredNip: filteredNip?.length,
          filteredNipDetail: filteredNip,
          filteredEmail: filteredEmail?.length,
          filteredEmailDetail: filteredEmail,
          filteredPangkat: filteredPangkat?.length,
          filteredPangkatDetail: filteredPangkat,
          filteredJenisJabatan: filteredJenisJabatan?.length,
          filteredJenisJabatanDetail: filteredJenisJabatan,
          filteredJenjangPendidikan: filteredJenjangPendidikan?.length,
          filteredJenjangPendidikanDetail: filteredJenjangPendidikan
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({code: 400, message: 'internal server error'})
    }
}

const comparePegawaiAdmin = async (req, res) => {
  try {
    const user = req.user;
    const opdId = "123";

    const employees = await SyncPegawai.query().where(
      "skpd_id",
      "ilike",
      `${opdId}%`
    );
    const nipEmployeesMaster = employees.map((employee) => employee.nip_master);
    const siasnEmployees = await SiasnEmployees.query().whereIn(
      "nip_baru",
      nipEmployeesMaster
    );
    const nipEmployeesSiasn = siasnEmployees.map(
      (siasnEmployee) => siasnEmployee.nip_baru
    );

    const diff = difference(nipEmployeesMaster, nipEmployeesSiasn);

    const result = employees.map((employee, index) => {
      const currentEmployees = siasnEmployees.find(
        (siasnEmployees) => siasnEmployees.nip_baru === employee.nip_master
      );
      const referensiJenjangId = referensiJenjang?.find(
        (item) =>
          String(item?.kode_bkn) === currentEmployees?.tingkat_pendidikan_id
      );

      if (currentEmployees) {
        const { id, foto, ...allData } = employee;

        const namaMaster = allData?.nama_master;
        const namaSiasn = currentEmployees?.nama;

        const tglLahirMaster = allData?.tgl_lahir_master;
        const tglLahirSiasn = currentEmployees?.tanggal_lahir;

        const nipMaster = allData?.nip_master;
        const nipSiasn = currentEmployees?.nip_baru;

        const emailMaster = allData?.email_master;
        const emailSiasn = currentEmployees?.email;

        const pangkatMaster = allData?.kode_golongan_bkn;
        const pangkatSiasn = currentEmployees?.gol_akhir_id;

        const jenisJabatanMaster = allData?.kode_jenis_jabatan_bkn;
        const jenisJabatanSiasn = currentEmployees?.jenis_jabatan_id;

        const jenjangPendidikanMaster = referensiJenjangId?.kode_master;
        const jenjangPendidikanSiasn = allData?.kode_jenjang_master;

        return {
          id: index + 1,
          nip_master: employee.nip_master,
          valid_nik: toNumber(currentEmployees?.is_valid_nik) == 1 ? 1 : 0,
          nama: compareString(namaMaster, namaSiasn) ? 1 : 0,
          nip: compareString(nipMaster, nipSiasn) ? 1 : 0,
          tgl_lahir: compareString(tglLahirMaster, tglLahirSiasn) ? 1 : 0,
          email: compareString(emailMaster, emailSiasn) ? 1 : 0,
          pangkat: compareString(pangkatMaster, pangkatSiasn) ? 1 : 0,
          jenis_jabatan: compareString(jenisJabatanMaster, jenisJabatanSiasn)
            ? 1
            : 0,
          jenjang_pendidikan: compareString(
            jenjangPendidikanMaster,
            jenjangPendidikanSiasn
          )
            ? 1
            : 0,
        };
      } else {
        return;
      }
    });

    const filteredNik = result
      .filter((r) => r?.valid_nik === 0)
      .map((i) => i?.nip_master);
    const filteredNama = result
      .filter((r) => r?.nama === 0)
      .map((i) => i?.nip_master);
    const filteredNip = result
      .filter((r) => r?.nip === 0)
      .map((i) => i?.nip_master);
    const filteredEmail = result
      .filter((r) => r?.email === 0)
      .map((i) => i?.nip_master);
    const filteredPangkat = result
      .filter((r) => r?.pangkat === 0)
      .map((i) => i?.nip_master);
    const filteredJenisJabatan = result
      .filter((r) => r?.jenis_jabatan === 0)
      .map((i) => i?.nip_master);
    const filteredJenjangPendidikan = result
      .filter((r) => r?.jenjang_pendidikan === 0)
      .map((i) => i?.nip_master);
    
    const data = {
      pegawaiSimaster: employees.length,
      pegawaiSiAsn: siasnEmployees.length,
      // diff,
      result: result.length,
      nikBelumValid: filteredNik.length,
      nikBelumValidDetail: filteredNik,
      namaBelumValid: filteredNama.length,
      namaBelumValidDetail: filteredNama,
      nipBelumValid: filteredNip.length,
      nipBelumValidDetail: filteredNip,
      filteredNip: filteredNip?.length,
      filteredNipDetail: filteredNip,
      filteredEmail: filteredEmail?.length,
      filteredEmailDetail: filteredEmail,
      filteredPangkat: filteredPangkat?.length,
      filteredPangkatDetail: filteredPangkat,
      filteredJenisJabatan: filteredJenisJabatan?.length,
      filteredJenisJabatanDetail: filteredJenisJabatan,
      filteredJenjangPendidikan: filteredJenjangPendidikan?.length,
      filteredJenjangPendidikanDetail: filteredJenjangPendidikan,
    }

    console.log(data)
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "internal server error" });
  }
}

const compareString = (a, b) => {
  const text1 = trim(toLower(a));
  const text2 = trim(toLower(b));

  return text1 === text2;
};

module.exports = {comparePegawai, comparePegawaiAdmin}