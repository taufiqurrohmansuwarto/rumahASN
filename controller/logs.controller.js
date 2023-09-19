const LogSIASN = require("@/models/log-siasn.model");

const indexLogSiasn = async (req, res) => {
  try {
    const type = req?.query?.type || "";
    const siasnService = req?.query?.siasn_service || "";
    const employeeNumber = req?.query?.employeeNumber || "";

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
      })
      .page(parseInt(page) - 1, parseInt(limit))
      .withGraphFetched("user(simpleSelect)")
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

module.exports = {
  indexLogSiasn,
};
