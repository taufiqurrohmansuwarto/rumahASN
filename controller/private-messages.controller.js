const PrivateMessage = require("@/models/private-messages.model");

module.exports.findPrivateMessages = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const limit = parseInt(req?.query?.limit) || 10;
    const page = parseInt(req?.query?.page) || 1;

    const result = await PrivateMessage.query()
      .where("receiver_id", userId)
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    const data = {
      data: result.results,
      limit,
      page,
      total: result.total,
    };

    res.json(data);
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
      .andWhere("receiver_id", userId)
      .first();

    res.json(result);
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
