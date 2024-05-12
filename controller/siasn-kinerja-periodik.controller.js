const { rwKinerjaPeriodik } = require("@/utils/siasn-utils");

const handleKinerjaPeriodikResponse = async (req, res, nip) => {
  try {
    const fetcher = req?.siasnRequest;
    const data = await rwKinerjaPeriodik(fetcher, nip);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getKinerjaPeriodikPersonal = async (req, res) => {
  const { employeeNumber: nip } = req.user;
  await handleKinerjaPeriodikResponse(req, res, nip);
};

const getKinerjaPeriodikByNip = async (req, res) => {
  const { nip } = req.query;
  await handleKinerjaPeriodikResponse(req, res, nip);
};

module.exports = {
  getKinerjaPeriodikPersonal,
  getKinerjaPeriodikByNip,
};
