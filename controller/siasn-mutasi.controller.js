const { handleError } = require("@/utils/helper/controller-helper");
const { listImut } = require("@/utils/siasn-utils");

const listImutController = async (req, res) => {
  try {
    const { siasnRequest: fetcher } = req;
    const result = await listImut(fetcher, req.query);
    res.json(result?.data);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  listImutController,
};
