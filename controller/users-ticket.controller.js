const Tickets = require("../models/tickets.model");
const Notification = require("../models/notifications.model");
const { sendingNotificationToAdmin } = require("@/utils/tickets-utilities");

const index = async (req, res) => {
  try {
    const { customId } = req?.user;

    //     search, page, limit
    const search = req?.query?.search || "";
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 50;
    const status = req?.query?.status || "all";

    const result = await Tickets.query()
      .where("requester", customId)
      .andWhere((builder) => {
        if (search) {
          builder
            .where("title", "ilike", `%${search}%`)
            .orWhere("ticket_number", "ilike", `%${search}%`);
        }
        if (status !== "all") {
          builder.where("status_code", status);
        }
      })
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    res.json({
      results: result?.results,
      total: result?.total,
      page: page,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const detail = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;

    const result = await Tickets.query()
      .where("requester", customId)
      .andWhere("id", id)
      .withGraphFetched(
        "[agent(simpleSelect), admin(simpleSelect), customer(simpleSelect)]"
      )
      .first();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const create = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { body } = req;
    const data = { ...body, requester: customId, status_code: "DIAJUKAN" };

    const result = await Tickets.query().insert(data).returning("*");
    await sendingNotificationToAdmin(result?.id, customId);
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};
const update = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    await Tickets.query()
      .patch({ ...req?.body, updated_at: new Date() })
      .where("id", id)
      .andWhere("requester", customId);
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};
const remove = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    await Tickets.query()
      .delete()
      .where("requester", customId)
      .andWhere("id", id)
      .andWhereNot("status_code", "SELESAI");
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

// user hanya bisa melihat tiket yang sudah dipublish dan statusnya sudah selesai
const publishedTickets = async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 25;
    const search = req?.query?.search || "";

    const result = await Tickets.query()
      .andWhere("status_code", "SELESAI")
      .andWhere((builder) => {
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
      })
      .andWhere("is_published", true)
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    const data = {
      results: result?.results,
      total: result?.total,
      page: page,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  index,
  publishedTickets,
  create,
  update,
  remove,
  detail,
};
