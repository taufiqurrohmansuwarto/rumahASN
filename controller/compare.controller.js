const SiasnEmployees = require("@/models/siasn-employees.model");
const SyncPegawai = require("@/models/sync-pegawai.model");
const { referensiJenjang } = require("@/utils/master.utils");
const { trim, toLower, toNumber, differenceBy } = require("lodash");

// Helper function to compare attributes
const compareAttributes = (attr1, attr2) => (attr1 === attr2 ? 1 : 0);

// Fetch employees from SyncPegawai based on skpd_id
const fetchEmployees = async (opdId) => {
  return await SyncPegawai.query().where("skpd_id", "ilike", `${opdId}%`);
};

// Fetch all SiasnEmployees
const fetchAllSiasnEmployees = async () => {
  return await SiasnEmployees.query().select("nip_baru as nip_master");
};

// Fetch SiasnEmployees that match nip_baru in nipEmployeesMaster
const fetchMatchingSiasnEmployees = async (nipEmployeesMaster) => {
  return await SiasnEmployees.query().whereIn("nip_baru", nipEmployeesMaster);
};

// Generate anomaly data
const generateAnomalies = (employees, allSiasnEmployees) => {
  const anomaliSimater = differenceBy(
    employees,
    allSiasnEmployees,
    "nip_master"
  );
  const anomaliSiasn = differenceBy(allSiasnEmployees, employees, "nip_master");
  return { anomaliSimater, anomaliSiasn };
};

// Map siasnEmployees by nip_baru
const mapSiasnEmployees = (siasnEmployees) => {
  return new Map(
    siasnEmployees.map((employee) => [employee.nip_baru, employee])
  );
};

// Compare employee data and generate result
const compareEmployees = (employees, siasnEmployeeMap, referensiJenjang) => {
  return employees
    .map((employee, index) => {
      const currentEmployees = siasnEmployeeMap.get(employee.nip_master);
      if (!currentEmployees) return null;

      const referensiJenjangId = referensiJenjang?.find(
        (item) =>
          String(item?.kode_bkn) === currentEmployees?.tingkat_pendidikan_id
      );

      const { id, foto, ...allData } = employee;
      return {
        id: index + 1,
        nip_master: employee.nip_master,
        valid_nik: toNumber(currentEmployees?.is_valid_nik) === 1 ? 1 : 0,
        nama: compareAttributes(allData?.nama_master, currentEmployees?.nama),
        nip: compareAttributes(allData?.nip_master, currentEmployees?.nip_baru),
        tgl_lahir: compareAttributes(
          allData?.tgl_lahir_master,
          currentEmployees?.tanggal_lahir
        ),
        email: compareAttributes(
          allData?.email_master,
          currentEmployees?.email
        ),
        pangkat: compareAttributes(
          allData?.kode_golongan_bkn,
          currentEmployees?.gol_akhir_id
        ),
        jenis_jabatan: compareAttributes(
          allData?.kode_jenis_jabatan_bkn,
          currentEmployees?.jenis_jabatan_id
        ),
        jenjang_pendidikan: compareAttributes(
          referensiJenjangId?.kode_master,
          allData?.kode_jenjang_master
        ),
        jenjang_jabatan: compareAttributes(),
      };
    })
    .filter(Boolean);
};

// Filter results based on a key
const filterResults = (result, key) => {
  return result.filter((r) => r[key] === 0).map((i) => i?.nip_master);
};

