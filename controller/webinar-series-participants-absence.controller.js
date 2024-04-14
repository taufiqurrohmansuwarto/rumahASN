const WebinarSeriesParticipantsAbsence = require("@/models/webinar-series-participants-absence.model");
const WebinarSeriesAbsenceEntries = require("@/models/webinar-series-absence-entries.model");
const WebinarParticipates = require("@/models/webinar-series-participates.model");

const dayjs = require("dayjs");
require("dayjs/locale/id");

const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.locale("id");
dayjs.extend(relativeTime);

const xlsx = require("xlsx");

// admin
const getAbsences = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const getAbsencesUsers = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const result = await WebinarParticipates.query()
      .where("id", id)
      .andWhere("user_id", customId)
      .first();

    if (!result) {
      return res.status(403).json({
        code: 403,
        message: "Forbidden",
      });
    } else {
      const currentWebinaId = result?.webinar_series_id;

      const absences = await WebinarSeriesAbsenceEntries.query().where(
        "webinar_series_id",
        currentWebinaId
      );

      const userAbsences = await WebinarSeriesParticipantsAbsence.query().where(
        "user_id",
        customId
      );

      const currentData = absences.map((absence) => {
        const userAbsence = userAbsences.find(
          (userAbsence) =>
            userAbsence?.webinar_series_absence_entry_id === absence?.id
        );

        return {
          ...absence,
          current_user_absence: userAbsence || null,
        };
      });

      res.json(currentData);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

// user
const registerAbsence = async (req, res) => {
  try {
    const { id, absenceId } = req?.query;
    const { customId } = req?.user;

    const result = await WebinarParticipates.query()
      .where("id", id)
      .andWhere("user_id", customId)
      .first();

    if (!result) {
      res.status(403).json({
        code: 403,
        message: "Forbidden",
      });
    } else {
      const currentAbsenceEntries = await WebinarSeriesAbsenceEntries.query()
        .where("id", absenceId)
        .andWhere("registration_open_at", "<=", new Date())
        .andWhere("registration_close_at", ">=", new Date())
        .first();

      if (!currentAbsenceEntries) {
        res.status(403).json({
          code: 403,
          message:
            "Tidak bisa mendaftar absen karena tidak sesuai dengan jadwal",
        });
      } else {
        await WebinarSeriesParticipantsAbsence.query()
          .insert({
            user_id: customId,
            webinar_series_absence_entry_id: absenceId,
          })
          .onConflict(["user_id", "webinar_series_absence_entry_id"])
          .merge();

        res.status(200).json({ code: 200, message: "Success" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const unregisterAbsence = async (req, res) => {
  try {
    const { id, absenceId } = req?.query;
    const { customId } = req?.user;
    const result = await WebinarParticipates.query()
      .where("id", id)
      .andWhere("user_id", customId)
      .first();

    if (!result) {
      return res.status(403).json({
        code: 403,
        message: "Forbidden",
      });
    } else {
      await WebinarSeriesParticipantsAbsence.query()
        .delete()
        .where("user_id", customId)
        .andWhere("webinar_series_absence_entry_id", absenceId);

      res.status(200).json({ code: 200, message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const getNama = (user) => {
  if (user?.group === "GOOGLE") {
    return user?.info?.username;
  } else {
    return user?.username;
  }
};

const getEmployeeNumber = (user) => {
  if (user?.group === "GOOGLE") {
    const employee_number = `${user?.info?.employee_number}` || "";
    return employee_number;
  } else {
    return user?.employee_number;
  }
};

const getEmail = (user) => {
  if (user?.group === "GOOGLE") {
    return user?.email;
  } else {
    return user?.email;
  }
};

const serializeAbsecesParticipants = (data) => {
  if (!data?.length) {
    return [];
  } else {
    return data?.map((item) => {
      return {
        nama: getNama(item?.user),
        email: getEmail(item?.user),
        nomer_pegawai: getEmployeeNumber(item?.user),
        perangkat_daerah: item?.user?.info?.perangkat_daerah?.detail,
        tanggal_absensi: dayjs(item?.created_at).format("DD-MM-YYYY HH:mm"),
        asal_masuk: item?.user?.group,
      };
    });
  }
};

const getReportAbsences = async (req, res) => {
  try {
    const { absenceId } = req?.query;
    const result = await WebinarSeriesParticipantsAbsence.query()
      .where("webinar_series_absence_entry_id", absenceId)
      .withGraphFetched("user");
    const data = serializeAbsecesParticipants(result);

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);

    xlsx.utils.book_append_sheet(wb, ws, "Rating");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "rating.xlsx"
    );

    res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  // admin
  getAbsences,
  getReportAbsences,

  // user
  getAbsencesUsers,
  registerAbsence,
  unregisterAbsence,
};
