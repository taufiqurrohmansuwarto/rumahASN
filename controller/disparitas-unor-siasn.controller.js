const DisparitasUnor = require("@/models/disparitas-unor.model");
const RefSiasnUnor = require("@/models/ref-siasn-unor.model");
const { getResultPerangkatDaerahXls } = require("@/utils/query-utils");
const XLSX = require("xlsx");

const detailDisparitasUnor = async (req, res) => {
  try {
    const { id } = req?.query;

    const data = await DisparitasUnor.query().findById(id);

    res.status(200).json({
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const updateDisparitasUnor = async (req, res) => {
  try {
    const { id } = req?.query;
    const data = req?.body;

    // upsert
    await DisparitasUnor.query()
      .insert({
        ...data,
        id,
      })
      .onConflict("id")
      .merge();

    res.status(200).json({
      message: "Data berhasil disimpan",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const disparitasReportXls = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await getResultPerangkatDaerahXls(id);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(result);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "disparitas_unor_siasn.xlsx"
    );

    res.end(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  updateDisparitasUnor,
  detailDisparitasUnor,
  disparitasReportXls,
};
