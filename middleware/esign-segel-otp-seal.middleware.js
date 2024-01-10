const { requestSealOtp } = require("@/utils/esign-utils");

module.exports = async (req, res, next) => {
  try {
    const result = req.result;
    const { totp } = result;
    const hasil = await requestSealOtp({ totp });
    req.totpSeal = hasil?.data?.totp;

    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
