const { handleError } = require("@/utils/helper/controller-helper");

export const getDMSScoringController = async (req, res) => {
  try {
    const { dmsFetcher } = req;
    const { nip } = req.query;
    const response = await dmsFetcher.get(`/manajemen/data-profile/${nip}`);
    const data = response.data?.data;
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};
