const WebinarSeries = require("@/models/webinar-series.model");
const WebinarSeriesParticipates = require("@/models/webinar-series-participates.model");
const WebinarSeriesSurveys = require("@/models/webinar-series-surveys.model");
const WebinarSeriesComments = require("@/models/webinar-series-comments.model");

const LogSealBsre = require("@/models/log-seal-bsre.model");

const { nanoid } = require("nanoid");

const Users = require("@/models/users.model");

// rating
const WebinarSeriesRatings = require("@/models/webinar-series-ratings.model");

// absensi
const AbsenceEntry = require("@/models/webinar-series-absence-entries.model");
const AbsenceParticipant = require("@/models/webinar-series-participants-absence.model");

const User = require("@/models/users.model");
const {
  uploadFileMinio,
  typeGroup,
  uploadSertifikatToMinio,
} = require("@/utils/index");

const {
  wordToPdf,
  generateWebinarCertificate,
  generateCertificateWithUserInformation,
  viewCertificateWithUserInformation,
} = require("@/utils/certificate-utils");

const { toLower, template } = require("lodash");
const { createSignature, createQrFromId } = require("@/utils/bsre-fetcher");
const { parseMarkdown } = require("@/utils/parsing");
const {
  sealPdf,
  requestSealOtpWithIdSubscriber,
} = require("@/utils/esign-utils");
const { default: axios } = require("axios");
const AppBsreSeal = require("@/models/app_bsre_seal.model");

const URL_FILE = "https://siasn.bkd.jatimprov.go.id:9000/public";

const checkReadyRegistration = (data) => {
  const { open_registration, close_registration } = data;
  const currentDate = new Date().toISOString();

  if (
    currentDate >= new Date(open_registration).toISOString() &&
    currentDate <= new Date(close_registration).toISOString()
  ) {
    return true;
  } else {
    return false;
  }
};

const checkReady = (data) => {
  if (!data?.length) {
    return [];
  } else {
    return data?.map((item) => {
      return {
        ...item,
        ready_registration: checkReadyRegistration(item),
      };
    });
  }
};

