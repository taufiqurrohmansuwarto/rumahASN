const { handleError } = require("@/utils/helper/controller-helper");
const { nanoid } = require("nanoid");

export const getDMSScoringController = async (req, res) => {
  try {
    const { dmsFetcher } = req;
    const randomString = nanoid(5);
    const { nip } = req.query;
    await dmsFetcher.get(`/arsip-pns/process/${nip}?rand=${randomString}`);
    const response = await dmsFetcher.get(`/manajemen/data-profile/${nip}`);

    const data = response.data?.data;
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getDMSScoringControllerByNip = async (req, res) => {
  try {
    const { dmsFetcher } = req;
    const { employee_number: nip } = req.user;
    const randomString = nanoid(5);
    await dmsFetcher.get(`/arsip-pns/process/${nip}?rand=${randomString}`);
    const response = await dmsFetcher.get(`/manajemen/data-profile/${nip}`);
    const data = response.data?.data;
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};
