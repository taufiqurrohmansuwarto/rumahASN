// siasn
const User = require("@/models/users.model");

// pemberhentian
const listLayananSIASN = ["kenaikan-pangkat", "pemberhentian", "skk"];
const listLayananMaster = [];

const layananTrackingSiasn = async (req, res) => {
  try {
    const { jenis_layanan, nip } = req?.query;
    const { customId: userId } = req?.user;

    console.log(listLayananSIASN.includes(jenis_layanan));

    const { fetcher } = req;

    const currentUser = await User.query().findById(userId);

    if (currentUser?.group !== "MASTER") {
      res.status(403).json({
        message: "Forbidden",
      });
    } else {
      if (listLayananSIASN.includes(jenis_layanan)) {
        const result = await fetcher.get(
          `/siasn-ws/layanan/${jenis_layanan}/${nip}`
        );
        res.json(result?.data);
      } else {
        res.status(400).json({
          message: "Bad Request",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const layananTrackingSimaster = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports = {
  layananTrackingSiasn,
  layananTrackingSimaster,
};
