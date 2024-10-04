const Guests = require("@/models/guests_books/guests.model");
const ScheduleVisits = require("@/models/guests_books/schedule-visits.model");
const SyncPegawai = require("@/models/sync-pegawai.model");

const Visits = require("@/models/guests_books/visits.model");
const QrCode = require("@/models/guests_books/qr-code.model");
const Notifications = require("@/models/guests_books/notifications.model");
const User = require("@/models/users.model");

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
    const qrCodeData = await QrCode.query().where("qr_code", qrCode).first();

    if (!qrCodeData) {
      return res.status(404).json({ message: "Kode QR tidak ditemukan" });
    }

    const { guest_id: guestId, schedule_visit_id: scheduleVisitId } =
      qrCodeData;

    if (qrCodeData.expired_at < new Date()) {
      return res.status(400).json({ message: "Kode QR sudah kadaluarsa" });
    }

    const scheduleVisit = await ScheduleVisits.query().findById(
      scheduleVisitId
    );

    if (!scheduleVisit) {
      return res
        .status(404)
        .json({ message: "Jadwal kunjungan tidak ditemukan" });
    }

    const findVisit = await Visits.query()
      .where("guest_id", guestId)
      .where("schedule_visit_id", scheduleVisitId)
      .where("status", "check-in")
      .first();

    if (findVisit) {
      return res.status(400).json({ message: "Sudah melakukan check in" });
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

const findByQrCode = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const qrCodeData = await QrCode.query().where("qr_code", qrCode).first();

    if (!qrCodeData) {
      return res.status(404).json({ message: "Kode QR tidak ditemukan" });
    }

    if (qrCodeData.expired_at < new Date()) {
      return res.status(400).json({ message: "Kode QR sudah kadaluarsa" });
    }

    const scheduleVisit = await ScheduleVisits.query()
      .findById(qrCodeData.schedule_visit_id)
      .withGraphFetched("[guest.[user]]");

    const data = {
      qrCode: qrCodeData,
      scheduleVisit,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const checkOut = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const qrCodeData = await QrCode.query().where("qr_code", qrCode).first();

    if (!qrCodeData) {
      return res.status(404).json({ message: "Kode QR tidak ditemukan" });
    }

    const { guest_id: guestId, schedule_visit_id: scheduleVisitId } =
      qrCodeData;

    const [scheduleVisit, alreadyCheckOut, alreadyCheckIn] = await Promise.all([
      ScheduleVisits.query().findById(scheduleVisitId).first(),
      Visits.query()
        .where({
          guest_id: guestId,
          schedule_visit_id: scheduleVisitId,
          status: "check-out",
        })
        .first(),
      Visits.query()
        .where({
          guest_id: guestId,
          schedule_visit_id: scheduleVisitId,
          status: "check-in",
        })
        .first(),
    ]);

    if (!scheduleVisit) {
      return res
        .status(404)
        .json({ message: "Jadwal kunjungan tidak ditemukan" });
    }

    if (alreadyCheckOut) {
      return res.status(400).json({ message: "Sudah melakukan check out" });
    }

    if (!alreadyCheckIn) {
      return res.status(400).json({ message: "Belum melakukan check in" });
    }

    const result = await Visits.query().insert({
      guest_id: guestId,
      schedule_visit_id: scheduleVisitId,
      check_out_date: new Date(),
      status: "check-out",
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal melakukan check out" });
  }
};

// get guest
const getGuests = async (req, res) => {
  const { customId } = req.user;
  const [guest, currentUser] = await Promise.all([
    Guests.query().where("user_id", customId).first(),
    User.query()
      .findById(customId)
      .select(
        "username as name",
        "image as photo",
        "status_kepegawaian as visitor_type",
        "email",
        "info"
      ),
  ]);

  const helperData = {
    name: currentUser.name,
    photo: currentUser.photo,
    visitor_type: currentUser?.visitor_type || null,
    email: currentUser?.email || null,
    institution: currentUser?.info?.perangkat_daerah?.detail || null,
  };

  const responseData = {
    guest: guest || null,
    helper: helperData,
  };

  res.json(responseData);
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

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const visit_date = req.query.visit_date || [];

    console.log(req.query);

    const guest = await Guests.query().where("user_id", customId).first();
    const scheduleVisits = await ScheduleVisits.query()
      .where("guest_id", guest.id)
      .andWhere((builder) => {
        if (visit_date && visit_date.length === 2) {
          builder.whereRaw("DATE(visit_date) BETWEEN ? AND ?", visit_date);
        }
      })
      .withGraphFetched("[qrCode, visits(orderByDate)]")
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    const data = {
      data: scheduleVisits.results,
      total: scheduleVisits.total,
      page,
      limit,
    };

    res.json(data);
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
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const range = req.query.range || [];
    const name = req?.query?.name || "";

    let query = ScheduleVisits.query()
      .page(page - 1, limit)
      .orderBy("created_at", "desc")
      .where((builder) => {
        if (range && range.length === 2) {
          builder.whereRaw("DATE(visit_date) BETWEEN ? AND ?", range);
        }
      });

    if (!name) {
      query.withGraphFetched("[guest.[user]]");
    } else {
      query
        .withGraphJoined("[guest.[user]]")
        .whereRaw("LOWER(guest.name) LIKE ?", `%${name.toLowerCase()}%`);
    }

    const scheduleVisits = await query.orderBy("created_at", "desc");

    const data = {
      data: scheduleVisits.results,
      total: scheduleVisits.total,
      page,
      limit,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const myGuest = async (req, res) => {
  try {
    const { customId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const visit_date = req.query.visit_date || [];

    const scheduleVisits = await ScheduleVisits.query()
      .page(page - 1, limit)
      .whereRaw(
        `employee_visited @> ?::jsonb`,
        JSON.stringify([{ customid: customId }])
      )
      .andWhere((builder) => {
        if (visit_date && visit_date.length === 2) {
          builder.whereRaw("DATE(visit_date) BETWEEN ? AND ?", visit_date);
        }
      })
      .withGraphFetched("[guest, visits]");

    const data = {
      data: scheduleVisits.results,
      total: scheduleVisits.total,
      page,
      limit,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const findCheckIn = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await Visits.query()
      .page(page - 1, limit)
      .orderBy("created_at", "desc")
      .where("status", "check-in")
      .withGraphFetched("[schedule, guest.[user]]");

    const data = {
      data: result.results,
      total: result.total,
      page,
      limit,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

const findCheckOut = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await Visits.query()
      .page(page - 1, limit)
      .orderBy("created_at", "desc")
      .where("status", "check-out")
      .withGraphFetched("[guest.[user], schedule]");

    const data = {
      data: result.results,
      total: result.total,
      page,
      limit,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllScheduleVisits,
  myGuest,
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
  findByQrCode,
  findCheckIn,
  findCheckOut,
};
