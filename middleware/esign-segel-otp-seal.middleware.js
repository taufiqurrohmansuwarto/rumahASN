const { requestSealOtpWithIdSubscriber } = require("@/utils/esign-utils");
const LogSealBsre = require("@/models/log-seal-bsre.model");

// app seal
const AppBsreSeal = require("@/models/app_bsre_seal.model");

module.exports = async (req, res, next) => {
  const { customId: userId } = req?.user;
  const webinar = req?.webinar;
  try {
    if (webinar?.type_sign === "PERSONAL_SIGN") {
      next();
    } else {
      const result = await AppBsreSeal.query().first();

      if (!result?.totp_activation_code) {
        res
          .status(500)
          .json({ message: "Cannot get  TOTP Seal. Please generate TOTP" });
      } else {
        const totp = result?.totp_activation_code;
        const idSubscriber = result?.id_subscriber;

        const requestData = {
          totp,
          idSubscriber,
        };

        const hasilSeal = await requestSealOtpWithIdSubscriber(requestData);

        if (hasilSeal.success) {
          const successLog = {
            user_id: userId,
            action: "REQUEST_SEAL_OTP",
            status: "SUCCESS",
            request_data: JSON.stringify(requestData),
            response_data: JSON.stringify(hasilSeal),
            description: "Request Seal OTP",
          };

          await LogSealBsre.query().insert(successLog);
          req.totpSeal = hasilSeal?.data?.totp;
          req.idSubscriber = idSubscriber;
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
