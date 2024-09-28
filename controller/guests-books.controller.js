const Guests = require("@/models/guests_books/guests.model");
const ScheduleVisits = require("@/models/guests_books/schedule-visits.model");
const SyncPegawai = require("@/models/sync-pegawai.model");

const Visits = require("@/models/guests_books/visits.model");
const QrCode = require("@/models/guests_books/qr-code.model");
const Notifications = require("@/models/guests_books/notifications.model");
const { raw } = require("objection");

const createQrCode = async ({ guestId, scheduleVisitId }) => {
  const code = Buffer.from(`${guestId}-${scheduleVisitId}`).toString("base64");
  // 3 days
  const expiredAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
  const qrCode = await QrCode.query().insert({
    guest_id: guestId,
    schedule_visit_id: scheduleVisitId,
    status: "active",
    qr_code: code,
    expired_at: expiredAt,
  });
  return qrCode;
};

const checkIn = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const qrCodeData = await QrCode.query().findById(qrCode);

    if (!qrCodeData) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    const { guestId, scheduleVisitId } = qrCodeData;

    if (qrCodeData.expired_at < new Date()) {
      return res.status(400).json({ message: "QR Code expired" });
    }

    const scheduleVisit = await ScheduleVisits.query().findById(
      scheduleVisitId
    );

    if (!scheduleVisit) {
      return res.status(404).json({ message: "Schedule visit not found" });
    }

    const visit = await Visits.query().insert({
      guest_id: guestId,
      schedule_visit_id: scheduleVisitId,
      check_in_date: new Date(),
      status: "check-in",
    });

    res.json(visit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkOut = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const qrCodeData = await QrCode.query().findById(qrCode);

    if (!qrCodeData) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    const { guestId, scheduleVisitId } = qrCodeData;

    const visit = await Visits.query().findById(qrCode);

    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    } else {
      const checkOutDate = new Date();
      await Visits.query().findById(qrCode).patch({
        check_out_date: checkOutDate,
        status: "check-out",
      });
      res.json({ message: "Check out success" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

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

      await createQrCode({
        guestId: guest.id,
        scheduleVisitId: scheduleVisit.id,
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
    const scheduleVisits = await ScheduleVisits.query()
      .where("guest_id", guest.id)
      .withGraphFetched("qrCode");
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
        "id as id",
        raw(`concat('master','|',id) as customId`),
        "nama_master as name",
        "foto as avatar",
        "opd_master as organization",
        "skpd_id as organizationId"
      )
      .where("skpd_id", "ilike", "123%")
      .orderBy("nama_master");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const getAllScheduleVisits = async (req, res) => {
  try {
    const scheduleVisits = await ScheduleVisits.query().withGraphFetched(
      "guest"
    );
    res.json(scheduleVisits);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllScheduleVisits,
  getGuests,
  getEmployeesBKD,
  updateGuest,
  createScheduleVisit,
  getScheduleVisits,
  getScheduleVisitById,
  updateScheduleVisit,
  deleteScheduleVisit,
  checkIn,
  checkOut,
};
