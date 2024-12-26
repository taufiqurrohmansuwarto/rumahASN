const Headers = require("@/models/letter_managements/headers.model");
import axios from "axios";
import { TemplateHandler } from "easy-template-x";

const url = "https://siasn.bkd.jatimprov.go.id:9000/public/cek_header.docx";

export const checkHeaderSurat = async (req, res) => {
  try {
    const { id } = req.query;
    const header = await Headers.query().findById(id);
    const template = await axios.get(url, { responseType: "arraybuffer" });
    const templateHandler = new TemplateHandler();
    const result = await templateHandler.process(template.data, header);

    const fileBuffer = Buffer.from(result, "utf-8");
    // to base64
    const fileBase64 = fileBuffer.toString("base64");

    res.json({ success: true, data: fileBase64 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHeaderSurat = async (req, res) => {
  try {
    const { id } = req.query;
    const header = await Headers.query().findById(id);
    res.json(header);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const findHeaderSurat = async (req, res) => {
  try {
    const { customId } = req?.user;
    const headers = await Headers.query()
      .where("user_id", customId)
      .withGraphFetched("user(simpleSelect)")
      .orderBy("created_at", "desc");
    res.json(headers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createHeaderSurat = async (req, res) => {
  try {
    const { customId } = req?.user;
    const data = req?.body;

    const payload = {
      ...data,
      user_id: customId,
      nama_instansi: "Pemerintah Provinsi Jawa Timur",
    };

    const header = await Headers.query().insert(payload);
    res.json(header);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHeaderSurat = async (req, res) => {
  try {
    const { id } = req.query;
    const { customId } = req?.user;
    const data = req?.body;

    const payload = {
      ...data,
      user_id: customId,
    };

    const header = await Headers.query()
      .findById(id)
      .where("user_id", customId)
      .patch(payload);

    res.json(header);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHeaderSurat = async (req, res) => {
  try {
    const { id } = req.query;
    const { customId } = req?.user;
    const header = await Headers.query()
      .findById(id)
      .where("user_id", customId)
      .delete();
    res.json(header);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
