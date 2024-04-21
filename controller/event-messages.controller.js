const EventMessages = require("@/models/event-messages.model");

const getEventMessages = async (req, res) => {
  try {
    const { eventId } = req?.query;

    const eventMessages = await EventMessages.query().where(
      "event_id",
      eventId
    );

    res.json(eventMessages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createEventMessages = async (req, res) => {
  try {
    const { customId } = req.user;
    const data = {
      ...req.body,
      created_by: customId,
    };

    await EventMessages.query().insert(data);
    res.json({
      message: "Event message created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateEventMessages = async (req, res) => {
  try {
    const { id } = req.query;
    const { customId } = req.user;

    const data = {
      ...req.body,
      updated_by: customId,
      updated_at: new Date().toISOString(),
    };

    await EventMessages.query().findById(id).patch(data);
    res.json({
      message: "Event message updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEventMessages = async (req, res) => {
  try {
    const { eventId, id } = req.query;
    const { customId } = req.user;

    await EventMessages.query()
      .delete()
      .where("id", id)
      .andWhere("event_id", eventId)
      .andWhere("created_by", customId);

    res.json({
      message: "Event message deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEventMessage = async (req, res) => {
  try {
    const { id, eventId } = req.query;
    const eventMessage = await EventMessages.query()
      .where("id", id)
      .andWhere("event_id", eventId);
    res.json(eventMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getEventMessages,
  createEventMessages,
  updateEventMessages,
  deleteEventMessages,
  getEventMessage,
};
