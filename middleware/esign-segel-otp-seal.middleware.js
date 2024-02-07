const {
  requestSealOtp,
  requestSealOtpWithIdSubscriber,
} = require("@/utils/esign-utils");
const DsSegelTOTP = require("@/models/ds-segel-totp.model");
const LogSealBsre = require("@/models/log-seal-bsre.model");
const AppBsreSeal = require("@/models/app_bsre_seal.model");

// app seal
const appSealBsre = require("@/models/app_bsre_seal.model");

module.exports = async (req, res, next) => {
  const { customId: userId } = req?.user;
  const webinar = req?.webinar;
  try {
    if (webinar?.type_sign === "PERSONAL_SIGN") {
      next();
    } else {
      const result = await appSealBsre.query().first();

      // check didatabase kalau tidak ada
      if (!result?.totp_activation_code) {
        res.status(404).json({
          message:
            "TOTP belum digenerate, silahkan hubungi admin untuk melakukan generate TOTP",
        });
      } else {
        const requestData = {
          totp: result.totp_activation_code,
          idSubscriber: result.id_subscriber,
        };

        const hasilSeal = await requestSealOtpWithIdSubscriber(requestData);

        if (hasilSeal?.success) {
          const dataSuccessLog = {
            user_id: userId,
            action: "REQUEST_SEAL_OTP",
            status: "SUCCESS",
            request_data: JSON.stringify(requestData),
            response_data: JSON.stringify(hasilSeal),
            description: "Request Seal OTP",
          };

          await LogSealBsre.query().insert(dataSuccessLog);
          req.totpSeal = hasilSeal?.data?.totp;
          next();
        } else {
          const dataErrorLog = {
            user_id: userId,
            action: "REQUEST_SEAL_OTP",
            status: "ERROR",
            request_data: JSON.stringify(requestData),
            response_data: JSON.stringify(hasilSeal),
            description: "Request Seal OTP",
          };

          await LogSealBsre.query().insert(dataErrorLog);
          res
            .status(500)
            .json({ code: 500, message: hasilSeal?.data?.message });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
