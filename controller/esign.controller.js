const { getSealActivationOTP } = require("@/utils/esign-utils");
const DSSegelTOTP = require("@/models/ds-segel-totp.model");

// admin request totp confirmation
const requestTotpConfirmation = async (req, res) => {
  try {
    const result = await getSealActivationOTP();
    res.json(result?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// admin save totp confirmation
const saveTotpConfirmation = async (req, res) => {
  try {
    const { customId: userId } = req?.user;

    const { totp } = req?.body;
    const result = await DSSegelTOTP.query().insert({
      totp,
      type: "SEAL_ACTIVATION",
      user_id: userId,
    });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getLastTotpConfirmation = async (req, res) => {
  try {
    const result = await DSSegelTOTP.query()
      .where("type", "SEAL_ACTIVATION")
      .orderBy("created_at", "desc")
      .first();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  requestTotpConfirmation,
  saveTotpConfirmation,
  getLastTotpConfirmation,
};
