const EventExhibitors = require("@/models/event-exhibitors.model");

const getEventExhibitors = async (req, res) => {
  try {
    const { eventId } = req?.query;

    const eventExhibitors = await EventExhibitors.query()
      .where("event_id", eventId)
      .orderBy("created_at", "desc");

    res.json(eventExhibitors);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createEventExhibitors = async (req, res) => {
  try {
    const { eventId } = req?.query;
    const data = {
      ...req.body,
      event_id: eventId,
    };

    const result = await EventExhibitors.query().insert(data);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateEventExhibitors = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const data = {
      ...req.body,
    };

    const result = await EventExhibitors.query()
      .where("id", id)
      .andWhere("event_id", eventId)
      .patch(data);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEventExhibitors = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const result = await EventExhibitors.query()
      .delete()
      .where("id", id)
      .andWhere("event_id", eventId);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEventExhibitor = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const eventExhibitor = await EventExhibitors.query()
      .where("id", id)
      .andWhere("event_id", eventId);

    res.json(eventExhibitor);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getEventExhibitor,
  getEventExhibitors,
  createEventExhibitors,
  updateEventExhibitors,
  deleteEventExhibitors,
};
