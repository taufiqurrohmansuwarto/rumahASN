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

        if (!result?.otp_seal) {
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
            await AppBsreSeal.query()
              .patch({ otp_seal: hasilSeal?.data?.totp })
              .where("id", result.id);

            req.id = result.id;
            req.totpSeal = hasilSeal?.data?.totp;
            req.totp = result.totp_activation_code;
            req.idSubscriber = result.id_subscriber;
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
        } else {
          req.id = result.id;
          req.totp = result.totp_activation_code;
          req.totpSeal = result.otp_seal;
          req.idSubscriber = result.id_subscriber;
          next();
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
