const Events = require("@/models/events.model");
const EventParticipants = require("@/models/event-participants.model");

const allEvents = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const userEvents = async (req, res) => {
  try {
    const result = await EventParticipants.query()
      .where("is_publish", true)
      .orderBy("created_at", "desc");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createEvents = async (req, res) => {
  try {
    const { customId } = req.user;
    const data = {
      ...req.body,
      created_by: customId,
    };

    await Events.query().insert(data);
    res.json({
      message: "Event created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Events.query();
    res.json(events);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEvent = async (req, res) => {
  try {
    const { eventId } = req.query;
    const event = await Events.query().findById(eventId);
    res.json(event);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.query;
    const { customId } = req.user;

    await Events.query().findById(id).patch(req.body);
    res.json({
      message: "Event updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.query;
    await Events.query().deleteById(id);
    res.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createEvents,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  allEvents,
  userEvents,
};
