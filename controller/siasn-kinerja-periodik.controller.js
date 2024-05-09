const { getRwKinerjaPeriodik } = require("@/services/siasn-services");

const handleKinerjaPeriodikResponse = async (nip, res) => {
  try {
    const data = await getRwKinerjaPeriodik(nip);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getKinerjaPeriodikPersonal = async (req, res) => {
  const { employeeNumber: nip } = req.user;
  await handleKinerjaPeriodikResponse(nip, res);
};

const getKinerjaPeriodikByNip = async (req, res) => {
  const { nip } = req.query;
  await handleKinerjaPeriodikResponse(nip, res);
};

module.exports = {
  getKinerjaPeriodikPersonal,
  getKinerjaPeriodikByNip,
};
