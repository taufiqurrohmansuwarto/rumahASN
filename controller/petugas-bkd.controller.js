// ini adalah controller khusus untuk petugas BKD dengan tab tugas saya, pertanyaan baru, semua daftar pertanyaan, dan pertanyaan belum dikategorikan
const Ticket = require("@/models/tickets.model");

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

    // aggregate sub category
    const subCategory = await Ticket.query()
      .select("sub_category_id")
      .count("sub_category_id")
      .withGraphFetched("[sub_category]")
      .where("assignee", customId)
      .groupBy("sub_category_id");

    // aggregate status
    const status = await Ticket.query()
      .select("status_code")
      .count("status_code")
      .where("assignee", customId)
      .groupBy("status_code");

    res.json({
      averageRating: averageRating[0].avg,
      subCategory,
      status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  indexPetugasBKD,
  statistikPegawaiBKD,
};
