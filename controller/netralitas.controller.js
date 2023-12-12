const captchaKey = process.env.RECAPTCHA_SECRET_KEY;
const LaporanNetralitas = require("@/models/laporan-netralitas.model");
const { nanoid } = require("nanoid");
const { uploadFileMinio } = require("../utils");
const axios = require("axios");

const Minio = require("minio");

const minioConfig = {
  port: parseInt(process.env.MINIO_PORT),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  endPoint: process.env.MINIO_ENDPOINT,
};

const mc = new Minio.Client(minioConfig);

const URL_FILE = "https://siasn.bkd.jatimprov.go.id:9000/public";

const updateNetralitas = async (req, res) => {
  try {
    const { body } = req;
    const {
      user: { customId },
    } = req;
    const id = req?.query;

    const result = await LaporanNetralitas.query()
      .patch({
        ...body,
        operator: customId,
      })
      .where("id", id);

    res.json({ message: "Success", data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getNetralitas = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;

    const result = await LaporanNetralitas.query()
      .orderBy("created_at", "desc")
      .page(parseInt(page - 1), parseInt(limit));

    res.json({
      results: result.results,
      meta: {
        total: result.total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const uploadMultiplesFiles = async (request, files) => {
  try {
    files.forEach(async (file) => {
      await uploadFileMinio(
        request,
        file.buffer,
        file?.name,
        file?.size,
        file?.mimetype
      );
    });
  } catch (error) {
    console.log(error);
  }
};

const createPostNetralitas = async (req, res) => {
  try {
    const files = req?.files;

    if (files?.length > 0) {
      const body = req?.body;

      // get total size files
      let totalSize = 0;
      files?.forEach((file) => {
        totalSize += file.size;
      });

      // check total size files if total size files more than 25mb
      if (totalSize > 25000000) {
        return res.status(400).json({ message: "File size is too large" });
      } else {
        const hasil = await axios.post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${captchaKey}&response=${body?.captcha}`
        );

        if (hasil.data.success === false) {
          return res.status(400).json({ message: "Captcha is not valid" });
        } else {
          let renamingFiles = files?.map((file) => {
            const { mimetype, buffer, size } = file;
            const format = mimetype.split("/")[1];
            const newFilename = `${nanoid(10)}.${format}`;
            return {
              name: newFilename,
              url: `${URL_FILE}/${newFilename}`,
              buffer,
              size,
              mimetype,
            };
          });

          let newFiles = renamingFiles?.map((file) => ({
            name: file.name,
            url: file.url,
          }));

          await uploadMultiplesFiles(mc, renamingFiles);

          const { captcha, ...payload } = body;

          const data = {
            ...payload,
            files: newFiles,
          };

          const result = await LaporanNetralitas.query().insert(data);
          res.status(200).json({ message: "Success", data: result });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createPostNetralitas,
  getNetralitas,
  updateNetralitas,
};
