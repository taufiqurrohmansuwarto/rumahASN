const EventParticipants = require("@/models/event-participants.model");

const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req?.query;

    const eventParticipants = await EventParticipants.query().where(
      "event_id",
      eventId
    );

    res.json(eventParticipants);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createEventParticipants = async (req, res) => {
  try {
    const { eventId } = req?.query;
    const data = {
      ...req.body,
      event_id: eventId,
    };

    const result = await EventParticipants.query().insert(data);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateEventParticipants = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const data = {
      ...req.body,
    };

    const result = await EventParticipants.query()
      .where("id", id)
      .andWhere("event_id", eventId)
      .patch(data);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEventParticipants = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const result = await EventParticipants.query()
      .delete()
      .where("id", id)
      .andWhere("event_id", eventId);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEventParticipant = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const eventParticipant = await EventParticipants.query()
      .where("id", id)
      .andWhere("event_id", eventId)
      .first();

    res.json(eventParticipant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getEventParticipant,
  getEventParticipants,
  createEventParticipants,
  updateEventParticipants,
  deleteEventParticipants,
};
