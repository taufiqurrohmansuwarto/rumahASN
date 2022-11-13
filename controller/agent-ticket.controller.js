const Tickets = require("../models/tickets.model");
const Notifications = require("../models/notifications.model");
const { sendMail } = require("./mailer.controller");

const index = async (req, res) => {
  try {
    const { customId } = req?.user;
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;

    // buat filter
    const status = req?.query?.status || "SEMUA";
    const search = req?.query?.search || "";

    const result = await Tickets.query()
      .withGraphFetched("[]")
      .where("assignee", customId)
      .where((builder) => {
        if (status !== "SEMUA") {
          builder.where("status_code", status);
        }
        if (search) {
          builder
            .where("title", "ilike", `%${search}%`)
            .orWhere("ticket_number", "ilike", `%${search}%`);
        }
      })
      .page(page - 1, limit)
      .orderBy("updated_at", "desc")
      .withGraphFetched("[customer(simpleSelect) ]");

    res.json({ data: result?.results, page, total: result.total, limit });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const detail = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const result = await Tickets.query()
      .where("id", id)
      .andWhere("assignee", customId)
      .withGraphFetched(
        "[agent(simpleSelect), customer(simpleSelect), admin(simpleSelect), sub_category]"
      )
      .first();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req?.query;
    await Tickets.query()
      .patch({ ...req?.body, updated_at: new Date() })
      .where("id", id);
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

// tidak usah diremove
const remove = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const kerjakanTicket = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req.query;

    const data = await Tickets.query()
      .patch({
        status_code: "DIKERJAKAN",
        start_work_at: new Date(),
        updated_at: new Date(),
      })
      .where("id", id)
      .andWhere("assignee", customId)
      .andWhere("status_code", "DIAJUKAN");

    // find first who is assigne and the admin
    const result = await Tickets.query()
      .where("id", id)
      .andWhere("assignee", customId)
      .first()
      .withGraphFetched(
        "[customer(simpleSelect), admin(simpleSelect), agent(simpleSelect)]"
      );

    const assignee = result?.assignee;
    const chooser = result?.chooser;

    const dataInsert = [
      {
        from: customId,
        to: assignee,
        created_at: new Date(),
        title: "Perubahan status ticket",
        content: "Merubah status tiket menjadi dikerjakan",
        role: "requester",
        type: "ticket_status_change",
        type_id: id,
      },
      {
        from: customId,
        to: chooser,
        created_at: new Date(),
        title: "Perubahan status ticket",
        content: "Merubah status tiket menjadi dikerjakan",
        role: "admin",
        type: "ticket_status_change",
        type_id: id,
      },
    ];

    await Notifications.query().insert(dataInsert);
    const message = `Halo, ${result?.customer?.username}! Ticket dengan nomor ${result?.ticket_number} telah dikerjakan oleh ${result?.agent?.username}.`;
    await sendMail(result?.requester, message, "Perubahan status ticket");
    res.status(200).json({ code: 200, message: "success", data });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

// apa seharusnya begini?
const hapusTicket = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

// mungkin ada status lagi tapi dicoba ini saja dulu
const akhiriPekerjaanSelesai = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req.query;

    const currentTicket = await Tickets.query().findById(id);

    if (currentTicket?.status_code === "SELESAI") {
      res.status(400).json({ code: 400, message: "Ticket sudah selesai" });
    } else {
      await Tickets.query()
        .patch({
          status_code: "SELESAI",
          assignee_reason: req?.body?.assignee_reason,
          completed_at: new Date(),
          finished_at: new Date(),
          updated_at: new Date(),
        })
        .where("id", id)
        .andWhere("assignee", customId);

      // create notifications here
      const requester = currentTicket?.requester;
      const admin = currentTicket?.chooser;

      await Notifications.query().insert({
        from: customId,
        to: requester,
        title: "Penyelesaian ticket",
        content: "Sudah menyelesaikan tiket",
        role: "requester",
        type: "ticket_done",
        type_id: id,
      });

      await Notifications.query().insert({
        from: customId,
        to: admin,
        title: "Penyelesaian ticket",
        content: "Sudah menyelesaikan tiket",
        role: "admin",
        type: "ticket_done",
        type_id: id,
      });

      res.status(200).json({ code: 200, message: "success" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const akhiriPekerjaanDitolak = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    await Tickets.query()
      .patch({
        status_code: "DITOLAK",
        assignee_reason: req?.body?.assignee_reason,
      })
      .where("id", id)
      .andWhere("assignee", customId)
      .andWhere("status_code", "DIKERJAKAN");
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  index,
  detail,
  update,
  remove,
  kerjakanTicket,
  hapusTicket,
  akhiriPekerjaanDitolak,
  akhiriPekerjaanSelesai,
};
