const LogSIASN = require("@/models/log-siasn.model");
const LogBsre = require("@/models/log-bsre.model");
const LogSealBsre = require("@/models/log-seal-bsre.model");
const UserHistory = require("@/models/users-histories.model");

const dayjs = require("dayjs");
const { raw } = require("objection");
const { handleError } = require("@/utils/helper/controller-helper");

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
    const bulan = req?.query?.bulan || "";
    const mandiri = req?.query?.mandiri || false;

    const {
      user: { customId },
    } = req;

    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 10;

    const startDate = dayjs(bulan, "YYYY-MM").startOf("month").toDate();
    const endDate = dayjs(bulan, "YYYY-MM").endOf("month").toDate();

    let query = LogSIASN.query()
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
        if (bulan) {
          builder
            .where("created_at", ">=", startDate)
            .where("created_at", "<=", endDate);
        }
        if (mandiri === "true" || mandiri === true) {
          builder.where("user_id", customId);
        }
      })
      .withGraphFetched("user(simpleWithEmployeeNumber)")
      .orderBy("created_at", "desc");

    let result;

    if (parseInt(limit) === 0 || limit === "-1" || limit === -1) {
      // Get all data without pagination
      result = await query;

      const data = {
        data: result,
        total: result.length,
      };

      res.json(data);
    } else {
      // Use pagination
      result = await query.page(parseInt(page) - 1, parseInt(limit));

      const data = {
        data: result.results,
        total: result.total,
        page,
        limit,
      };

      res.json(data);
    }
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
    const month = req?.query?.month || "";

    const startDate = dayjs(month, "YYYY-MM").startOf("month").toDate();
    const endDate = dayjs(month, "YYYY-MM").endOf("month").toDate();

    let query = LogSealBsre.query()
      .select("log_seal_bsre.id", "user_id", "action", "status", "created_at")
      .withGraphFetched("user(simpleWithImage)")
      .orderBy("created_at", "desc");

    if (username) {
      query
        .joinRelated("user")
        .where("user.username", "ilike", `%${username}%`);
    }

    if (month) {
      query
        .where("created_at", ">=", startDate)
        .where("created_at", "<=", endDate);
    }

    if (limit === -1 || limit === "-1") {
      const result = await query;
      res.json(result);
    } else {
      const results = await query.page(parseInt(page) - 1, parseInt(limit));
      const data = {
        data: results.results,
        total: results.total,
        page: parseInt(page),
        limit: parseInt(limit),
      };

      res.json(data);
    }
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

const indexLogSiasnDashboard = async (req, res) => {
  try {
    const { month } = req?.query;

    const startDate = dayjs(month, "YYYY-MM").startOf("month").toDate();
    const endDate = dayjs(month, "YYYY-MM").endOf("month").toDate();

    const knex = LogSIASN.knex();

    const result = await knex.raw(`SELECT
    all_services.siasn_service,
    COALESCE(monthly_count.total, 0) as total
FROM (
    SELECT DISTINCT siasn_service
    FROM public.log_siasn
    WHERE siasn_service IS NOT NULL
) as all_services
LEFT JOIN (
    SELECT
        siasn_service,
        COUNT(*) as total
    FROM public.log_siasn
    WHERE
        EXTRACT(YEAR FROM created_at) = ${dayjs(month, "YYYY-MM").year()}
        AND EXTRACT(MONTH FROM created_at) = ${
          dayjs(month, "YYYY-MM").month() + 1
        }
    GROUP BY siasn_service
) as monthly_count ON all_services.siasn_service = monthly_count.siasn_service
ORDER BY all_services.siasn_service;`);

    const hasil = result?.rows?.map((item) => ({
      label: item.siasn_service.toUpperCase(),
      value: parseInt(item.total),
    }));

    const serialize = hasil.map((item) => ({
      label: item.label.toUpperCase(),
      value: parseInt(item.value),
    }));

    res.json(serialize);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const indexLogUsersPreferences = async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 20;
    const month = req?.query?.month || "";
    const startDate = dayjs(month, "YYYY-MM").startOf("month").toDate();
    const endDate = dayjs(month, "YYYY-MM").endOf("month").toDate();

    const query = UserHistory.query()
      .where("type", "preferences")
      .withGraphFetched("user(simpleWithEmployeeNumber)")
      .where((builder) => {
        if (month) {
          builder
            .where("created_at", ">=", startDate)
            .where("created_at", "<=", endDate);
        }
      })
      .orderBy("created_at", "desc");

    if (limit === -1 || limit === "-1") {
      const result = await query;
      res.json(result);
    } else {
      const results = await query.page(parseInt(page) - 1, parseInt(limit));
      const data = {
        data: results.results,
        total: results.total,
        page: parseInt(page),
        limit: parseInt(limit),
      };

      res.json(data);
    }
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  indexLogSiasn,
  indexLogBsreSeal,
  indexLogBsre,
  dataLogSealById,
  indexLogSiasnDashboard,
  indexLogUsersPreferences,
};
