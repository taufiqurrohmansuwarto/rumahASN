const WebinarSeriesParticipate = require("@/models/webinar-series-participates.model");
const WebinarSeriesSurveys = require("@/models/webinar-series-surveys.model");
const WebinarSeriesSurveysQuestion = require("@/models/webinar-series-surveys-questions.model");
const WebinarSeriesRating = require("@/models/webinar-series-ratings.model");
const WebinrSeriesComments = require("@/models/webinar-series-comments.model");

const moment = require("moment");

const xlsx = require("xlsx");
const { times, toLower, isUndefined } = require("lodash");
const { getReportWebinarSeries } = require("@/utils/query-utils");

const getNama = (user) => {
  if (user?.group === "GOOGLE") {
    return user?.info?.username;
  } else {
    return user?.username;
  }
};

const getEmployeeNumber = (user) => {
  if (user?.group === "GOOGLE") {
    const employee_number = isUndefined(user?.info?.employee_number)
      ? ""
      : user?.info?.employee_number;
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

const serializeDataReportRatings = (data) => {
  if (!data?.length) {
    return [];
  } else {
    const result = data?.map((item) => {
      return {
        email: getEmail(item?.participant),
        Nama: getNama(item?.participant),
        Jabatan: item?.participant?.info?.jabatan?.jabatan,
        "Perangkat Daerah": item?.participant?.info?.perangkat_daerah?.detail,
        rating: item?.rating,
        cara_masuk: item?.participant?.group,
        komentar: item?.comments,
      };
    });
    return result;
  }
};

const serializeDataReportParticipant = (data) => {
  if (!data?.length) {
    return [];
  } else {
    const result = data.map((item) => {
      return {
        Nama: getNama(item),
        "Asal Pendaftaran": item?.group,
        email: toLower(getEmail(item)),
        "NIP/NIPTTK": getEmployeeNumber(item),
        Jabatan: item?.info?.jabatan?.jabatan,
        "Perangkat Daerah": item?.info?.perangkat_daerah?.detail,
        "Tanggal Registrasi": moment(item?.waktu_registrasi).format(
          "DD-MM-YYYY HH:mm"
        ),
        "Sudah Polling": item?.already_poll ? "Sudah" : "Belum",
        waktu_absen: item?.waktu_absen,
        dapat_sertifikat: item?.dapat_sertifikat,
      };
    });
    return result;
  }
};

const valueToText = (value) => {
  if (value === 1) {
    return "Sangat Tidak Puas";
  } else if (value === 2) {
    return "Tidak Puas";
  } else if (value === 3) {
    return "Cukup Puas";
  } else if (value === 4) {
    return "Puas";
  } else if (value === 5) {
    return "Sangat Puas";
  }
};

const serializeWebinarSeriesSurveys = (data) => {
  if (!data?.length) {
    return [];
  } else {
    // key : 1, value: 0
    const result = data.map((x) => {
      const hasil = times(5, (i) => {
        const key = i + 1;
        const value = x[key];
        return {
          label: valueToText(key),
          key,
          value: parseInt(value),
        };
      });

      return {
        question: x?.question,
        chart: hasil,
      };
    });

    return result;
  }
};

const reportSurvey = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await WebinarSeriesSurveysQuestion.query()
      .select(
        "webinar_series_surveys_questions.question",
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 1 then 1 else 0 end)`
        ).as("1"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 2 then 1 else 0 end)`
        ).as("2"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 3 then 1 else 0 end)`
        ).as("3"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 4 then 1 else 0 end)`
        ).as("4"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 5 then 1 else 0 end)`
        ).as("5"),
        "webinar_series_surveys.webinar_series_id"
      )
      .joinRelated("webinar_series_surveys")
      .where("webinar_series_surveys.webinar_series_id", id)
      .andWhere("webinar_series_surveys_questions.type", "scale")
      .groupBy(
        "webinar_series_surveys_questions.question",
        "webinar_series_surveys.webinar_series_id"
      );

    const data = serializeWebinarSeriesSurveys(result);

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const downloadSurvey = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await WebinarSeriesSurveysQuestion.query()
      .select(
        "webinar_series_surveys_questions.question",
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 1 then 1 else 0 end)`
        ).as("Sangat Tidak Puas"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 2 then 1 else 0 end)`
        ).as("Tidak Puas"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 3 then 1 else 0 end)`
        ).as("Cukup Puas"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 4 then 1 else 0 end)`
        ).as("Puas"),
        WebinarSeriesSurveys.raw(
          `SUM (case when webinar_series_surveys.value = 5 then 1 else 0 end)`
        ).as("Sangat Puas"),
        "webinar_series_surveys.webinar_series_id"
      )
      .joinRelated("webinar_series_surveys")
      .where("webinar_series_surveys.webinar_series_id", id)
      .andWhere("webinar_series_surveys_questions.type", "scale")
      .groupBy(
        "webinar_series_surveys_questions.question",
        "webinar_series_surveys.webinar_series_id"
      );

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(result);

    xlsx.utils.book_append_sheet(wb, ws, "Survey");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "survey.xlsx"
    );

    res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

// download participants
const downloadParticipants = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await getReportWebinarSeries(id);
    const data = serializeDataReportParticipant(result?.rows);

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);

    xlsx.utils.book_append_sheet(wb, ws, "Peserta");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "peserta.xlsx"
    );

    res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const downloadRating = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await WebinarSeriesRating.query()
      .where("webinar_series_id", id)
      .withGraphFetched("[participant]")
      .orderBy("created_at", "desc")
      .orderBy("rating", "desc");

    const data = serializeDataReportRatings(result);

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

const serializeComments = (data) => {
  if (!data?.length) {
    return [];
  } else {
    const result = data?.map((item) => ({
      id: item?.id,
      nama: getNama(item?.participant),
      email: getEmail(item?.participant),
      cara_masuk: item?.participant?.group,
      komentar: item?.comment,
      waktu: moment(item?.created_at).format("DD-MM-YYYY HH:mm"),
      sub_comment_id: item?.webinar_series_comment_id,
    }));
    return result;
  }
};

const downloadComments = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await WebinrSeriesComments.query()
      .where("webinar_series_id", id)
      .withGraphFetched("[participant]")
      .orderBy("created_at", "desc");

    const data = serializeComments(result);

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);

    xlsx.utils.book_append_sheet(wb, ws, "Komentar");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "komentar.xlsx"
    );

    res.end(xlsx.write(wb, { type: "buffer", bookType: "xlsx" }));
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  downloadComments,
  downloadParticipants,
  downloadSurvey,
  downloadRating,
  reportSurvey,
};
