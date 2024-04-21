const EventSpeakers = require("@/models/event-speakers.model");

const getEventSpeakers = async (req, res) => {
  try {
    const { eventId } = req?.query;

    const eventSpeakers = await EventSpeakers.query().where(
      "event_id",
      eventId
    );

    res.json(eventSpeakers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createEventSpeakers = async (req, res) => {
  try {
    const { eventId } = req?.query;
    const data = {
      ...req.body,
      event_id: eventId,
    };

    const result = await EventSpeakers.query().insert(data);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateEventSpeakers = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const data = {
      ...req.body,
    };

    const result = await EventSpeakers.query()
      .where("id", id)
      .andWhere("event_id", eventId)
      .patch(data);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEventSpeakers = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const result = await EventSpeakers.query()
      .delete()
      .where("id", id)
      .andWhere("event_id", eventId);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEventSpeaker = async (req, res) => {
  try {
    const { id } = req?.query;

    const eventSpeaker = await EventSpeakers.query().findById(id);

    res.json(eventSpeaker);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getEventSpeakers,
  createEventSpeakers,
  updateEventSpeakers,
  deleteEventSpeakers,
  getEventSpeaker,
};
