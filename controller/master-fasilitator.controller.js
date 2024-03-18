const { getAllEmployees } = require("@/utils/master.utils");
const Anomali23 = require("@/models/anomali23.model");
const SiasnIPASN = require("@/models/siasn-ipasn.model");
const SiasnEmployees = require("@/models/siasn-employees.model");
const xlsx = require("xlsx");
const { toLower, trim } = require("lodash");

const compareText = (a, b) => {
  const text1 = trim(toLower(a));
  const text2 = trim(toLower(b));

  return text1 === text2 ? "Benar" : "Salah";
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

const getAllEmployeesMaster = async (req, res) => {
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

      const employees = await SiasnEmployees.query().whereIn("nip_baru", nip);

      const hasil = result?.data?.map((item, idx) => {
        const currentEmployees = employees?.find(
          (employee) => employee?.nip_baru === item?.nip_master
        );

        const { id, ...allData } = item;

        return {
          no: idx + 1,
          nama_simaster: allData?.nama_master,
          nama_siasn: currentEmployees?.nama,
          hasil_nama: compareText(allData?.nama_master, currentEmployees?.nama),
          nip_simaster: allData?.nip_master,
          nip_siasn: currentEmployees?.nip_baru,
          hasil_nip: compareText(
            allData?.nip_master,
            currentEmployees?.nip_baru
          ),
          gelar_depan_simaster: allData?.gelar_depan_master,
          gelar_depan_siasn: currentEmployees?.gelar_depan,
          gelar_belakang_simaster: allData?.gelar_belakang_master,
          gelar_belakang_siasn: currentEmployees?.gelar_belakang,
          jenjang_pendidikan_simaster: allData?.jenjang_master,
          jenjang_pendidikan_siasn: currentEmployees?.tingkat_pendidikan_nama,
          golongan_simaster: allData?.golongan_master,
          golongan_siasn: currentEmployees?.gol_akhir_nama,
          jabatan_simaster: allData?.jabatan_master,
          jabatan_siasn: currentEmployees?.jabatan_nama,
          validasi_nik: currentEmployees?.is_valid_nik,
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
    }
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

module.exports = {
  getAllEmployeesMaster,
  getAllEmployeesAnomali23Report,
  getIPAsnReport,
};
