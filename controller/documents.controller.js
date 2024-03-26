const { checkFileMinioSK, downloadFileSK } = require("../utils");

const downloadDocument = async (req, res) => {
  try {
    const { employee_number } = req?.user;
    const type = req.query.employee_type || "PNS";
    const file = req?.query?.file || "";
    const tmt = req?.query?.tmt || "";

    const fileName = `${file}_${tmt}_${employee_number}.pdf`;

    const mc = req.mc;

    let folder = "";

    if (type === "PNS") {
      folder = "sk_pns";
    }

    if (type === "PPPK") {
      folder = "sk_pppk";
    }

    const path = `${folder}/${fileName}`;
    const result = await checkFileMinioSK(mc, path);

    if (!result) {
      res.json(null);
    } else {
      const hasil = await downloadFileSK(mc, path);
      res.json(hasil);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error checking document" });
  }
};

const checkDocument = async (req, res) => {
  try {
    const { employee_number } = req?.user;
    const type = req.query.employee_type || "PNS";
    const file = req?.query?.file || "";
    const tmt = req?.query?.tmt || "";

    const fileName = `${file}_${tmt}_${employee_number}.pdf`;

    const mc = req.mc;

    let folder = "";

    if (type === "PNS") {
      folder = "sk_pns";
    }

    if (type === "PPPK") {
      folder = "sk_pppk";
    }

    const path = `${folder}/${fileName}`;
    const result = await checkFileMinioSK(mc, path);

    if (!result) {
      res.json(null);
    } else {
      res.json(true);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error checking document" });
  }
};

module.exports = {
  checkDocument,
  downloadDocument,
};
