const crypto = require("crypto");
const { uploadFileMinio } = require("../utils");

const URL_FILE = "https://siasn.bkd.jatimprov.go.id:9000/public";

const upload = async (req, res) => {};

const uploadsMultipleFiles = async (req, res) => {
  const { buffer, originalname, size, mimetype } = req?.file;
  const id = crypto.randomBytes(20).toString("hex");
  const currentFilename = `${id}_${originalname}`;

  try {
    // size must be less than 30 MB
    if (size > 30000000) {
      res.status(400).json({ code: 400, message: "File size is too large" });
    } else {
      await uploadFileMinio(req.mc, buffer, currentFilename, size, mimetype);
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
