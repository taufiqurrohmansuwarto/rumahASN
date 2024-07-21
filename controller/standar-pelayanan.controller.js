const StandarPelayanan = require("@/models/standar_pelayanan.model");

const findStandarPelayanan = async (req, res) => {
  try {
    const result = await StandarPelayanan.query();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const findStandarPelayananById = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await StandarPelayanan.query().findById(id);
    if (!result) {
      res.json(null);
    } else {
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const createStandarPelayanan = async (req, res) => {
  try {
    const { customId: user_id } = req?.user;
    const { body } = req;

    const payload = {
      user_id,
      ...body,
    };

    await StandarPelayanan.query().insert(payload);

    return res.status(200).json({
      message: "Success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const updateStandarPelayanan = async (req, res) => {
  try {
    const { id } = req?.query;
    const body = req?.body;
    await StandarPelayanan.query().where("id", id).update(body);
    return res.status(200).json({
      message: "Success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const deleteStandarPelayanan = async (req, res) => {
  try {
    const { id } = req?.query;
    await StandarPelayanan.query().where("id", id).patch({
      is_active: false,
    });
    return res.status(200).json({
      message: "Success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  findStandarPelayanan,
  findStandarPelayananById,
  createStandarPelayanan,
  updateStandarPelayanan,
  deleteStandarPelayanan,
};