// admin
const listAdmin = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const search = req.query.search || "";

    const result = await WebinarSeries.query()
      .select(
        "*",
        WebinarSeries.relatedQuery("participates")
          .count()
          .as("participants_count")
      )
      .where((builder) => {
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
      })
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    const data = {
      data: result.results,
      limit: parseInt(limit),
      page: parseInt(page),
      total: result.total,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const serialize = (data) => {
  if (!data?.length) {
    return [];
  } else {
    return data?.map((d) => ({
      title: d?.title,
      value: parseInt(d?.value, 10),
    }));
  }
};

const listParticipants = async (req, res) => {
  try {
    const { id } = req?.query;

    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const search = req.query.search || "";

    let query;

    query = WebinarSeriesParticipates.query()
      .select(
        "webinar_series_participates.id",
        "webinar_series_id",
        "user_id",
        "already_poll",
        "is_registered",
        "created_at",
        "updated_at",
        "is_generate_certificate"
      )
      .where("webinar_series_id", id)
      .page(parseInt(page) - 1, parseInt(limit))
      .withGraphFetched("[participant(fullSelect)]")
      .orderBy("created_at", "desc");

    if (search) {
      query
        .joinRelated("participant")
        .where("username", "ilike", `%${search}%`);
    }

    const result = await query;
    const aggregasiPerangkatDaerah = await User.query()
      .select(
        User.raw(
          "split_part(info->'perangkat_daerah'->>'detail', '-', 1) AS title"
        )
      )
      .count("user_id as value")
      .joinRelated("webinar_series_participates")
      .where("webinar_series_participates.webinar_series_id", id)
      .groupBy(
        User.raw("split_part(info->'perangkat_daerah'->>'detail', '-', 1)")
      )
      .limit(10)
      .orderBy("value", "desc");

    const aggregasiJabatan = await User.query()
      .select(User.raw("info->'jabatan'->>'jabatan' AS title"))
      .where("webinar_series_participates.webinar_series_id", id)
      .count("user_id as value")
      .joinRelated("webinar_series_participates")
      .groupBy(User.raw("info->'jabatan'->>'jabatan'"))
      .limit(10)
      .orderBy("value", "desc");

    const totalParticipantsNotGenerateCertificate =
      await WebinarSeriesParticipates.query()
        .where("webinar_series_id", id)
        .andWhere("is_generate_certificate", false)
        .count("id");

    const totalParticipantsGenerateCertificate =
      await WebinarSeriesParticipates.query()
        .where("webinar_series_id", id)
        .andWhere("is_generate_certificate", true)
        .count("id");

    const aggregateCertificate = [
      {
        type: "Sudah Generate",
        value: parseInt(totalParticipantsGenerateCertificate[0].count) || 0,
      },
      {
        type: "Belum Generate",
        value: parseInt(totalParticipantsNotGenerateCertificate[0].count) || 0,
      },
    ];

    const data = {
      data: result.results,
      limit: parseInt(limit),
      page: parseInt(page),
      total: result.total,
    };

    res.json({
      result: data,
      aggregate: {
        perangkat_daerah: serialize(aggregasiPerangkatDaerah),
        jabatan: serialize(aggregasiJabatan),
        certificate: aggregateCertificate,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const detailWebinarAdmin = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await WebinarSeries.query()
      .findById(id)
      .select(
        "*",
        WebinarSeries.relatedQuery("participates")
          .count()
          .as("participants_count")
      );

    const imageUrl = result?.image_url
      ? [
          {
            uid: id,
            name: "image",
            status: "done",
            url: result?.image_url,
          },
        ]
      : [];

    const templateUrl = result?.certificate_template
      ? [
          {
            uid: id,
            name: `template-${result?.id}.docx`,
            status: "done",
            url: result?.certificate_template,
          },
        ]
      : [];

    // total participants
    const totalParticipants = await WebinarSeriesParticipates.query()
      .where("webinar_series_id", id)
      .count();

    // total comments
    const totalComments = await WebinarSeriesComments.query()
      .where("webinar_series_id", id)
      .count();

    // average ratings
    const averageRatings = await WebinarSeriesRatings.query()
      .where("webinar_series_id", id)
      .avg("rating");

    const participants = totalParticipants[0]?.count || 0;
    const comments = totalComments[0]?.count || 0;
    const ratings = averageRatings[0]?.avg || 0;

    const aggregate = {
      participants,
      comments,
      ratings: parseInt(ratings) || 0,
    };

    res.json({
      ...result,
      description_markdown: parseMarkdown(result?.description),
      image: imageUrl,
      template: templateUrl,
      ...aggregate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createWebinar = async (req, res) => {
  try {
    const { customId } = req.user;
    const body = req.body;

    const result = await WebinarSeries.query().insert({
      ...body,
      created_by: customId,
      updated_by: customId,
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateWebinar = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req.user;
    const body = req.body;

    const result = await WebinarSeries.query()
      .patch({
        ...body,
        updated_by: customId,
      })
      .where("id", id);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteWebinar = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await WebinarSeries.query().deleteById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const allWebinars = async (req, res) => {
  const limit = req.query.limit || 25;
  const page = req.query.page || 1;
  const search = req.query.search || "";

  const sort = req.query.sort || "tanggalTerdekat";

  const currentUser = req?.user.customId;

  const group = toLower(req?.user?.group);
  const role = toLower(req?.user?.role);
  const userType = typeGroup(group, role);

  try {
    const query = WebinarSeries.query()
      .page(page - 1, limit)
      .andWhere((builder) => {
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
      })
      .andWhereRaw(`type_participant::text LIKE '%${userType}%'`)
      .where("status", "published");

    if (sort === "tanggalTerdekat") {
      query.orderByRaw(
        "ABS(EXTRACT(EPOCH FROM age(start_date, CURRENT_TIMESTAMP)))"
      );
    } else if (sort === "tanggalEvent") {
      query.orderBy("start_date", "asc");
    } else if (sort === "asc") {
      query.orderBy("title", "asc");
    } else if (sort === "desc") {
      query.orderBy("title", "desc");
    }

    const result = await query.page(page - 1, limit);

    let promises = [];

    result.results.forEach((item) => {
      promises.push(
        WebinarSeriesParticipates.query()
          .select(
            "id",
            "webinar_series_id",
            "user_id",
            "already_poll",
            "is_registered",
            "created_at",
            "updated_at",
            "is_generate_certificate"
          )
          .where("user_id", currentUser)
          .andWhere("webinar_series_id", item.id)
          .first()
      );
    });

    const isUserRegistered = await Promise.all(promises);

    const currentData = result.results.map((item, index) => {
      return {
        ...item,
        is_registered: isUserRegistered[index] ? true : false,
      };
    });

    const data = checkReady(currentData);

    const hasil = {
      data,
      limit: parseInt(limit),
      page: parseInt(page),
      total: result.total,
    };
    res.json(hasil);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const detailAllWebinar = async (req, res) => {
  try {
    const { id } = req?.query;
    const { group, role } = req?.user;

    const userType = typeGroup(group, role);

    const currentData = await WebinarSeries.query()
      .select(
        "*",
        WebinarSeries.relatedQuery("participates")
          .count()
          .as("participants_count")
      )
      .where("id", id)
      .andWhere("status", "published")
      .andWhereRaw(`type_participant::text LIKE '%${userType}%'`)
      .first();

    const isUserRegistered = await WebinarSeriesParticipates.query()
      .select(
        "id",
        "webinar_series_id",
        "user_id",
        "already_poll",
        "is_registered",
        "created_at",
        "updated_at",
        "is_generate_certificate"
      )
      .where("user_id", req?.user?.customId)
      .andWhere("webinar_series_id", id)
      .first();

    const { zoom_url, youtube_url, reference_link, ...last } = currentData;

    const data = {
      ...last,
      description_markdown: parseMarkdown(last?.description),
      is_registered: isUserRegistered ? true : false,
      my_webinar: isUserRegistered?.id,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// user
const listUser = async (req, res) => {
  try {
    const { customId } = req.user;
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const search = req.query.search || "";

    let query = WebinarSeriesParticipates.query().select(
      "id",
      "webinar_series_id",
      "user_id",
      "already_poll",
      "is_registered",
      "created_at",
      "updated_at",
      "is_generate_certificate"
    );

    if (!search) {
      query = query
        .withGraphFetched("[webinar_series]")
        .where("user_id", customId)
        .page(page - 1, limit);
    } else {
      query = query
        .joinRelated("webinar_series")
        .withGraphFetched("[webinar_series]")
        .where("user_id", customId)
        .andWhere("webinar_series.title", "ilike", `%${search}%`)
        .page(page - 1, limit);
    }

    const result = await query;

    const data = {
      data: result.results,
      limit: parseInt(limit),
      page: parseInt(page),
      total: result.total,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const detailWebinarUser = async (req, res) => {
  try {
    const { id } = req.query;
    const { customId } = req.user;

    const result = await WebinarSeriesParticipates.query()
      .select(
        "id",
        "webinar_series_id",
        "user_id",
        "already_poll",
        "is_registered",
        "created_at",
        "updated_at",
        "is_generate_certificate",
        "user_information"
      )
      .where("id", id)
      .andWhere("user_id", customId)
      .withGraphFetched("[webinar_series]")
      .first();

    if (result) {
      const hasil = await WebinarSeries.query()
        .findById(result?.webinar_series_id)
        .select(
          "*",
          WebinarSeries.relatedQuery("participates")
            .count()
            .as("participants_count")
        );

      const currentWebinarSeriesRating = await WebinarSeriesRatings.query()
        .where("webinar_series_id", result?.webinar_series_id)
        .andWhere("user_id", customId)
        .first();

      // daftar absensi
      const absenceEntry = await AbsenceEntry.query().where(
        "webinar_series_id",
        result?.webinar_series_id
      );

      // absensi untuk user
      const absenceUser = await AbsenceParticipant.query()
        .whereIn(
          "webinar_series_absence_entry_id",
          absenceEntry.map((item) => item.id)
        )
        .andWhere("user_id", customId);

      const absensiTerpenuhi = absenceUser?.length === absenceEntry?.length;

      const sudahPoll = result?.already_poll;
      const sudahMengisiInformasiUser = !!result?.user_information;

      const syaratTerpenuhi =
        absensiTerpenuhi && sudahPoll && sudahMengisiInformasiUser;

      const absensi = {
        absence_entry: absenceEntry,
        absence_user: absenceUser,
        get_certificate: syaratTerpenuhi,
      };

      let deskripsi_tte_sertifikat = "";
      let status_download = "";

      const documentSudahDitandatangani = result?.is_generate_certificate;

      const syaratPersonalSignerTerpenuhi =
        syaratTerpenuhi &&
        hasil?.type_sign === "PERSONAL_SIGN" &&
        documentSudahDitandatangani;

      const syaratSealTerpenuhi =
        syaratTerpenuhi &&
        hasil?.type_sign === "SEAL" &&
        documentSudahDitandatangani;

      const syaratPersonalSignerTidakTerpenuhi =
        syaratTerpenuhi &&
        hasil?.type_sign === "PERSONAL_SIGN" &&
        !documentSudahDitandatangani;

      const syaratSealTidakTerpenuhi =
        syaratTerpenuhi &&
        hasil?.type_sign === "SEAL" &&
        !documentSudahDitandatangani;

      if (syaratPersonalSignerTerpenuhi) {
        status_download = "DOWNLOAD_PERSONAL_SIGNER";
      } else if (syaratSealTerpenuhi) {
        status_download = "DOWNLOAD_SEAL";
      } else if (syaratPersonalSignerTidakTerpenuhi) {
        status_download = "BELUM_TANDATANGAN_PERSONAL_SIGNER";
      } else if (syaratSealTidakTerpenuhi) {
        status_download = "BELUM_TANDATANGAN_SEAL";
      } else {
        status_download = "BELUM_TANDATANGAN";
      }

      if (hasil?.type_sign === "SEAL") {
        deskripsi_tte_sertifikat =
          "Sertifikat ini menggunakan Segel Elektronik Rumah ASN";
      } else if (hasil?.type_sign === "PERSONAL_SIGN") {
        deskripsi_tte_sertifikat =
          "Sertifikat ini menggunakan Tanda Tangan Personal";
      }

      res.json({
        result,
        description_markdown: parseMarkdown(hasil?.description),
        webinar_series: {
          ...hasil,
          description_markdown: parseMarkdown(hasil?.description),
          my_rating: currentWebinarSeriesRating?.rating,
          my_rating_comment: currentWebinarSeriesRating?.comments,
          already_rating: currentWebinarSeriesRating ? true : false,
          ...absensi,
          user_information: result?.user_information,
          deskripsi_tte_sertifikat,
          status_download,
          syarat: {
            sudah_absen: absensiTerpenuhi,
            sudah_poll: sudahPoll,
            sudah_mengisi_informasi_user: sudahMengisiInformasiUser,
          },
        },
      });
    } else {
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const unregisterUserWebinar = async (req, res) => {
  try {
    const { customId } = req.user;
    const { id } = req.query;

    const currentParticipates = await WebinarSeriesParticipates.query()
      .select(
        "id",
        "webinar_series_id",
        "user_id",
        "already_poll",
        "is_registered",
        "created_at",
        "updated_at",
        "is_generate_certificate"
      )
      .where("id", id)
      .andWhere("user_id", customId)
      .first();

    if (!currentParticipates) {
      res.status(400).json({ code: 400, message: "You are not registered" });
    } else {
      await User.query()
        .patch({
          info: null,
        })
        .where("custom_id", customId);

      await WebinarSeriesParticipates.query()
        .delete()
        .where("user_id", customId)
        .andWhere("id", id);

      await WebinarSeriesSurveys.query()
        .delete()
        .where("user_id", customId)
        .andWhere("webinar_series_id", currentParticipates?.webinar_series_id);

      await WebinarSeriesRatings.query()
        .delete()
        .where("user_id", customId)
        .andWhere("webinar_series_id", currentParticipates?.webinar_series_id);

      res.json({
        message: "Berhasil membatalkan pendaftaran",
        code: 200,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const registerWebinar = async (req, res) => {
  try {
    const { customId, group } = req.user;
    const { id } = req.query;
    const body = req?.body || {};

    // check in webinar series table if status is published or current date is between open_registration and close_registration
    const currentWebinarSeries = await WebinarSeries.query()
      .where("id", id)
      .andWhere("status", "published")
      .andWhere("is_open", true)
      .first();

    if (!currentWebinarSeries) {
      res
        .status(400)
        .json({ code: 400, message: "Webinar series is not ready" });
    } else {
      let currentBody = {};
      // if user group from google he must be fill information eg: nama, jabatan, perangkat daerah
      if (group === "GOOGLE") {
        currentBody = {
          ...body,
        };

        // update user information group google
        await Users.query()
          .patch({
            info: currentBody,
          })
          .where("custom_id", customId);
      }

      const result = await WebinarSeriesParticipates.query()
        .insert({
          user_id: customId,
          webinar_series_id: id,
        })
        .onConflict(["user_id", "webinar_series_id"])
        .merge();

      await WebinarSeriesSurveys.query()
        .delete()
        .where("user_id", customId)
        .andWhere("webinar_series_id", id);

      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateInformationWebinarSeries = async (req, res) => {
  try {
    const { customId, group } = req?.user;

    const id = req?.query?.id;
    const user_information = req?.body;

    await WebinarSeriesParticipates.query()
      .patch({
        user_information,
      })
      .where({
        user_id: customId,
        id,
      });

    // karena sudah terlanjur membaca dari user info maka di entri 2x di table user
    if (group === "GOOGLE") {
      const info = {
        jabatan: {
          jabatan: user_information?.jabatan,
        },
        username: user_information?.name,
        gelar_depan: "",
        gelar_belakang: "",
        employee_number: user_information?.employee_number,
        perangkat_daerah: {
          detail: user_information?.instansi,
        },
      };

      await User.query()
        .patch({
          info,
        })
        .where("custom_id", customId);
    }

    res.json({
      message: "Berhasil mengisi informasi",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const unregisterWebinar = async (req, res) => {
  try {
    const { customId } = req.user;
    const { id } = req.query;

    const result = await WebinarSeriesParticipates.query()
      .delete()
      .where("user_id", customId)
      .andWhere("webinar_series_id", id);

    await User.query()
      .patch({
        info: null,
      })
      .where("custom_id", customId);

    await WebinarSeriesSurveys.query()
      .delete()
      .where("user_id", customId)
      .andWhere("webinar_series_id", id);

    await WebinarSeriesRatings.query()
      .delete()
      .where("user_id", customId)
      .andWhere("webinar_series_id", id);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const uploadTemplateAndImage = async (req, res) => {
  try {
    // menyimpan dalam bentuk buffer ke minio
    const { buffer, originalname, size, mimetype } = req?.file;
    const wordType = req?.body?.type === "word";
    const imageType = req?.body?.type === "image";
    const pdfType = req?.body?.type === "pdf";

    const wordMimeType =
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const imageMimeType = mimetype === "image/jpeg" || mimetype === "image/png";
    const pdfMimeType = mimetype === "application/pdf";

    if (imageMimeType && imageType) {
      const fileType = mimetype === "image/jpeg" ? "jpg" : "png";
      const currentFilename = `image-${req?.query?.id}.${fileType}`;
      await uploadFileMinio(req.mc, buffer, currentFilename, size, mimetype);
      const result = `${URL_FILE}/${currentFilename}`;

      await WebinarSeries.query()
        .patch({
          image_url: result,
        })
        .where("id", req?.query?.id);

      const data = [
        {
          uid: req?.query?.id,
          name: currentFilename,
          status: "done",
          url: result,
        },
      ];

      res.json(data);
    } else if (wordMimeType && wordType) {
      const currentFilename = `template-${req?.query?.id}.docx`;
      await uploadFileMinio(req.mc, buffer, currentFilename, size, mimetype);
      const result = `${URL_FILE}/${currentFilename}`;

      await WebinarSeries.query()
        .patch({
          certificate_template: result,
        })
        .where("id", req?.query?.id);

      const data = [
        {
          uid: req?.query?.id,
          name: currentFilename,
          status: "done",
          url: result,
        },
      ];

      res.json(data);
    } else if (pdfMimeType && pdfType) {
      const currentFilename = `template-${req?.query?.id}.pdf`;
      console.log({ currentFilename, size, mimetype });
      await uploadFileMinio(req.mc, buffer, currentFilename, size, mimetype);
      const result = `${URL_FILE}/${currentFilename}`;

      await WebinarSeries.query()
        .patch({
          certificate_template: result,
        })
        .where("id", req?.query?.id);

      const data = [
        {
          uid: req?.query?.id,
          name: currentFilename,
          status: "done",
          url: result,
        },
      ];

      res.json(data);
    } else {
      res.status(400).json({ code: 400, message: "File type is not allowed" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const { id } = req.query;
    const { customId } = req?.user;

    const result = await WebinarSeriesParticipates.query()
      .select(
        "id",
        "webinar_series_id",
        "user_id",
        "already_poll",
        "is_registered",
        "created_at",
        "updated_at",
        "is_generate_certificate",
        "user_information",
        "document_sign",
        "document_sign_at",
        "user_information",
        "document_sign_url"
      )
      .where("id", id)
      .andWhere("user_id", customId)
      .first();

    // check in webinar series is allowed download ceritficate is true
    const currentWebinarSeries = await WebinarSeries.query()
      .where("id", result?.webinar_series_id)
      // .andWhere("certificate_template", "!=", null)
      .andWhere("is_allow_download_certificate", true)
      .andWhere("status", "published")
      .first();

    if (!result) {
      res.status(400).json({ code: 400, message: "You are not registered" });
    } else if (!currentWebinarSeries) {
      res.status(400).json({
        code: 400,
        message: "Akses download sertifikat belum siap",
      });
    } else {
      // check if user already generate certificate
      if (result?.document_sign) {
        res.json(result?.document_sign);
      } else if (result?.document_sign_url) {
        // download file using axios and return to base64
        const response = await axios.get(
          `${URL_FILE}${result?.document_sign_url}`,
          {
            responseType: "arraybuffer",
          }
        );
        const base64 = Buffer.from(response.data, "binary").toString("base64");
        res.json(base64);
      } else {
        // jika belum generate maka generate dulu kalau ini menggunakan seal
        const numberCertificate = currentWebinarSeries?.certificate_number;
        const templateUrl = currentWebinarSeries?.certificate_template;

        const certificate = {
          url: templateUrl,
          user: {
            nama: result?.user_information?.name,
            employee_number: result?.user_information?.employee_number,
            jabatan: result?.user_information?.jabatan,
            instansi: result?.user_information?.instansi,
          },
          nomer_sertifikat: numberCertificate,
          id: result?.id,
          attributes: currentWebinarSeries?.template_attributes,
        };

        const userSertificate = await generateCertificateWithUserInformation(
          certificate
        );

        if (userSertificate?.success) {
          const data = {
            totp: req?.totpSeal,
            idSubscriber: req?.idSubscriber,
            file: userSertificate?.file,
          };

          const sealDocument = await sealPdf(data);

          if (sealDocument?.success) {
            const successLog = {
              user_id: customId,
              action: "SEAL_CERTIFICATE",
              status: "SUCCESS",
              request_data: JSON.stringify({
                totp: req?.totpSeal,
                idSubscriber: req?.idSubscriber,
              }),
              response_data: JSON.stringify({
                message: "success",
              }),
              description: "Seal Certificate",
            };

            await LogSealBsre.query().insert(successLog);

            const fileNameUpload = `${id}.pdf`;

            await uploadSertifikatToMinio(
              req?.mc,
              fileNameUpload,
              sealDocument?.data?.file[0]
            );

            // update the database
            await WebinarSeriesParticipates.query()
              .patch({
                is_generate_certificate: true,
                // document_sign: sealDocument?.data?.file[0],
                document_sign_at: new Date(),
                document_sign_url: `/certificates/${fileNameUpload}`,
              })
              .where("id", id)
              .andWhere("user_id", customId);

            res.json(sealDocument?.data?.file[0]);
          } else {
            const errorLog = {
              user_id: customId,
              action: "SEAL_CERTIFICATE",
              status: "ERROR",
              request_data: JSON.stringify({
                totp: req?.totpSeal,
                idSubscriber: req?.idSubscriber,
              }),
              response_data: JSON.stringify(sealDocument?.data),
              description: "Seal Certificate",
            };

            await LogSealBsre.query().insert(errorLog);

            const requestData = {
              totp: req?.totp,
              idSubscriber: req?.idSubscriber,
            };

            if (sealDocument?.data?.error === "TOTP Salah") {
              const result = await requestSealOtpWithIdSubscriber(requestData);
              if (result?.success) {
                await AppBsreSeal.query()
                  .patch({
                    otp_seal: result?.data?.totp,
                  })
                  .where("id", req?.id);

                await LogSealBsre.query().insert({
                  user_id: customId,
                  action: "REQUEST_OTP_SEAL",
                  status: "SUCCESS",
                  request_data: JSON.stringify(requestData),
                  response_data: JSON.stringify(result?.data),
                  description: "Request OTP Seal",
                });

                res
                  .status(400)
                  .json({ code: 400, message: sealDocument?.data?.message });
              } else {
                await LogSealBsre.query().insert({
                  user_id: customId,
                  action: "REQUEST_OTP_SEAL",
                  status: "ERROR",
                  request_data: JSON.stringify(requestData),
                  response_data: JSON.stringify(result?.data),
                  description: "Request OTP Seal",
                });
                res
                  .status(400)
                  .json({ code: 400, message: sealDocument?.data?.message });
              }
            } else {
              res
                .status(400)
                .json({ code: 400, message: sealDocument?.data?.message });
            }
          }
        } else {
          res
            .status(400)
            .json({ code: 400, message: userSertificate?.data?.message });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkCertificate = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await WebinarSeriesParticipates.query()
      .findById(id)
      .select(
        "id",
        "webinar_series_id",
        "user_id",
        "already_poll",
        "is_registered",
        "created_at",
        "updated_at",
        "is_generate_certificate"
      );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resetCertificates = async (req, res) => {
  try {
    const { id } = req?.query;

    await WebinarSeriesParticipates.query()
      .patch({
        is_generate_certificate: false,
        document_sign: null,
        document_sign_at: null,
        document_sign_url: null,
      })
      .where("webinar_series_id", id);

    res.status(200).json({
      message: "Berhasil mereset sertifikat",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const viewCertificate = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await WebinarSeries.query().where("id", id).first();

    if (!result) {
      res.json(null);
    } else if (!result?.certificate_template) {
      res.json(null);
    } else if (result?.certificate_template) {
      const hasil = await viewCertificateWithUserInformation({
        attributes: result?.template_attributes,
        url: result?.certificate_template,
        id,
      });

      res.json(hasil);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const customEditSertificate = async (req, res) => {
  try {
    const { id } = req?.query;

    const body = req?.body;

    const result = await WebinarSeries.query()
      .patch({
        template_attributes: body,
      })
      .where("id", id);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTemplateSettingSertificate = async (req, res) => {
  try {
    const { id } = req?.query;

    const result = await WebinarSeries.query().where("id", id).first();

    if (!result) {
      res.json({});
    } else {
      res.json(result?.template_attributes);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getTemplateSettingSertificate,
  customEditSertificate,
  viewCertificate,
  checkCertificate,
  downloadCertificate,
  uploadTemplateAndImage,
  listAdmin,
  detailWebinarAdmin,
  createWebinar,
  updateWebinar,
  deleteWebinar,

  allWebinars,
  detailAllWebinar,

  listUser,
  detailWebinarUser,
  registerWebinar,
  unregisterWebinar,
  updateInformationWebinarSeries,

  unregisterUserWebinar,
  listParticipants,

  resetCertificates,
};
