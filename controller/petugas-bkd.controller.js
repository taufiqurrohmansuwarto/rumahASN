// ini adalah controller khusus untuk petugas BKD dengan tab tugas saya, pertanyaan baru, semua daftar pertanyaan, dan pertanyaan belum dikategorikan
const Ticket = require("@/models/tickets.model");

const indexPetugasBKD = async (req, res) => {
  try {
    const { user } = req;
    const { customId } = user;

    const tabQuery = req.query.tab || "my-task";
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;

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

module.exports = {
  indexPetugasBKD,
};