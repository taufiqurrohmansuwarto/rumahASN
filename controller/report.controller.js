// todo create report to admin using excel
const Tickets = require("../models/tickets.model");
const xlsx = require("xlsx");
const { formatDate, checkUndefined } = require("../utils");
const { convert } = require("html-to-text");

const excelReport = async (req, res) => {
  try {
    const result = await Tickets.query().withGraphFetched(
      "[admin(simpleSelect),  customer(simpleSelect), agent(simpleSelect), sub_category, sub_category.[category], priorities]"
    );

    const serialize = result?.map((r) => {
      return {
        nomer_tiket: r?.ticket_number,
        judul: r?.title,
        status: r?.status_code,
        deskripsi: convert(r?.content, {
          wordwrap: 130,
        }),
        berasal_dari: checkUndefined(r?.customer?.group),
        employee_number: checkUndefined(r?.customer?.employee_number),
        pembuat: r?.customer?.username,
        tgl_dibuat: formatDate(r?.created_at),
        admin: checkUndefined(r?.admin?.username),
        sub_kategori: checkUndefined(r?.sub_category?.name),
        kategory: checkUndefined(r?.sub_category?.category?.name),
        kode_satuan_kerja: checkUndefined(
          r?.sub_category?.category?.satuan_kerja?.label
        ),
        prioritas: checkUndefined(r?.priorities?.name),
        agent: checkUndefined(r?.agent?.username),
        tgl_agent_ditugaskan: r?.chooser_picked_at
          ? formatDate(r?.chooser_picked_at)
          : "-",
        tgl_agent_dikerjakan: r?.start_work_at
          ? formatDate(r?.start_work_at)
          : "-",
        tgl_agent_selesai: r?.completed_at ? formatDate(r?.completed_at) : "-",
        rating: checkUndefined(r?.stars),
        komen_rating: checkUndefined(r?.requester_comment),
        solusi: checkUndefined(r?.assignee_reason),
      };
    });

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(serialize);

    xlsx.utils.book_append_sheet(wb, ws, "Report");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "report.xlsx"
    );

    res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const questionReport = async (req, res) => {
  try {
    const query = req.query;
  } catch (error) {}
};

module.exports = {
  excelReport,
};
