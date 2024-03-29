const {
  getRwPendidikanMaster,
  getRwKedudukanHukum: kedudukanHukum,
  getRwPindah,
} = require("@/utils/master.utils");

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

module.exports = {
  rwPendidikanSIMASTER,
  rwPendidikanSIMASTERByNip,
  rwKedudukanHukumByNip,
  rwPindahByNip,
};
