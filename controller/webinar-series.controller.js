const WebinarSeries = require("@/models/webinar-series.model");
const WebinarSeriesParticipates = require("@/models/webinar-series-participates.model");
const { uploadFileMinio } = require("@/utils/index");

const URL_FILE = "https://siasn.bkd.jatimprov.go.id:9000/public";

// admin
const listAdmin = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const result = await WebinarSeries.query().page(page - 1, limit);

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

    const templateUrl = result?.template_url
      ? [
          {
            uid: id,
            name: "template",
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

// user
const listUser = async (req, res) => {
  try {
    const { customId } = req.user;
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const result = await WebinarSeriesParticipates.query()
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

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const registerWebinar = async (req, res) => {
  try {
    const { customId } = req.user;
    const { id } = req.query;

    const result = await WebinarSeriesParticipates.query()
      .insert({
        user_id: customId,
        webinar_series_id: id,
      })
      .onConflict(["user_id", "webinar_series_id"])
      .merge();

    res.json(result);
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
      const currentFilename = `template-${req?.query?.id}.doc`;
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

module.exports = {
  uploadTemplateAndImage,

  listAdmin,
  detailWebinarAdmin,
  createWebinar,
  updateWebinar,
  deleteWebinar,

  listUser,
  detailWebinarUser,
  registerWebinar,
  unregisterWebinar,
};
