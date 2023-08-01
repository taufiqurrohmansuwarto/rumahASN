const User = require("@/models/users.model");

const dataUtama = async (req, res) => {
  try {
    const { id } = req?.query;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const rwJabatan = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const rwPak = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

const rwSkp22 = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

module.exports = {
  dataUtama,
  rwJabatan,
  rwPak,
  rwSkp22,
};
