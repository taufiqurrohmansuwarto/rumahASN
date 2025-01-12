const SiasnEmployees = require("@/models/siasn-employees.model");
const SyncPegawai = require("@/models/sync-pegawai.model");
const { compareText } = require("@/utils/client-utils");
const { referensiJenjang } = require("@/utils/master.utils");
const { createRedisInstance } = require("@/utils/redis");
const { trim, toLower, toNumber, differenceBy, round } = require("lodash");

const normalizeString = (str) => {
  const castToString = String(str);
  return castToString
    ?.trim()
    .toUpperCase()
    .replace(/'/g, "`")
    .replace(/\s+/g, " "); // Mengganti spasi berturut-turut dengan satu spasi;
};

// Helper function to compare attributes
const compareAttributes = (attr1, attr2) => {
  const str1 = normalizeString(attr1);
  const str2 = normalizeString(attr2);
  return str1 === str2 ? 1 : 0;
};

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
        nama_master: currentEmployees?.nama,
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
        jenis_jabatan:
          allData?.status_master === "PPPK"
            ? 1
            : compareAttributes(
                allData?.kode_jenis_jabatan_bkn,
                currentEmployees?.jenis_jabatan_id
              ),
        jenjang_pendidikan: compareAttributes(
          toNumber(referensiJenjangId?.kode_master),
          toNumber(allData?.kode_jenjang_master)
        ),
      };
    })
    .filter(Boolean);
};

// Filter results based on a key
const filterResults = (result, key) => {
  return result.filter((r) => r[key] === 0);
  // .map((i) => ({
  //   nip: i?.nip_master,
  //   nama: i?.nama,
  //   foto: i?.foto,
  // }));
};

const comparePegawai = async (req, res) => {
  try {
    const user = req.user;
    const opdId = user.organization_id;

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
      totalPegawaiSimaster: employees.length,
      grafik: [
        {
          type: "NIK Belum Valid",
          value: filterResults(result, "valid_nik").length,
          detail: filterResults(result, "valid_nik"),
          description: "Belum melakukan aktivasi / verifikasi NIK di MyASN",
          presentase: round(
            filterResults(result, "valid_nik").length / employees.length || 0,
            2
          ),
        },
        {
          type: "Perbedaan Nama",
          value: filterResults(result, "nama").length,
          description:
            "Terjadi ketidak sesuaian nama antara data SIMASTER dan SIASN",
          detail: filterResults(result, "nama"),
          presentase: round(
            filterResults(result, "nama").length / employees.length || 0,
            2
          ),
        },
        {
          type: "Perbedaan NIP",
          description:
            "Terjadi ketidak sesuaian NIP antara data SIMASTER dan SIASN",
          value: filterResults(result, "nip").length,
          detail: filterResults(result, "nip"),
          presentase: round(
            filterResults(result, "nip").length / employees.length || 0,
            2
          ),
        },
        {
          type: "Perbedaan Email",
          description:
            "Terjadi ketidak sesuaian email antara data SIMASTER dan SIASN",
          value: filterResults(result, "email").length,
          detail: filterResults(result, "email"),
          presentase: round(
            filterResults(result, "email").length / employees.length || 0,
            2
          ),
        },
        {
          type: "Perbedaan Pangkat",
          description:
            "Terjadi ketidak sesuaian pangkat antara data SIMASTER dan SIASN",
          value: filterResults(result, "pangkat").length,
          detail: filterResults(result, "pangkat"),
          presentase: round(
            filterResults(result, "pangkat").length / employees.length || 0,
            2
          ),
        },
        {
          type: "Perbedaan Jenis Jabatan",
          description:
            "Terjadi ketidak sesuaian jenis jabatan antara data SIMASTER dan SIASN",
          value: filterResults(result, "jenis_jabatan").length,
          detail: filterResults(result, "jenis_jabatan"),
          presentase: round(
            filterResults(result, "jenis_jabatan").length / employees.length ||
              0,
            2
          ),
        },
        {
          type: "Perbedaan Jenjang Pendidikan",
          description:
            "Terjadi ketidak sesuaian jenjang pendidikan antara data SIMASTER dan SIASN",
          value: filterResults(result, "jenjang_pendidikan").length,
          detail: filterResults(result, "jenjang_pendidikan"),
          presentase: round(
            filterResults(result, "jenjang_pendidikan").length /
              employees.length || 0,
            2
          ),
        },
      ],
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "internal server error" });
  }
};

const comparePegawaiAdmin = async (req, res) => {
  try {
    const opdId = "1";
    const redis = await createRedisInstance();
    const cachedData = await redis.get(`compare-pegawai-${opdId}`);

    if (cachedData) {
      res.json(JSON.parse(cachedData));
    } else {
      const employees = await fetchEmployees(opdId);
      const nipEmployeesMaster = employees.map(
        (employee) => employee.nip_master
      );

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
        grafik: [
          {
            type: "NIK Belum Valid",
            value: filterResults(result, "valid_nik").length,
            detail: filterResults(result, "valid_nik"),
            description: "Belum melakukan aktivasi / verifikasi NIK di MyASN",
            presentase: round(
              filterResults(result, "valid_nik").length / employees.length || 0,
              2
            ),
          },
          {
            type: "Perbedaan Nama",
            value: filterResults(result, "nama").length,
            description:
              "Terjadi ketidak sesuaian nama antara data SIMASTER dan SIASN",
            detail: filterResults(result, "nama"),
            presentase: round(
              filterResults(result, "nama").length / employees.length || 0,
              2
            ),
          },
          {
            type: "Perbedaan NIP",
            description:
              "Terjadi ketidak sesuaian NIP antara data SIMASTER dan SIASN",
            value: filterResults(result, "nip").length,
            detail: filterResults(result, "nip"),
            presentase: round(
              filterResults(result, "nip").length / employees.length || 0,
              2
            ),
          },
          {
            type: "Perbedaan Email",
            description:
              "Terjadi ketidak sesuaian email antara data SIMASTER dan SIASN",
            value: filterResults(result, "email").length,
            detail: filterResults(result, "email"),
            presentase: round(
              filterResults(result, "email").length / employees.length || 0,
              2
            ),
          },
          {
            type: "Perbedaan Pangkat",
            description:
              "Terjadi ketidak sesuaian pangkat antara data SIMASTER dan SIASN",
            value: filterResults(result, "pangkat").length,
            detail: filterResults(result, "pangkat"),
            presentase: round(
              filterResults(result, "pangkat").length / employees.length || 0,
              2
            ),
          },
          {
            type: "Perbedaan Jenis Jabatan",
            description:
              "Terjadi ketidak sesuaian jenis jabatan antara data SIMASTER dan SIASN",
            value: filterResults(result, "jenis_jabatan").length,
            detail: filterResults(result, "jenis_jabatan"),
            presentase: round(
              filterResults(result, "jenis_jabatan").length /
                employees.length || 0,
              2
            ),
          },
          {
            type: "Perbedaan Jenjang Pendidikan",
            description:
              "Terjadi ketidak sesuaian jenjang pendidikan antara data SIMASTER dan SIASN",
            value: filterResults(result, "jenjang_pendidikan").length,
            detail: filterResults(result, "jenjang_pendidikan"),
            presentase: round(
              filterResults(result, "jenjang_pendidikan").length /
                employees.length || 0,
              2
            ),
          },
        ],
      };

      await redis.set(`compare-pegawai-${opdId}`, JSON.stringify(data));

      res.json(data);
    }
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
