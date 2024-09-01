const BezJf = require("@/models/bez-jf.model");
const xlsx = require("xlsx");

const find = async (req, res) => {
  try {
    const result = await BezJf.query().wihtagraphFetched("jenjang");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findOne = async (req, res) => {
  try {
    const { kode } = req.query;
    const result = await BezJf.query().findOne.where("kode", kode);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const create = async (req, res) => {
  try {
    const { body } = req;
    await BezJf.query().insert(body);
    res.json({
      message: "Data has been inserted",
      data: body,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req?.query;
    const data = req?.body;
    await BezJf.query().update(data).where("kode", id);
    res.json({
      message: "Data has been updated",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req?.query;
    await BezJf.query().delete().where("kode", id);
    res.json({ message: "Data has been deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const upload = async (req, res) => {
  try {
    const { file } = req;
    const workbook = xlsx.read(file?.buffer);
    const sheet_name_list = workbook.SheetNames;
    const xlData = xlsx.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );

    const payload = xlData;

    await BezJf.query().insert(payload).onConflict("kode").merge();

    res.json({ message: "Data has been uploaded" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  upload,
  find,
  findOne,
  create,
  update,
  remove,
};
