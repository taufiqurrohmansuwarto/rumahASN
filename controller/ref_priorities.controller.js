const Priorities = require("../models/priorities.model");

module.exports.index = async (req, res) => {
  try {
    // ga usah dipaging aja ya
    const result = await Priorities.query();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

module.exports.detail = async (req, res) => {
  try {
    const { id } = req.query;

    const result = await Priorities.query().findById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

module.exports.update = async (req, res) => {
  try {
    const { id } = req.query;
    await Priorities.query().findById(id).patch(req.body);
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

module.exports.create = async (req, res) => {
  try {
    const result = await Priorities.query().insert(req.body);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

module.exports.remove = async (req, res) => {
  try {
    const { id } = req.query;
    await Priorities.query().deleteById(id);
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
