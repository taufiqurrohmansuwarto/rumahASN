const crypto = require("crypto");
const { uploadFileMinio } = require("../utils");
const { uploadFileToMinio } = require("@/utils/helper/minio-helper");

const URL_FILE = "https://siasn.bkd.jatimprov.go.id:9000/public";

const upload = async (req, res) => {};

const uploadsMultipleFiles = async (req, res) => {
  const { buffer, originalname, size, mimetype } = req?.file;
  const id = crypto.randomBytes(20).toString("hex");

  // mimetype to format
  const format = mimetype.split("/")[1];

  const currentFilename = `${id}.${format}`;

  try {
    // size must be less than 30 MB
    if (size > 30000000) {
      res.status(400).json({ code: 400, message: "File size is too large" });
    } else {
      const metadata = {
        "Content-Type": mimetype,
        "uploaded-by": req.user.customId,
        "uploaded-at": new Date().toISOString(),
        "original-filename": originalname,
        "file-size": size.toString(),
        "file-format": format,
        "upload-id": id,
        "user-agent": req.headers["user-agent"] || "unknown",
        "ip-address": req.ip || req.connection.remoteAddress || "unknown",
        "X-Amz-Meta-Uploaded-By": req.user.customId,
        "X-Amz-Meta-Upload-Date": new Date().toISOString(),
        "X-Amz-Meta-Original-Name": originalname,
        "X-Amz-Meta-File-Size": size.toString(),
        "X-Amz-Meta-Upload-Id": id,
      };
      await uploadFileToMinio(
        req.mc,
        "public",
        buffer,
        currentFilename,
        size,
        mimetype,
        metadata
      );
      const result = `${URL_FILE}/${currentFilename}`;
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  upload,
  uploadsMultipleFiles,
};
