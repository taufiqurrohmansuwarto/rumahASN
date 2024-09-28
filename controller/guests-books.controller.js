const Guests = require("@/models/guests_books/guests.model");
const ScheduleVisits = require("@/models/guests_books/schedule-visits.model");
const SyncPegawai = require("@/models/sync-pegawai.model");

const getGuests = async (req, res) => {
  const { customId } = req.user;
  const guest = await Guests.query().where("user_id", customId).first();
  if (!guest) {
    res.json(null);
  } else {
    res.json(guest);
  }
};

// upsert
const updateGuest = async (req, res) => {
  const { customId } = req.user;
  const { body } = req;
  const guest = await Guests.query().where("user_id", customId).first();
  if (!guest) {
    await Guests.query().insert({
      user_id: customId,
      ...body,
    });
  } else {
    await Guests.query()
      .where("user_id", customId)
      .patch({
        ...body,
      });
  }
  res.json({ message: "Guest updated" });
};

const createScheduleVisit = async (req, res) => {
  try {
    const { customId } = req.user;
    const { body } = req;
    const guest = await Guests.query().where("user_id", customId).first();

    if (!guest) {
      res.status(404).json({ message: "Guest not found" });
    } else {
      const scheduleVisit = await ScheduleVisits.query().insert({
        guest_id: guest.id,
        ...body,
      });
      res.json(scheduleVisit);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const getScheduleVisits = async (req, res) => {
  try {
    const { customId } = req.user;
    const guest = await Guests.query().where("user_id", customId).first();
    const scheduleVisits = await ScheduleVisits.query().where(
      "guest_id",
      guest.id
    );
    res.json(scheduleVisits);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const getScheduleVisitById = async (req, res) => {
  try {
    const { customId } = req.user;
    const guest = await Guests.query().where("user_id", customId).first();
    const { id } = req.query;

    const scheduleVisit = await ScheduleVisits.query()
      .where("guest_id", guest.id)
      .findById(id);
    res.json(scheduleVisit);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const updateScheduleVisit = async (req, res) => {
  try {
    const { body } = req;
    const { id } = req.query;
    const { customId } = req.user;
    const guest = await Guests.query().where("user_id", customId).first();
    if (!guest) {
      res.status(404).json({ message: "Guest not found" });
    } else {
      const scheduleVisit = await ScheduleVisits.query()
        .where("guest_id", guest.id)
        .findById(id)
        .patch({
          ...body,
        });
      res.json(scheduleVisit);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const deleteScheduleVisit = async (req, res) => {
  try {
    const { id } = req.query;
    const { customId } = req.user;
    console.log({ id, customId });
    const guest = await Guests.query().where("user_id", customId).first();

    if (!guest) {
      res.status(404).json({ message: "Guest not found" });
    } else {
      await ScheduleVisits.query()
        .where("guest_id", guest.id)
        .findById(id)
        .delete();
      res.json({ message: "Schedule visit deleted" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const getEmployeesBKD = async (req, res) => {
  try {
    const result = await SyncPegawai.query()
      .select(
        "id as value",
        "nama_master as name",
        "foto as avatar",
        "opd_master as organization"
      )
      .where("skpd_id", "ilike", "123%")
      .orderBy("nama_master");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getGuests,
  getEmployeesBKD,
  updateGuest,
  createScheduleVisit,
  getScheduleVisits,
  getScheduleVisitById,
  updateScheduleVisit,
  deleteScheduleVisit,
};
