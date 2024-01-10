const DSSegelTOTP = require("@/models/ds-segel-totp.model");
const { getSealActivationOTP } = require("@/utils/esign-utils");
const moment = require("moment");

function extractCode(str) {
  const regex = /\((\d+)\s/g;
  const match = regex.exec(str);

  if (match && match[1]) {
    return match[1];
  } else {
    return null; // or any other appropriate error handling
  }
}

module.exports = async (req, res, next) => {
  try {
    // filter totp not expired
    const lastTotpActivation = await DSSegelTOTP.query()
      .where({
        type: "SEAL_ACTIVATION",
      })
      .first()
      .orderBy("created_at", "desc");

    const expiredAt = lastTotpActivation?.expired_at;

    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    if (moment(now).isAfter(expiredAt) || !lastTotpActivation) {
      const getTotp = await getSealActivationOTP();

      const message = getTotp?.data?.message;
      const totp = extractCode(message);

      const add24Hours = moment()
        .add(24, "hours")
        ?.format("YYYY-MM-DD HH:mm:ss");
      const data = {
        totp,
        type: "SEAL_ACTIVATION",
        expired_at: add24Hours,
      };
      await DSSegelTOTP.query().insert(data);

      const result = {
        message: "TOTP is generated",
        totp,
      };

      req.result = result;

      next();
    } else {
      const result = {
        message: "TOTP is already exists",
        totp: lastTotpActivation?.totp,
      };

      req.result = result;
      next();
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
