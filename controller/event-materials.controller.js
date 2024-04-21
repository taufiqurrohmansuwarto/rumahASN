const EventMaterials = require("@/models/event-materials.model");

const getEventMaterials = async (req, res) => {
  try {
    const { eventId } = req?.query;

    const eventMaterials = await EventMaterials.query().where(
      "event_id",
      eventId
    );

    res.json(eventMaterials);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createEventMaterials = async (req, res) => {
  try {
    const { eventId } = req?.query;
    const data = {
      ...req.body,
      event_id: eventId,
    };

    const result = await EventMaterials.query().insert(data);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateEventMaterials = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const data = {
      ...req.body,
    };

    const result = await EventMaterials.query()
      .where("id", id)
      .andWhere("event_id", eventId)
      .patch(data);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEventMaterials = async (req, res) => {
  try {
    const { eventId, id } = req?.query;

    const result = await EventMaterials.query()
      .where("id", id)
      .andWhere("event_id", eventId)
      .delete();

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEventMaterial = async (req, res) => {
  try {
    const { id } = req?.query;
    const eventMaterial = await EventMaterials.query().findById(id);
    res.json(eventMaterial);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getEventMaterial,
  getEventMaterials,
  createEventMaterials,
  updateEventMaterials,
  deleteEventMaterials,
};
