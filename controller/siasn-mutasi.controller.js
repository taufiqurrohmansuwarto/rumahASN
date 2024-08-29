const { fetchIntegratedMutasi } = require("@/utils/siasn-utils");

const integratedMutasi = async (req, res) => {
  try {
    const body = req.body;
    const { siasnRequest: request } = req;
    const payload = {
      nip: body.nip,
      instansi_id: body.instansi_id,
    };
    const result = await fetchIntegratedMutasi(request, payload);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  integratedMutasi,
};
