const { getSealActivationOTP, verifyPdf } = require("@/utils/esign-utils");
const DSSegelTOTP = require("@/models/ds-segel-totp.model");
const LogSealBsre = require("@/models/log-seal-bsre.model");

// admin request totp confirmation
const requestTotpConfirmation = async (req, res) => {
  try {
    const result = await getSealActivationOTP();
    const { customId: userId } = req?.user;

    if (result?.success) {
      const dataSuccessLog = {
        user_id: userId,
        action: "REQUEST_TOTP",
        status: "SUCCESS",
        request_data: JSON.stringify({}),
        response_data: JSON.stringify(result),
        description: "Request TOTP Seal Activation",
      };

      await LogSealBsre.query().insert(dataSuccessLog);
      res.json(result?.data);
    } else {
      const dataErrorLog = {
        user_id: userId,
        action: "REQUEST_TOTP",
        status: "ERROR",
        request_data: JSON.stringify({}),
        response_data: JSON.stringify(result),
        description: "Request TOTP Seal Activation",
      };

      await LogSealBsre.query().insert(dataErrorLog);
      res.status(500).json({ code: 500, message: result?.data?.message });
    }
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

const verifyPdfController = async (req, res) => {
  try {
    const { file } = req?.body;
    const result = await verifyPdf({ file });

    if (result?.success) {
      res.json({ success: true, data: result?.data });
    } else {
      res.status(500).json({ success: false, data: result?.data });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  requestTotpConfirmation,
  saveTotpConfirmation,
  getLastTotpConfirmation,
  verifyPdfController,
};
