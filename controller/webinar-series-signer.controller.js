const { handleError } = require("@/utils/helper/controller-helper");
const WebinarSeries = require("@/models/webinar-series.model");

const showWebinarSeriesSigner = async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 10;
    const search = req?.query?.search || "";

    const { employee_number: employeeNumber } = req?.user;

    const baseQuery = WebinarSeries.query()
      .where("status", "published")
      .andWhere("use_personal_signer", true)
      .andWhere("employee_number_signer", employeeNumber);

    if (search) {
      baseQuery.where("title", "ilike", `%${search}%`);
    }

    const webinarSeries = await baseQuery
      .clone()
      .page(parseInt(page) - 1, parseInt(limit));

    const [countResult] = await baseQuery.clone().count();

    const total = parseInt(countResult.count);

    const data = {
      results: webinarSeries?.results,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    res.status(200).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  showWebinarSeriesSigner,
};
