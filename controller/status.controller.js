const Status = require("../models/status.model");

module.exports.index = async (req, res) => {
  try {
    const result = await Status.query();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
