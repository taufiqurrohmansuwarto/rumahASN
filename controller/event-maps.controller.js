const EventMaps = require("@/models/event-maps.model");

const getEventMaps = async (req, res) => {
  try {
    const { eventId } = req?.query;

    const result = await EventMaps.query().where("event_id", eventId);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createEventMaps = async (req, res) => {
  try {
    const { eventId } = req?.query;
    const data = {
      ...req.body,
      event_id: eventId,
    };

    const result = await EventMaps.query().insert(data);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateEventMaps = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const data = {
      ...req.body,
    };

    const result = await EventMaps.query()
      .where("id", id)
      .andWhere("event_id", eventId)
      .patch(data);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEventMaps = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const result = await EventMaps.query()
      .delete()
      .where("id", id)
      .andWhere("event_id", eventId);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEventMap = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const result = await EventMaps.query()
      .where("id", id)
      .andWhere("event_id", eventId);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getEventMaps,
  createEventMaps,
  updateEventMaps,
  deleteEventMaps,
  getEventMap,
};
