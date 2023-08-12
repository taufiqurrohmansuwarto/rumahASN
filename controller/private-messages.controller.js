const PrivateMessage = require("@/models/private-messages.model");
const { parseMarkdown } = require("@/utils/parsing");

const parsingMessage = (data) => {
  if (data?.length > 0) {
    return data?.map((d) => ({
      ...d,
      message: parseMarkdown(d?.message),
    }));
  } else {
    return [];
  }
};

module.exports.findPrivateMessages = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const limit = parseInt(req?.query?.limit) || 10;
    const page = parseInt(req?.query?.page) || 1;
    const type = req?.query?.type || "inbox";

    if (type === "total_unread") {
      const result = await PrivateMessage.query()
        .where("receiver_id", userId)
        .andWhere("is_read", false)
        .count("id as total");
      res.json({ total: result[0].total });
    } else {
      const result = await PrivateMessage.query()
        .where((builder) => {
          if (type === "inbox") {
            builder.where("receiver_id", userId);
          } else if (type === "sent") {
            builder.where("sender_id", userId);
          }
        })
        .withGraphFetched("[sender(simpleSelect), receiver(simpleSelect)]")
        .orderBy("created_at", "desc")
        .page(page - 1, limit);

      const nextPage = await PrivateMessage.query()
        .where("receiver_id", userId)
        .andWhere((builder) => {
          if (type === "inbox") builder.where("receiver_id", userId);
          if (type === "sent") builder.where("sender_id", userId);
        })
        .offset(page * limit)
        .limit(limit + 1);

      const data = {
        data: parsingMessage(result.results),
        limit,
        page,
        total: result.total,
        hasNextPage: nextPage.length > 0,
      };

      res.json(data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.getPrivateMessage = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req?.query;
    const result = await PrivateMessage.query()
      .where("id", id)
      .andWhere((builder) => {
        builder.where("sender_id", userId).orWhere("receiver_id", userId);
      })
      .withGraphFetched("[sender(simpleSelect), receiver(simpleSelect)]")
      .first();

    if (result) {
      if (result?.receiver_id === userId && !result?.is_read) {
        await PrivateMessage.query().where("id", id).update({
          is_read: true,
        });
      }
      const data = {
        ...result,
        message: parseMarkdown(result?.message),
      };
      res.json(data);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.getNotificationPrivateMessage = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const result = await PrivateMessage.query()
      .where("receiver_id", userId)
      .andWhere("is_read", false)
      .count("id as total");

    res.json(result);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
};

module.exports.sendPrivateMessage = async (req, res) => {
  try {
    const { customId: senderId } = req?.user;
    const { receiverId, message, title } = req?.body;

    const result = await PrivateMessage.query().insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message,
      title,
    });
    res.json({
      message: "success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.readPrivateMessage = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req?.body;
    const result = await PrivateMessage.query()
      .where("id", id)
      .andWhere("receiver_id", userId)
      .first()
      .patch({ is_read: true });

    res.json({
      message: "success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.deletePrivateMessage = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req?.body;
    const result = await PrivateMessage.query()
      .where("id", id)
      .andWhere("receiver_id", userId)
      .delete();
    res.json({
      message: "success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
