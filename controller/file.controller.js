const path = require("path");
const crypto = require("crypto");
const { uploadFileMinio } = require("../utils");
const sharp = require("sharp");

const URL_FILE = "https://siasn.bkd.jatimprov.go.id:9000/public";

const upload = async (req, res) => {
  const { buffer, originalname, size, mimetype } = req?.file;
  const id = crypto.randomBytes(20).toString("hex");
  const currentFilename = `${id}_${originalname}`;
  const bufferCompress = await sharp(buffer).resize(300).toBuffer();

  try {
    await uploadFileMinio(
      req.mc,
      bufferCompress,
      currentFilename,
      size,
      mimetype
    );
    const result = `${URL_FILE}/${currentFilename}`;
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  upload,
};
