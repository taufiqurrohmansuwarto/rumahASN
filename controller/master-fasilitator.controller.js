const { getAllEmployees, referensiJenjang } = require("@/utils/master.utils");
const Anomali23 = require("@/models/anomali23.model");
const SiasnIPASN = require("@/models/siasn-ipasn.model");
const SiasnEmployees = require("@/models/siasn-employees.model");
const xlsx = require("xlsx");
const queryString = require("query-string");
const { toLower, trim } = require("lodash");
const { dataUtama } = require("@/utils/siasn-utils");
const arrayToTree = require("array-to-tree");
const { proxyDataUtamaASN } = require("@/utils/siasn-proxy.utils");
const { createRedisInstance } = require("@/utils/redis");

// keperluan komparasi
const validateOpdId = (opdId) => {
  if (!opdId) {
    throw new Error("Organization ID is required");
  }
};

const determineOpdId = (opd, opdId) => {
  const regex = new RegExp(`^${opd}`);
  return opd === opdId || regex.test(opdId) ? opdId : opd;
};

// helper function to fetch employee paging data
const fetchEmployeeData = (fetcher, idOpd, query) => {
  const queryStringParameters = queryString.stringify(query, {
    skipEmptyString: true,
    skipNull: true,
  });
  return fetcher.get(
    `/master-ws/pemprov/opd/${idOpd}/employees/paging?${queryStringParameters}`
  );
};

// Helper function to fetch detailed employee data asynchronously using Promise.allSettled
const fetchDetailedEmployeeData = async (siasnFetcher, nips) => {
  const promises = nips.map((nip) => dataUtama(siasnFetcher, nip));
  const results = await Promise.allSettled(promises);

  // Process results, considering both fulfilled and rejected promises
  return results.map((result) =>
    result.status === "fulfilled" ? result.value : {}
  );
};

// Helper function to construct the response payload
const constructResponsePayload = (employeeData, detailedEmployeeData) => {
  const results = employeeData?.data?.results?.map((item, idx) => {
    const currentEmployees = detailedEmployeeData[idx]; // Handle null values appropriately in your logic
    // Continue with your logic to construct the employee object
    // ...

    const referensiJenjangId = referensiJenjang?.find(
      (item) =>
        String(item?.kode_bkn) === currentEmployees?.tkPendidikanTerakhirId
    );

    return {
      // Constructed object based on your requirements
      ...item,
      komparasi: {
        nama: compareString(item?.nama_master, currentEmployees?.nama),
        nip: compareString(item?.nip_master, currentEmployees?.nipBaru),
        tanggal_lahir: compareString(
          item?.tgl_lahir_master,
          currentEmployees?.tglLahir
        ),
        email: compareString(item?.email_master, currentEmployees?.email),
        pangkat: compareString(
          String(item?.kode_golongan_bkn),
          String(currentEmployees?.golRuangAkhirId)
        ),
        pendidikan: compareString(
          referensiJenjangId?.kode_master,
          item?.kode_jenjang_master
        ),
        jenis_jabatan: compareString(
          item?.kode_jenis_jabatan_bkn,
          currentEmployees?.jenisJabatanId
        ),
        jenjang_jabatan: compareString(
          item?.jabatan_asn,
          currentEmployees?.asnJenjangJabatan
        ),
      },
      siasn: {
        nama: currentEmployees?.nama,
        status: currentEmployees?.kedudukanPnsNama,
        jenjang_jabatan: currentEmployees?.asnJenjangJabatan,
        nip_baru: currentEmployees?.nipBaru,
        gelar_depan: currentEmployees?.gelarDepan,
        gelar_belakang: currentEmployees?.gelarBelakang,
        pangkat: currentEmployees?.golRuangAkhir,
        kode_pangkat: currentEmployees?.golRuangAkhirId,
        jenis_jabatan: currentEmployees?.asnJenjangJabatan,
        kode_jenis_jabatan: currentEmployees?.jenisJabatanId,
        nama_jabatan: currentEmployees?.jabatanNama,
        kode_jenjang: currentEmployees?.tkPendidikanTerakhirId,
        jenjang: currentEmployees?.pendidikanTerakhirNama,
        unor: `${currentEmployees?.unorIndukNama} - ${currentEmployees?.unorNama}`,
        valid_nik: currentEmployees?.validNik,
      },
    };
  });

  return {
    results,
    total: employeeData?.data?.total,
    meta: {
      page: employeeData?.data?.meta?.page,
      limit: employeeData?.data?.meta?.limit,
      total_page: employeeData?.data?.total,
    },
  };
};

const compareText = (a, b) => {
  const text1 = trim(toLower(a));
  const text2 = trim(toLower(b));

  return text1 === text2 ? "Benar" : "Salah";
};

