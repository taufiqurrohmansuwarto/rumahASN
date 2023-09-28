// ini adalah controller khusus untuk petugas BKD dengan tab tugas saya, pertanyaan baru, semua daftar pertanyaan, dan pertanyaan belum dikategorikan
const Ticket = require("@/models/tickets.model");
const xlsx = require("xlsx");
const { convert } = require("html-to-text");

const { formatDate, checkUndefined } = require("../utils");
const { round, toNumber } = require("lodash");

const serialize = (data) => {
  return data?.map((r) => {
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
};

const downloadDataBKD = async (req, res) => {
  try {
    const { user } = req;
    const { customId } = user;

    const tabQuery = req.query.tab || "my-task";
    const status = req.query.status || "";
    const search = req.query.search || "";
    const star = req.query.star || "";
    const sub_category_id = req.query.sub_category_id || "";
    const assignee = req.query.assignee || "";

    const result = await Ticket.query()
      .select("*", Ticket.relatedQuery("comments").count().as("comments_count"))
      .withGraphFetched(
        "[admin(simpleSelect),  customer(simpleSelect), agent(simpleSelect), sub_category, sub_category.[category], priorities]"
      )
      .where((builder) => {
        if (tabQuery === "my-task") {
          builder.where("assignee", customId);
        } else if (tabQuery === "unanswered-task") {
          builder.where("status_code", "DIAJUKAN");
        } else if (tabQuery === "uncategorized-task") {
          builder.where("category_id", null);
        }
      })
      .andWhere((builder) => {
        if (status) {
          builder.where("status_code", status);
        }
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
        if (star) {
          builder.where("stars", star);
        }
        if (sub_category_id) {
          builder.where("sub_category_id", sub_category_id);
        }
        if (assignee) {
          builder.where("assignee", assignee);
        }
      })
      .orderBy("updated_at", "desc");

    const hasil = serialize(result);

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(hasil);

    xlsx.utils.book_append_sheet(wb, ws, "Report BKD");

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
    res.status(500).json({ message: "Internal server error" });
  }
};

const indexPetugasBKD = async (req, res) => {
  try {
    const { user } = req;
    const { customId } = user;

    const tabQuery = req.query.tab || "my-task";
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const status = req.query.status || "";
    const search = req.query.search || "";
    const star = req.query.star || "";
    const sub_category_id = req.query.sub_category_id || "";
    const assignee = req.query.assignee || "";

    const result = await Ticket.query()
      .select("*", Ticket.relatedQuery("comments").count().as("comments_count"))
      .withGraphFetched("[customer(simpleSelect), agent(simpleSelect)]")
      .where((builder) => {
        if (tabQuery === "my-task") {
          builder.where("assignee", customId);
        } else if (tabQuery === "unanswered-task") {
          builder.where("status_code", "DIAJUKAN");
        } else if (tabQuery === "uncategorized-task") {
          builder.where("category_id", null);
        }
      })
      .andWhere((builder) => {
        if (status) {
          builder.where("status_code", status);
        }
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
        if (star) {
          builder.where("stars", star);
        }
        if (sub_category_id) {
          builder.where("sub_category_id", sub_category_id);
        }
        if (assignee) {
          builder.where("assignee", assignee);
        }
      })
      .page(page - 1, limit)
      .orderBy("updated_at", "desc");

    res.json({
      data: result.results,
      total: result.total,
      limit: result.limit,
      page: result.page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const statistikPegawaiBKD = async (req, res) => {
  try {
    const { customId } = req.user;
    const averageRating = await Ticket.query()
      .avg("stars")
      .where("assignee", customId);

    const totalRating = await Ticket.query()
      .count("stars")
      .where("assignee", customId);

    // aggregate sub category
    const subCategory = await Ticket.query()
      .select("sub_category_id")
      .count("sub_category_id")
      .withGraphFetched("[sub_category]")
      .where("assignee", customId)
      .groupBy("sub_category_id");

    const subCategoryStatistic = subCategory.map((s) => {
      return {
        label: s?.sub_category?.name,
        value: s?.count,
      };
    });

    // aggregate status
    const status = await Ticket.query()
      .select("status_code")
      .count("status_code")
      .where("assignee", customId)
      .groupBy("status_code");

    const statusStatistic = {
      dikerjakan:
        status.find((s) => s.status_code === "DIKERJAKAN")?.count || 0,
      diajukan: status.find((s) => s.status_code === "DIAJUKAN")?.count || 0,
      selesai: status.find((s) => s.status_code === "SELESAI")?.count || 0,
    };

    res.json({
      total_rating: totalRating[0].count,
      average_rating: toNumber(round(averageRating[0].avg, 2)),
      sub_category: subCategoryStatistic,
      status: statusStatistic,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  indexPetugasBKD,
  statistikPegawaiBKD,
  downloadDataBKD,
};
