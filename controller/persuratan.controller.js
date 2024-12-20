const Headers = require("@/models/letter_managements/headers.model");

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
    const headers = await Headers.query().where("user_id", customId);
    res.json(headers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createHeaderSurat = async (req, res) => {
  try {
    const { customId } = req?.user;
    const {
      skpdId,
      namaInstansi,
      namaPerangkatDaerah,
      alamat,
      telepon,
      lamanWeb,
      email,
    } = req?.body;
    const header = await Headers.query().insert({
      skpdId,
      namaInstansi,
      namaPerangkatDaerah,
      alamat,
      telepon,
      lamanWeb,
      email,
      user_id: customId,
    });
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
    const {
      skpdId,
      namaInstansi,
      namaPerangkatDaerah,
      alamat,
      telepon,
      lamanWeb,
      email,
    } = req?.body;
    const header = await Headers.query()
      .findById(id)
      .where("user_id", customId)
      .patch({
        skpdId,
        namaInstansi,
        namaPerangkatDaerah,
        alamat,
        telepon,
        lamanWeb,
        email,
      });
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