const compareString = (a, b) => {
  const text1 = trim(toLower(a));
  const text2 = trim(toLower(b));

  return text1 === text2;
};

function calculateMaxWidthOfColumns(data) {
  // Initial width for each column
  const maxWidths = [];

  // Iterate over each row of data
  data.forEach((row) => {
    Object.keys(row).forEach((key, index) => {
      // Get the width of the current cell's content
      const contentWidth = (row[key] || "").toString().length;

      // Update maxWidths array if this cell is wider than the current max
      maxWidths[index] = Math.max(maxWidths[index] || 0, contentWidth);
    });
  });

  return maxWidths;
}

const getAllEmployeesFullDownload = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const result = await fetcher.get(`/master-ws/pemprov/opd/1/employees`);

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(result?.data);

    xlsx.utils.book_append_sheet(wb, ws, "data semua");
    xlsx.writeFile(wb, "rekap-full.xlsx");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "rekap-full.xlsx"
    );
    res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllEmployeesMaster = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const opdId = req?.user?.organization_id;
    const currentRole = req?.user?.current_role;

    const organizationId = req?.query?.organizationId || opdId;
    const idOpd = determineOpdId(organizationId, opdId);

    if (!opdId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const result = await fetcher.get(
      `/master-ws/pemprov/opd/${idOpd}/employees`
    );
    const nip = result?.data?.map((item) => item?.nip_master);
    const employees = await SiasnEmployees.query().whereIn("nip_baru", nip);

    const hasil = result?.data?.map((item, idx) => {
      const currentEmployees = employees?.find(
        (employee) => employee?.nip_baru === item?.nip_master
      );
      const referensiJenjangId = referensiJenjang?.find(
        (item) =>
          String(item?.kode_bkn) === currentEmployees?.tingkat_pendidikan_id
      );
      const { id, foto, ...allData } = item;

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
        no: idx + 1,
        ...allData,
        nama_siasn: currentEmployees?.nama,
        nip_siasn: currentEmployees?.nip_baru,
        gelar_depan_siasn: currentEmployees?.gelar_depan,
        gelar_belakang_siasn: currentEmployees?.gelar_belakang,
        jenjang_pendidikan_siasn: currentEmployees?.tingkat_pendidikan_nama,
        golongan_siasn: currentEmployees?.gol_akhir_nama,
        jabatan_siasn: currentEmployees?.jabatan_nama,
        unor_siasn: currentEmployees?.unor_nama,
        valid_nik: currentEmployees?.is_valid_nik,
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
        jenis_jabatan: compareString(jenisJabatanMaster, jenisJabatanSiasn)
          ? 1
          : 0,
      };
    });

    const maxWidths = calculateMaxWidthOfColumns(hasil);
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(hasil);
    ws["!cols"] = maxWidths.map((w) => ({ wch: w + 2 }));

    xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
    xlsx.writeFile(wb, "ipasn.xlsx");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "ipasn.xlsx"
    );
    res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getIPAsnReport = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const opdId = req?.user?.organization_id;

    if (!opdId) {
      res.status(400).json({ message: "Organization ID is required" });
    } else {
      const result = await fetcher.get(
        `/master-ws/pemprov/opd/${opdId}/employees`
      );

      const nip = result?.data?.map((item) => item?.nip_master);

      const siasnIPASN = await SiasnIPASN.query().whereIn("nip", nip);

      const hasil = result?.data?.map((item, idx) => {
        const ipasn = siasnIPASN?.find(
          (ipasn) => ipasn?.nip === item?.nip_master
        );

        const { id, ...allData } = item;

        return {
          no: idx + 1,
          ...allData,
          ipasn_kualifikasi: ipasn?.kualifikasi,
          ip_asn_keterangan_kualifikasi: ipasn?.keterangan_kualifikasi,
          // kompetensi
          ipasn_kompetensi: ipasn?.kompetensi,
          ip_asn_keterangan_kompetensi: ipasn?.keterangan_kompetensi,
          // kinerja
          ipasn_kinerja: ipasn?.kinerja,
          ip_asn_keterangan_kinerja: ipasn?.keterangan_kinerja,
          // disiplin
          ipasn_disiplin: ipasn?.disiplin,
          ip_asn_keterangan_disiplin: ipasn?.keterangan_disiplin,
          // total
          // tahun
          // updated
          ipasn_total: ipasn?.total,
          ipasn_tahun: ipasn?.tahun,
          ipasn_updated: ipasn?.updated,
        };
      });

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(hasil);

      xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

      xlsx.writeFile(wb, "ipasn.xlsx");

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "ipasn.xlsx"
      );

      res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllEmployeesAnomali23Report = async (req, res) => {
  try {
    const result = await getAllEmployees(req.fetcher);

    const nip = result.map((item) => item.nip_baru);

    const data = await Anomali23.query()
      .whereIn("nip_baru", nip)
      .andWhere("is_repaired", false);

    const hasil = result?.map((item) => {
      const anomali = data?.filter(
        (anomali) => anomali?.nip_baru === item?.nip_baru
      );

      return {
        nama: item?.nama,
        nip: item?.nip_baru,
        skpd: item?.skpd,
        daftar_anomali: anomali
          ?.map((item) => item?.jenis_anomali_nama)
          ?.join(", "),
      };
    });

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(hasil);

    xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

    xlsx.writeFile(wb, "anomali23.xlsx");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "anomali23.xlsx"
    );

    res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllEmployeesMasterPaging = async (req, res) => {
  try {
    const {
      clientCredentialsFetcher: fetcher,
      fetcher: proxyFetcher,
      siasnRequest: siasnFetcher,
      user,
      query,
    } = req;
    const opdId = user?.organization_id;
    const opd = query?.opd_id || opdId;

    validateOpdId(opdId);
    const idOpd = determineOpdId(opd, opdId);
    const employeeData = await fetchEmployeeData(fetcher, idOpd, {
      ...query,
      limit: 5,
    });

    const nips = employeeData?.data?.results?.map((item) => item?.nip_master);
    const detailedEmployeeData = await fetchDetailedEmployeeData(
      siasnFetcher,
      nips
    );

    const responsePayload = constructResponsePayload(
      employeeData,
      detailedEmployeeData
    );

    res.json(responsePayload);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllEmployeesMasterPagingAdmin = async (req, res) => {
  try {
    const {
      clientCredentialsFetcher: fetcher,
      siasnRequest: siasnFetcher,
      fetcher: proxyFetcher,
      query,
    } = req;
    const opdId = "1";
    const opd = query?.opd_id || opdId;

    validateOpdId(opdId);
    const idOpd = determineOpdId(opd, opdId);
    const redis = await createRedisInstance();
    // query ada search, page, limit. Jadikan key redis
    const redisKey = `master-fasilitator:${idOpd}:${query?.search}:${query?.page}:${query?.limit}`;
    const cachedData = await redis.get(redisKey);

    if (cachedData) {
      res.json(JSON.parse(cachedData));
    } else {
      const employeeData = await fetchEmployeeData(fetcher, idOpd, {
        ...query,
        limit: 5,
      });

      const nips = employeeData?.data?.results?.map((item) => item?.nip_master);
      const detailedEmployeeData = await fetchDetailedEmployeeData(
        siasnFetcher,
        nips
      );

      const responsePayload = constructResponsePayload(
        employeeData,
        detailedEmployeeData
      );

      // 45 seconds
      await redis.set(redisKey, JSON.stringify(responsePayload), "EX", 30);

      res.json(responsePayload);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOpd = async (req, res) => {
  try {
    const currentRole = req?.user?.current_role;
    const admin = currentRole === "admin";

    const fetcher = req?.clientCredentialsFetcher;
    const opdId = admin ? "1" : req?.user?.organization_id;

    if (!opdId) {
      res.status(400).json({ message: "Organization ID is required" });
    } else {
      const result = await fetcher.get(
        `/master-ws/pemprov/opd/${opdId}/departments`
      );

      const hasil = result?.data?.map((d) => ({
        id: d.id,
        pId: d.pId,
        title: d.name,
        key: d.id,
        label: d.name,
        value: d.id,
      }));

      const treeData = arrayToTree(hasil, {
        parentProperty: "pId",
        customID: "id",
      });
      res.json(treeData);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOpdAdmin = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const opdId = "1";

    if (!opdId) {
      res.status(400).json({ message: "Organization ID is required" });
    } else {
      const result = await fetcher.get(
        `/master-ws/pemprov/opd/${opdId}/departments`
      );

      const hasil = result?.data?.map((d) => ({
        id: d.id,
        pId: d.pId,
        title: d.name,
        key: d.id,
        label: d.name,
        value: d.id,
      }));

      const treeData = arrayToTree(hasil, {
        parentProperty: "pId",
        customID: "id",
      });
      res.json(treeData);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllEmployeeReportAdmin = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const opdId = "1";

    const result = await fetcher.get(
      `/master-ws/pemprov/opd/${opdId}/employees`
    );
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllEmployeeReportAdmin,
  getAllEmployeesMaster,
  getAllEmployeesAnomali23Report,
  getIPAsnReport,
  getOpd,
  getAllEmployeesMasterPaging,
  getAllEmployeesMasterPagingAdmin,
  getOpdAdmin,
  getAllEmployeesFullDownload,
};
