const EventSponsors = require("@/models/event-sponsors.model");

const getEventSponsors = async (req, res) => {
  try {
    const { eventId } = req?.query;

    const eventSponsors = await EventSponsors.query().where(
      "event_id",
      eventId
    );

    res.json(eventSponsors);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createEventSponsors = async (req, res) => {
  try {
    const { eventId } = req?.query;
    const data = {
      ...req.body,
      event_id: eventId,
    };

    const result = await EventSponsors.query().insert(data);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateEventSponsors = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const data = {
      ...req.body,
    };

    const result = await EventSponsors.query()
      .where("id", id)
      .andWhere("event_id", eventId)
      .patch(data);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEventSponsors = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const result = await EventSponsors.query()
      .delete()
      .where("id", id)
      .andWhere("event_id", eventId);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEventSponsor = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const eventSponsor = await EventSponsors.query()
      .where("id", id)
      .andWhere("event_id", eventId);

    res.json(eventSponsor);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getEventSponsors,
  createEventSponsors,
  updateEventSponsors,
  deleteEventSponsors,
  getEventSponsor,
};
