const WebinarSeries = require("@/models/webinar-series.model");
const WebinarSeriesParticipates = require("@/models/webinar-series-participates.model");
const User = require("@/models/users.model");
const { uploadFileMinio, typeGroup, wordToPdf } = require("@/utils/index");
const { toLower } = require("lodash");
const { createSignature } = require("@/utils/bsre-fetcher");

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
          builder.where("title", "like", `%${search}%`);
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

const listParticipants = async (req, res) => {
  try {
    const { id } = req?.query;

    const limit = req.query.limit || 25;
    const page = req.query.page || 1;
    const search = req.query.search || "";

    const result = await WebinarSeriesParticipates.query()
      .where("webinar_series_id", id)
      .page(parseInt(page) - 1, parseInt(limit))
      .withGraphFetched("[participant(simpleSelect)]");

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

const detailWebinarAdmin = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await WebinarSeries.query().findById(id);

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

    res.json({
      ...result,
      image: imageUrl,
      template: templateUrl,
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
  const type = req.query.type || "all";

  const currentUser = req?.user.customId;

  const group = toLower(req?.user?.group);
  const userType = typeGroup(group);

  try {
    if (type === "all") {
      const result = await WebinarSeries.query()
        .page(page - 1, limit)
        // andWhere type participant include userType
        .andWhereRaw(`type_participant::text LIKE '%${userType}%'`)
        .andWhere("open_registration", "<=", new Date().toISOString())
        .andWhere("close_registration", ">=", new Date().toISOString())
        .where("status", "published");

      let promises = [];

      result.results.forEach((item) => {
        promises.push(
          WebinarSeriesParticipates.query()
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
    }
    if (type === "upcoming") {
      const result = await WebinarSeries.query()
        .page(page - 1, limit)
        .where("status", "published")
        .andWhereRaw(`type_participant::text LIKE '%${userType}%'`)
        .andWhere("start_date", ">", new Date().toISOString());

      const data = {
        data: checkReady(result.results),
        limit: parseInt(limit),
        page: parseInt(page),
        total: result.total,
      };
      res.json(data);
    }
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

    const result = await WebinarSeriesParticipates.query()
      .withGraphFetched("[webinar_series]")
      .where("user_id", customId)
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

const detailWebinarUser = async (req, res) => {
  try {
    const { id } = req.query;
    const { customId } = req.user;

    const result = await WebinarSeriesParticipates.query()
      .where("user_id", customId)
      .andWhere("webinar_series_id", id)
      .first();

    if (result) {
      const hasil = await WebinarSeries.query().findById(id);
      res.json(hasil);
    } else {
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const registerWebinar = async (req, res) => {
  try {
    const { customId } = req.user;
    const { id } = req.query;

    // check in webinar series table if status is published or current date is between open_registration and close_registration
    const currentWebinarSeries = await WebinarSeries.query()
      .where("id", id)
      .andWhere("status", "published")
      .andWhere("open_registration", "<=", new Date().toISOString())
      .andWhere("close_registration", ">=", new Date().toISOString())
      .first();

    if (!currentWebinarSeries) {
      res
        .status(400)
        .json({ code: 400, message: "Webinar series is not ready" });
    } else {
      const result = await WebinarSeriesParticipates.query()
        .insert({
          user_id: customId,
          webinar_series_id: id,
        })
        .onConflict(["user_id", "webinar_series_id"])
        .merge();

      res.json(result);
    }
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

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const uploadTemplateAndImage = async (req, res) => {
  try {
    const { buffer, originalname, size, mimetype } = req?.file;
    const wordType = req?.body?.type === "word";
    const imageType = req?.body?.type === "image";

    const wordMimeType =
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const imageMimeType = mimetype === "image/jpeg" || mimetype === "image/png";

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
    } else {
      res.status(400).json({ code: 400, message: "File type is not allowed" });
    }

    // // size must be less than 30 MB
    // if (size > 30000000) {
    //   res.status(400).json({ code: 400, message: "File size is too large" });
    // } else {
    //   await uploadFileWebinar(req.mc, buffer, currentFilename, size, mimetype);
    //   const result = `${URL_FILE}/${currentFilename}`;
    //   res.json(result);
    // }
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
      .where("user_id", customId)
      .andWhere("webinar_series_id", id)
      .first();

    // check in webinar series is allowed download ceritficate is true
    const currentWebinarSeries = await WebinarSeries.query()
      .where("id", id)
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
      const numberCertificate = `BKD-${id}`;

      await WebinarSeriesParticipates.query()
        .patch({
          certificate_number: numberCertificate,
        })
        .where("user_id", customId)
        .andWhere("webinar_series_id", id);

      const templateUrl = currentWebinarSeries?.certificate_template;

      const currentUser = await User.query()
        .where("custom_id", customId)
        .first();

      const pdf = await wordToPdf(templateUrl, currentUser);
      const username = req?.user?.name;
      const title = currentWebinarSeries?.title;

      const pdfTitle = `${username}-${title}.pdf`;

      // res.setHeader("Content-Disposition", `attachment; filename=${pdfTitle}`);
      // res.setHeader("Content-Type", "application/pdf");
      // pdf.pipe(res);

      let buffer = [];

      pdf.on("data", (chunk) => {
        buffer.push(chunk);
      });

      pdf.on("end", async () => {
        try {
          const pdfData = Buffer.concat(buffer);

          const result = await createSignature({
            id: "test",
            file: pdfData,
          });

          if (!result?.success) {
            res.status(400).json({ code: 400, message: result?.data?.error });
          } else {
            const base64File = result?.data?.base64_signed_file;

            const buffer = Buffer.from(base64File, "base64");

            res.setHeader(
              "Content-Disposition",
              `attachment; filename=${pdfTitle}`
            );

            res.setHeader("Content-Type", "application/pdf");
            res.send(buffer);
          }
        } catch (error) {
          console.log(error);
          res.status(400).json({ code: 400, message: "Internal Server Error" });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  downloadCertificate,
  uploadTemplateAndImage,

  listAdmin,
  detailWebinarAdmin,
  createWebinar,
  updateWebinar,
  deleteWebinar,

  allWebinars,
  listUser,
  detailWebinarUser,
  registerWebinar,
  unregisterWebinar,

  listParticipants,
};
