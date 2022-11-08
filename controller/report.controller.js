// todo create report to admin using excel
const xlsx = require("xlsx");
const Tickets = require("../models/tickets.model");

const adminReportController = async (req, res) => {
  try {
    const result = await Tickets.query();
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(result);

    xlsx.utils.book_append_sheet(wb, ws, "Report");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "report.xlsx"
    );

    return res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  adminReportController,
};
