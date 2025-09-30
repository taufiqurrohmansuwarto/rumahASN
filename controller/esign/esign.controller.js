require("dotenv").config();
const { verifyUserWithNik } = require("@/utils/esign-utils");
const SiasnEmployee = require("@/models/siasn-employees.model");

const isProduction = process.env.NODE_ENV === "production";

// remove ' from string
const removeChar = (str) => {
  return str.replace(/[^0-9]/g, "");
};

export const checkTTEUser = async (req, res) => {
  try {
    const { employeeNumber: nip } = req?.user;
    let nik;
    if (!isProduction) {
      nik = process.env.ESIGN_NIK;
    } else {
      const result = await SiasnEmployee.query().where("nip_baru", nip).first();
      nik = result?.nik;
    }

    const result = await verifyUserWithNik({ nik: removeChar(nik) });

    res.json(result);
  } catch (error) {
    console.error("Error in checkTTEUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
