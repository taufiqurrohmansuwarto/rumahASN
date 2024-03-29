const LogSIASN = require("@/models/log-siasn.model");
const LogBsre = require("@/models/log-bsre.model");
const LogSealBsre = require("@/models/log-seal-bsre.model");

const indexLogBsre = async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 25;

    const result = await LogBsre.query()
      .page(parseInt(page) - 1, parseInt(limit))
      .withGraphFetched(
        "[user(simpleSelect), webinar_series_participates.[webinar_series(selectName)] ]"
      )
      .orderBy("created_at", "desc");

    const data = {
      data: result.results,
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const indexLogSiasn = async (req, res) => {
  try {
    const type = req?.query?.type || "";
    const siasnService = req?.query?.siasn_service || "";
    const employeeNumber = req?.query?.employeeNumber || "";
    const action = req?.query?.action || "";

    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 10;

    const result = await LogSIASN.query()
      .where((builder) => {
        if (type) {
          builder.where("type", "ilike", `%${type}%`);
        }
        if (siasnService) {
          builder.where("siasn_service", "ilike", `%${siasnService}%`);
        }
        if (employeeNumber) {
          builder.where("employee_number", "ilike", `%${employeeNumber}%`);
        }
        if (action) {
          builder.where("action", "ilike", `%${action}%`);
        }
      })
      .page(parseInt(page) - 1, parseInt(limit))
      .withGraphFetched("user(fullSelect)")
      .orderBy("created_at", "desc");

    const data = {
      data: result.results,
      total: result.total,
      page,
      limit,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const indexLogBsreSeal = async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 25;
    const username = req?.query?.search || "";

    let query = LogSealBsre.query()
      .select("log_seal_bsre.id", "user_id", "action", "status", "created_at")
      .withGraphFetched("user(simpleSelect)")
      .page(parseInt(page) - 1, parseInt(limit))
      .orderBy("created_at", "desc");

    if (username) {
      query
        .joinRelated("user")
        .where("user.username", "ilike", `%${username}%`);
    }

    const result = await query;

    res.json({
      data: result.results,
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const dataLogSealById = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await LogSealBsre.query()
      .select("request_data", "response_data")
      .where("id", id)
      .first();

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  indexLogSiasn,
  indexLogBsreSeal,
  indexLogBsre,
  dataLogSealById,
};
