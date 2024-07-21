const StandarPelayanan = require("@/models/standar_pelayanan.model");
const { toNumber } = require("lodash");

const findStandarPelayanan = async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 25;
    const search = req?.query?.search || "";

    const result = await StandarPelayanan.query()
      .where((builder) => {
        if (search) {
          builder.where("name", "ilike", `%${search}%`);
        }
      })
      .page(toNumber(page) - 1, toNumber(limit));

    const data = {
      data: result?.results,
      total: result?.total,
      page: toNumber(page),
      limit: toNumber(limit),
    };

    res.json(data);
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
    const result = await StandarPelayanan.query()
      .where("id", id)
      .first()
      .withGraphFetched("[user]");
    res.json(result);
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
