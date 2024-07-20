const { toNumber } = require("lodash");
const Notifications = require("../models/notifications.model");
const ASNConnectNotification = require("@/models/socmed-notifications.model");
const Discussions = require("@/models/discussions.model");
const SocmedPosts = require("@/models/socmed-posts.model");

const index = async (req, res) => {
  try {
    const { customId } = req?.user;
    const limit = req?.query?.limit || 50;
    const page = req?.query?.page || 1;
    const simbol = req?.query?.symbol || "no";

    if (simbol === "no") {
      const result = await Notifications.query()
        .where("to", customId)
        .withGraphFetched("[from_user(simpleSelect), ticket(selectPublish) ]")
        .page(parseInt(page) - 1, parseInt(limit))
        .orderBy("created_at", "desc");
      res.json({
        results: result.results,
        total: result.total,
        limit: parseInt(limit),
        page: parseInt(page),
      });
    } else if (simbol === "yes") {
      const result = await Notifications.query()
        .count()
        .where("to", customId)
        .andWhere("read_at", null);
      res.json(result[0]);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

// clear chats
const clearChats = async (req, res) => {
  try {
    const { customId } = req?.user;
    await Notifications.query()
      .patch({ read_at: new Date() })
      .where("to", customId)
      .andWhere("read_at", null);
    res.status(200).json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const readNotification = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: user_id } = req?.user;

    await Notifications.query()
      .patch({ read_at: new Date() })
      .where({ id, to: user_id });
    res.status(200).json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const detail = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const asnConnectNotifications = async (req, res) => {
  try {
    const { customId } = req?.user;
    const page = req?.query?.page || 1;
    const symbol = req?.query?.symbol || "no";
    const limit = req?.query?.limit || 50;

    if (symbol === "no") {
      const result = await ASNConnectNotification.query()
        .where("trigger_user_id", "=", customId)
        .withGraphFetched("[trigger_user(simpleSelect), user(simpleSelect)]")
        .page(parseInt(page) - 1, parseInt(limit))
        .orderBy("created_at", "desc");

      const myResults = await Promise.all(
        result?.results?.map(async (r) => {
          let data = {};
          if (
            r?.type === "comment_asn_update" ||
            r?.type === "like_asn_update"
          ) {
            data = await SocmedPosts.query()
              .findById(r?.reference_id)
              .select("id", "user_id")
              .withGraphFetched("[user(username)]");
          } else if (r?.type === "comment_asn_discussion") {
            data = await Discussions.query()
              .findById(r?.reference_id)
              .select("id", "title", "created_by");
          }

          return {
            ...r,
            data,
          };
        })
      );
      const data = {
        results: myResults,
        total: result.total,
        limit: parseInt(limit),
        page: parseInt(page),
      };

      res.json(data);
    } else if (symbol === "yes") {
      const result = await ASNConnectNotification.query().count().where({
        trigger_user_id: customId,
        is_read: false,
      });

      const data = {
        total: toNumber(result[0]?.count),
      };

      res.json(data);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const asnConnectClearNotifications = async (req, res) => {
  try {
    const { customId } = req?.user;
    await ASNConnectNotification.query()
      .patch({ is_read: true })
      .where("trigger_user_id", customId);
    res.status(200).json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const asnConnectReadNotification = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    await ASNConnectNotification.query()
      .patch({ is_read: true })
      .where({ id, trigger_user_id: customId });
    res.status(200).json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  index,
  detail,
  clearChats,
  readNotification,
  asnConnectClearNotifications,
  asnConnectNotifications,
  asnConnectReadNotification,
};