const comparePegawai = async (req, res) => {
  try {
    const user = req.user;
    const opdId = user.organization_id;

    // Fetch all employees from SyncPegawai with the given skpd_id
    const employees = await SyncPegawai.query().where(
      "skpd_id",
      "ilike",
      `${opdId}%`
    );
    const nipEmployeesMaster = employees.map((employee) => employee.nip_master);

    // Fetch SiasnEmployees that match nip_baru in nipEmployeesMaster
    const siasnEmployees = await SiasnEmployees.query().whereIn(
      "nip_baru",
      nipEmployeesMaster
    );
    const siasnEmployeeMap = new Map(
      siasnEmployees.map((employee) => [employee.nip_baru, employee])
    );

    // Calculate differences and prepare result
    const result = employees
      .map((employee, index) => {
        const currentEmployees = siasnEmployeeMap.get(employee.nip_master);
        if (!currentEmployees) return null;

        const referensiJenjangId = referensiJenjang?.find(
          (item) =>
            String(item?.kode_bkn) === currentEmployees?.tingkat_pendidikan_id
        );

        const { id, foto, ...allData } = employee;
        return {
          id: index + 1,
          nip_master: employee.nip_master,
          valid_nik: toNumber(currentEmployees?.is_valid_nik) === 1 ? 1 : 0,
          nama: compareString(allData?.nama_master, currentEmployees?.nama)
            ? 1
            : 0,
          nip: compareString(allData?.nip_master, currentEmployees?.nip_baru)
            ? 1
            : 0,
          tgl_lahir: compareString(
            allData?.tgl_lahir_master,
            currentEmployees?.tanggal_lahir
          )
            ? 1
            : 0,
          email: compareString(allData?.email_master, currentEmployees?.email)
            ? 1
            : 0,
          pangkat: compareString(
            allData?.kode_golongan_bkn,
            currentEmployees?.gol_akhir_id
          )
            ? 1
            : 0,
          jenis_jabatan: compareString(
            allData?.kode_jenis_jabatan_bkn,
            currentEmployees?.jenis_jabatan_id
          )
            ? 1
            : 0,
          jenjang_pendidikan: compareString(
            referensiJenjangId?.kode_master,
            allData?.kode_jenjang_master
          )
            ? 1
            : 0,
        };
      })
      .filter(Boolean);

    const filteredResults = (key) =>
      result.filter((r) => r[key] === 0).map((i) => i?.nip_master);

    res.json({
      pegawaiSimaster: employees.length,
      pegawaiSiAsn: siasnEmployees.length,
      result: result.length,
      nikBelumValid: filteredResults("valid_nik").length,
      nikBelumValidDetail: filteredResults("valid_nik"),
      namaBelumValid: filteredResults("nama").length,
      namaBelumValidDetail: filteredResults("nama"),
      nipBelumValid: filteredResults("nip").length,
      nipBelumValidDetail: filteredResults("nip"),
      filteredEmail: filteredResults("email").length,
      filteredEmailDetail: filteredResults("email"),
      filteredPangkat: filteredResults("pangkat").length,
      filteredPangkatDetail: filteredResults("pangkat"),
      filteredJenisJabatan: filteredResults("jenis_jabatan").length,
      filteredJenisJabatanDetail: filteredResults("jenis_jabatan"),
      filteredJenjangPendidikan: filteredResults("jenjang_pendidikan").length,
      filteredJenjangPendidikanDetail: filteredResults("jenjang_pendidikan"),
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "internal server error" });
  }
};

const comparePegawaiAdmin = async (req, res) => {
  try {
    const opdId = "1";

    const employees = await fetchEmployees(opdId);
    const nipEmployeesMaster = employees.map((employee) => employee.nip_master);

    const allSiasnEmployees = await fetchAllSiasnEmployees();
    const { anomaliSimater, anomaliSiasn } = generateAnomalies(
      employees,
      allSiasnEmployees
    );

    const siasnEmployees = await fetchMatchingSiasnEmployees(
      nipEmployeesMaster
    );
    const siasnEmployeeMap = mapSiasnEmployees(siasnEmployees);

    const result = compareEmployees(
      employees,
      siasnEmployeeMap,
      referensiJenjang
    );

    const data = {
      anomaliSimater: anomaliSimater.length,
      detailAnomaliSimater: anomaliSimater.map((item) => item?.nip_master),
      anomaliSiasn: anomaliSiasn.length,
      detailAnomaliSiasn: anomaliSiasn.map((item) => item?.nip_master),
      totalPegawaiSimaster: employees.length,
      totalPegawaiSIASN: allSiasnEmployees.length,
      result: result.length,
      nikBelumValid: filterResults(result, "valid_nik").length,
      nikBelumValidDetail: filterResults(result, "valid_nik"),
      namaBelumValid: filterResults(result, "nama").length,
      namaBelumValidDetail: filterResults(result, "nama"),
      nipBelumValid: filterResults(result, "nip").length,
      nipBelumValidDetail: filterResults(result, "nip"),
      filteredEmail: filterResults(result, "email").length,
      filteredEmailDetail: filterResults(result, "email"),
      filteredPangkat: filterResults(result, "pangkat").length,
      filteredPangkatDetail: filterResults(result, "pangkat"),
      filteredJenisJabatan: filterResults(result, "jenis_jabatan").length,
      filteredJenisJabatanDetail: filterResults(result, "jenis_jabatan"),
      filteredJenjangPendidikan: filterResults(result, "jenjang_pendidikan")
        .length,
      filteredJenjangPendidikanDetail: filterResults(
        result,
        "jenjang_pendidikan"
      ),
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "internal server error" });
  }
};

const compareString = (a, b) => {
  const text1 = trim(toLower(a));
  const text2 = trim(toLower(b));

  return text1 === text2;
};

module.exports = { comparePegawai, comparePegawaiAdmin };
