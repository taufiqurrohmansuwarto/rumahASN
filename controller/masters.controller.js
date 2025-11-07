const {
  getRwPendidikanMaster,
  getRwKedudukanHukum: kedudukanHukum,
  getRwPindah,
} = require("@/utils/master.utils");
const User = require("@/models/users.model");

const rwPendidikanSIMASTER = async (req, res) => {
  try {
    const { fetcher } = req;
    const { employee_number: nip } = req.user;

    const result = await getRwPendidikanMaster(fetcher, nip);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const rwPendidikanSIMASTERByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
    const result = await getRwPendidikanMaster(fetcher, nip);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const rwKedudukanHukumByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
    const result = await kedudukanHukum(fetcher, nip);

    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const rwPindahByNip = async (req, res) => {
  try {
    const { fetcher } = req;
    const { nip } = req.query;
    const result = await getRwPindah(fetcher, nip);
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

// cek fasilitator by opdId
const cekFasilitatorByOpdId = async (req, res) => {
  try {
    const { opdId } = req.query;

    if (!opdId) {
      res.json([]);
    } else {
      const result = await User.query()
        .select(
          "custom_id as id",
          "username as nama",
          "organization_id as opdId"
        )
        .where("organization_id", "=", `${opdId}`)
        .where("group", "MASTER")
        .where("role", "FASILITATOR")
        .orderBy("organization_id", "asc");

      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  cekFasilitatorByOpdId,
  rwPendidikanSIMASTER,
  rwPendidikanSIMASTERByNip,
  rwKedudukanHukumByNip,
  rwPindahByNip,
};
