const BezJf = require("@/models/bez-jf.model");

const find = async (req, res) => {
  try {
    const result = await BezJf.query();
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
    const { kode, nama, jf } = req.body;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const update = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  find,
  findOne,
  create,
  update,
  remove,
};
