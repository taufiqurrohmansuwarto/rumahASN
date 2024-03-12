const { getAllEmployees } = require("@/utils/master.utils");
const Anomali23 = require("@/models/anomali23.model");
const SiasnIPASN = require("@/models/siasn-ipasn.model");
const xlsx = require("xlsx");

const getAllEmployeesMaster = async (req, res) => {
  try {
    const result = await getAllEmployees(req.fetcher);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getIPAsnReport = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const opdId = req?.user?.organization_id;

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
        // kompetensi
        ipasn_kompetensi: ipasn?.kompetensi,
        // kinerja
        ipasn_kinerja: ipasn?.kinerja,
        // disiplin
        ipasn_disiplin: ipasn?.disiplin,
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
